import { lookup as dnsLookup } from "node:dns";
import https from "node:https";
import { isIP, type LookupFunction } from "node:net";
import { MAX_IMAGE_BYTES } from "./sniff";

// Shown to staff, so the messages are written for them.
export class ImageFetchError extends Error {}

const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 10_000;

function blockedV4(ip: string): boolean {
  const [a, b, c] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function blockedV6(ip: string): boolean {
  const s = ip.toLowerCase();
  const mapped = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return blockedV4(mapped[1]);
  if (s.startsWith("::ffff:") || s.startsWith("64:ff9b:")) return true;
  const first = parseInt(s.split(":")[0] || "0", 16);
  if (first === 0) return true; // ::, ::1 and other reserved space
  if ((first & 0xfe00) === 0xfc00) return true; // private fc00::/7
  if ((first & 0xffc0) === 0xfe80) return true; // link-local fe80::/10
  if ((first & 0xff00) === 0xff00) return true; // multicast
  return false;
}

function isBlockedAddress(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return blockedV4(ip);
  if (kind === 6) return blockedV6(ip);
  return true;
}

// Runs for the real connection, so the address that was checked is the
// address that is used. This stops DNS tricks that point at private servers.
const safeLookup: LookupFunction = (hostname, options, callback) => {
  dnsLookup(hostname, { all: true }, (err, addresses) => {
    if (err) return callback(err, "", 0);
    if (
      addresses.length === 0 ||
      addresses.some((a) => isBlockedAddress(a.address))
    ) {
      return callback(new Error("blocked address") as NodeJS.ErrnoException, "", 0);
    }
    if (options.all) return callback(null, addresses);
    return callback(null, addresses[0].address, addresses[0].family);
  });
};

function parseUrl(raw: string): URL {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    throw new ImageFetchError("That does not look like a valid link.");
  }
  if (u.protocol !== "https:") throw new ImageFetchError("Only https links are allowed.");
  if (u.username || u.password) throw new ImageFetchError("Links with a login in them are not allowed.");
  if (u.port && u.port !== "443") throw new ImageFetchError("That link uses an unusual port, which is not allowed.");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host) && isBlockedAddress(host)) throw new ImageFetchError("That link points to a private address.");
  return u;
}

type Hop = { body?: Buffer; location?: string };

function getOnce(url: URL): Promise<Hop> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "GET",
        lookup: safeLookup,
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "user-agent": "RCW-Store-ImageImport/1.0",
          accept: "image/jpeg,image/png,image/webp,image/avif",
        },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400) {
          res.resume();
          resolve({ location: res.headers.location });
          return;
        }
        if (status !== 200) {
          res.resume();
          reject(new ImageFetchError(`That link answered with an error (${status}).`));
          return;
        }
        if (Number(res.headers["content-length"] ?? 0) > MAX_IMAGE_BYTES) {
          res.destroy();
          reject(new ImageFetchError("That image is over 4 MB. Use a smaller one."));
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        res.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_IMAGE_BYTES) {
            res.destroy();
            reject(new ImageFetchError("That image is over 4 MB. Use a smaller one."));
            return;
          }
          chunks.push(chunk);
        });
        res.on("end", () => resolve({ body: Buffer.concat(chunks) }));
        res.on("error", () => reject(new ImageFetchError("The download was interrupted.")));
      }
    );
    req.on("error", (e) =>
      reject(
        e instanceof ImageFetchError
          ? e
          : new ImageFetchError(
              "We could not download that link. Check it is public and points straight to an image."
            )
      )
    );
    req.end();
  });
}

export async function fetchRemoteImage(raw: string): Promise<Buffer> {
  let url = parseUrl(raw);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await getOnce(url);
    if (res.body) return res.body;
    if (!res.location) throw new ImageFetchError("That link redirected without saying where to.");
    url = parseUrl(new URL(res.location, url).toString());
  }
  throw new ImageFetchError("That link redirects too many times.");
}
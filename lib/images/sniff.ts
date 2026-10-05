export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // Vercel limits request bodies to about 4.5 MB

export type ImageKind = {
  ext: "jpg" | "png" | "webp" | "avif";
  mime: string;
};

// Decides the type from the file's own bytes. The file name and the
// content-type the sender claims are never trusted. SVG is not allowed.
export function sniffImage(b: Buffer): ImageKind | null {
  if (b.length < 16) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }
  if (
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) {
    return { ext: "png", mime: "image/png" };
  }
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    return { ext: "webp", mime: "image/webp" };
  }
  if (b.toString("ascii", 4, 12) === "ftypavif") {
    return { ext: "avif", mime: "image/avif" };
  }
  return null;
}
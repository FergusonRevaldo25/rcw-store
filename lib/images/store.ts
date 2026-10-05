import { put } from "@vercel/blob";
import type { ImageKind } from "./sniff";

export function storageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

// Saves a checked image and returns its public https address.
export async function storeProductImage(
  bytes: Buffer,
  kind: ImageKind
): Promise<string> {
  const blob = await put(`products/${crypto.randomUUID()}.${kind.ext}`, bytes, {
    access: "public",
    contentType: kind.mime,
    addRandomSuffix: false,
  });
  return blob.url;
}
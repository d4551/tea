/**
 * SHA-256 hash of a string payload, returned as hex.
 * Uses Bun.CryptoHasher (Bun-native) instead of node:crypto.
 */
export const sha256Hex = (payload: string): string => {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(payload);
  const digest = hasher.digest();
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

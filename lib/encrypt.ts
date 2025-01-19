const encoder = new TextEncoder();
const key = new TextEncoder().encode(process.env.ENCRYPTION_KEY);

// hash function with key-based encryption
export const hash = async (plainText: string): Promise<string> => {
  const encodedData = encoder.encode(plainText);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign", "verify"]
  );

  const hashBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encodedData);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// compare function using key from env var
export const compare = async (
  plainText: string,
  encryptedText: string
): Promise<boolean> => {
  const hashedText = await hash(plainText);
  return hashedText === encryptedText;
};

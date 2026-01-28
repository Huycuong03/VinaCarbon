import crypto from "crypto";

export function encode(data: string, secret: string) {
  return crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex");
}

export function getRandomString(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

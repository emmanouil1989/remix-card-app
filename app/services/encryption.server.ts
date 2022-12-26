import cypto from "crypto";
import invariant from "tiny-invariant";

invariant(process.env.ENCRYPTION_KEY, "ENCRYPTION_KEY must be set");

const algorithm = "aes-256-ctr";

const ENCRYPTION_KEY = cypto.scryptSync(process.env.ENCRYPTION_KEY, "salt", 32); // 32 bytes = 256 bits
const IV_LENGTH = 16;

function encrypt(text: string) {
  const iv = cypto.randomBytes(IV_LENGTH);
  const cipher = cypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text: string) {
  const [ivPart, encryptedPart] = text.split(":");
  if (!ivPart || !encryptedPart) {
    throw new Error("Invalid encrypted text");
  }
  const iv = Buffer.from(ivPart, "hex");
  const encryptedText = Buffer.from(encryptedPart, "hex");
  const decipher = cypto.createDecipheriv(algorithm, ENCRYPTION_KEY, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);
  return decrypted.toString();
}

export { encrypt, decrypt };

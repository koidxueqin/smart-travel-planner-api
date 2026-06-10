const crypto = require("crypto");
const AppError = require("./AppError");

const ALGORITHM = "aes-256-gcm";
const PREFIX = "enc:";

function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;

  if (!key || key.length !== 32) {
    throw new AppError("Encryption key is not configured properly", 500);
  }

  return Buffer.from(key, "utf8");
}

function encryptText(text) {
  if (!text || text.trim() === "") {
    return text;
  }

  if (text.startsWith(PREFIX)) {
    return text;
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

function decryptText(text) {
  if (!text || text.trim() === "") {
    return text;
  }

  if (!text.startsWith(PREFIX)) {
    return text;
  }

  const key = getEncryptionKey();
  const encryptedData = text.replace(PREFIX, "");
  const [ivHex, authTagHex, encrypted] = encryptedData.split(":");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

module.exports = {
  encryptText,
  decryptText
};
// ─────────────────────────────────────────────
// CRIPTOGRAFIA AES-256-GCM — Dados sensíveis
// Campos: CNPJ, CPF, faturamento
// ─────────────────────────────────────────────

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT = "meugerentepj_v1"; // Salt fixo para derivação — a ENCRYPTION_KEY já é secreta

/**
 * Deriva uma chave de 32 bytes a partir da ENCRYPTION_KEY usando scrypt.
 * Isso garante que mesmo uma key mais curta gere uma chave AES-256 válida.
 */
function deriveKey(): Buffer {
  const rawKey = process.env.ENCRYPTION_KEY;
  if (!rawKey) {
    throw new Error(
      "ENCRYPTION_KEY não configurada. Gere com: openssl rand -hex 32"
    );
  }
  return scryptSync(rawKey, SALT, 32);
}

/**
 * Criptografa um texto usando AES-256-GCM.
 * Retorna: iv:authTag:ciphertext (tudo em hex)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = deriveKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Formato: iv:authTag:ciphertext
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Descriptografa um texto criptografado com encrypt().
 * Aceita tanto texto cifrado quanto texto puro (para migração gradual).
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return ciphertext;

  // Se não tem o formato iv:authTag:cipher, retorna como está (dado não criptografado)
  const parts = ciphertext.split(":");
  if (parts.length !== 3) {
    return ciphertext; // Texto puro — migração gradual
  }

  try {
    const key = deriveKey();
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = parts[2];

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch {
    // Se falhar na descriptografia, assume que é texto puro (migração)
    return ciphertext;
  }
}

/**
 * Verifica se um valor já está criptografado.
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;
  const parts = value.split(":");
  return parts.length === 3 && parts[0].length === IV_LENGTH * 2;
}

/**
 * Criptografa um valor apenas se ainda não estiver criptografado.
 * Útil para migração gradual de dados existentes.
 */
export function encryptIfNeeded(value: string): string {
  if (!value || isEncrypted(value)) return value;
  return encrypt(value);
}

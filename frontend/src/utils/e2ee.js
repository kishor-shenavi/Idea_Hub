const DB_NAME = 'ideahub-keys';
const STORE_NAME = 'keypair';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Generates this device's key pair once, then reuses it forever after. The private key lives only
// as an opaque CryptoKey object inside IndexedDB — our code never calls exportKey on it, so it never
// leaves this function in a usable, exfiltratable form.
export async function getOrCreateKeyPair() {
  let pair = await idbGet('keyPair');
  if (pair) return pair;
  pair = await window.crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey']);
  await idbSet('keyPair', pair);
  return pair;
}

export async function exportPublicKeyJwk(publicKey) {
  return window.crypto.subtle.exportKey('jwk', publicKey);
}

export async function importPublicKeyJwk(jwk) {
  return window.crypto.subtle.importKey('jwk', jwk, { name: 'ECDH', namedCurve: 'P-256' }, true, []);
}

// Both participants run this with (their own private key, the other's public key) and get the
// IDENTICAL shared secret back — without either secret ever being transmitted anywhere.
export async function deriveSharedKey(myPrivateKey, theirPublicKey) {
  return window.crypto.subtle.deriveKey(
    { name: 'ECDH', public: theirPublicKey }, myPrivateKey,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

export async function encryptMessage(sharedKey, plaintext) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertextBuf = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, sharedKey, encoded);
  return { ciphertext: bufToBase64(ciphertextBuf), iv: bufToBase64(iv) };
}

export async function decryptMessage(sharedKey, ciphertextB64, ivB64) {
  try {
    const plainBuf = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBuf(ivB64) }, sharedKey, base64ToBuf(ciphertextB64)
    );
    return new TextDecoder().decode(plainBuf);
  } catch {
    return '[Unable to decrypt this message]';
  }
}

function bufToBase64(buf) { return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function base64ToBuf(b64) { return Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer; }
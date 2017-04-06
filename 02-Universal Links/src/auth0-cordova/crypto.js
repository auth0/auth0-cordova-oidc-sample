import crypto from 'crypto';

const base64UrlSafeEncode = (string) => {
    return string.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};

const sha256 = (buffer) => {
    return crypto.createHash('sha256').update(buffer).digest();
};

export const generateProofKey = () => {
  const codeVerifier = base64UrlSafeEncode(crypto.randomBytes(32));
  const codeChallenge = base64UrlSafeEncode(sha256(codeVerifier));
  return { codeVerifier, codeChallenge };
};

export const generateState = () => {
  return base64UrlSafeEncode(crypto.randomBytes(32));
};
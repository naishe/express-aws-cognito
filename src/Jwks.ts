export default interface Jwks {
  keys: Key[];
}

interface Key {
  kid: string;
  alg: string;
  kty: "RSA";
  e: string;
  n: string;
  use: string;
}

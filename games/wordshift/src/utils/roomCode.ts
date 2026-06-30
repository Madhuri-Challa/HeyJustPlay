const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(length = 6) {
  let code = "";
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);

  for (let index = 0; index < length; index += 1) {
    code += ALPHABET[values[index] % ALPHABET.length];
  }

  return code;
}

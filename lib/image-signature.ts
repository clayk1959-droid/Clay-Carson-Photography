// Real image-type checking by content, not by filename or the browser's
// claimed MIME type -- both are trivially wrong or spoofed. Only the bytes
// a real file actually starts with are trustworthy.
const SIGNATURES: Array<{ name: string; bytes: number[] }> = [
  { name: "jpeg", bytes: [0xff, 0xd8, 0xff] },
  { name: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { name: "tiff-le", bytes: [0x49, 0x49, 0x2a, 0x00] },
  { name: "tiff-be", bytes: [0x4d, 0x4d, 0x00, 0x2a] },
];

export function isRecognizedImage(bytes: Uint8Array): boolean {
  return SIGNATURES.some((sig) => sig.bytes.every((byte, index) => bytes[index] === byte));
}

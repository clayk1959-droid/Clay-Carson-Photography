// Real image-type checking by content, not by filename or the browser's
// claimed MIME type -- both are trivially wrong or spoofed. Only the bytes
// a real file actually starts with are trustworthy.
const SIGNATURES: Array<{ name: string; bytes: number[] }> = [
  { name: "jpeg", bytes: [0xff, 0xd8, 0xff] },
  { name: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { name: "tiff-le", bytes: [0x49, 0x49, 0x2a, 0x00] },
  { name: "tiff-be", bytes: [0x4d, 0x4d, 0x00, 0x2a] },
];

// HEIC/HEIF (iPhone's default photo format) isn't a fixed-byte-prefix
// format like the others -- bytes 0-3 are a box *size* that varies per
// file, not a magic number. The real signature is an "ftyp" box at byte 4
// naming one of these brands. Recognized here so a submission can accept
// it (Clay reviews/exports HEIC in Photo Mechanic same as raw camera
// files already), but the gallery sync pipeline still only processes
// jpg/jpeg/tif/tiff/png -- HEIC needs converting before it can go through
// gallery:sync, same as any raw file does today.
const HEIC_BRANDS = ["heic", "heix", "heim", "heis", "hevc", "hevx", "hevm", "hevs", "mif1", "msf1"];

function isHeic(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const box = String.fromCharCode(...bytes.slice(4, 8));
  if (box !== "ftyp") return false;
  const brand = String.fromCharCode(...bytes.slice(8, 12));
  return HEIC_BRANDS.includes(brand);
}

export function isRecognizedImage(bytes: Uint8Array): boolean {
  return SIGNATURES.some((sig) => sig.bytes.every((byte, index) => bytes[index] === byte)) || isHeic(bytes);
}

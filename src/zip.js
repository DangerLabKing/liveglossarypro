// ═══════════════════════════════════════════════════════════════════════════
// TINY ZIP MAKER  (src/zip.js)
//
// Packs several files into one .zip without any library, so the app stays
// small and works offline. Used by "Download all formats".
//
//   const blob = await makeZip([{ name: "quiz.html", content: "<html>…" }, …]);
//
// How a .zip file is laid out (simplified):
//   [local header + file 1 data] [local header + file 2 data] …
//   [central directory: one entry per file, pointing back at its local header]
//   [end record: how many files, where the central directory starts]
// All numbers are little-endian (lowest byte first).
//
// Compression: modern browsers have CompressionStream("deflate-raw"), which is
// exactly the "deflate" method zip files use. Where it's missing we simply
// store the files uncompressed (method 0) – still a perfectly valid zip.
// ═══════════════════════════════════════════════════════════════════════════

// CRC-32 checksum table (zip uses this to detect corrupted files).
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// Compress with the browser's built-in deflate, or return null if unavailable.
async function deflate(bytes) {
  if (typeof CompressionStream === 'undefined') return null;
  try {
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

// Date/time in the old MS-DOS format that zip files use.
function dosDateTime(d = new Date()) {
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time, date };
}

/**
 * @param {Array<{name: string, content: string|Uint8Array}>} files
 * @returns {Promise<Blob>} the finished .zip
 */
export async function makeZip(files) {
  const enc = new TextEncoder();
  const { time, date } = dosDateTime();
  const parts = [];      // pieces of the zip, in order
  const central = [];    // central-directory entries (written at the end)
  let offset = 0;        // where we are in the file so far (in bytes)

  for (const f of files) {
    const name = enc.encode(f.name);
    const raw = typeof f.content === 'string' ? enc.encode(f.content) : f.content;
    const crc = crc32(raw);
    const packed = await deflate(raw);
    // Only use the compressed version if it actually came out smaller.
    const useDeflate = packed && packed.length < raw.length;
    const data = useDeflate ? packed : raw;
    const method = useDeflate ? 8 : 0;            // 8 = deflate, 0 = stored

    // Fields shared by the local header and the central-directory entry.
    const common = (v) => {
      v.setUint16(0, 20, true);        // version needed to extract (2.0)
      v.setUint16(2, 0x0800, true);    // flag bit 11: file name is UTF-8 (accents work)
      v.setUint16(4, method, true);
      v.setUint16(6, time, true);
      v.setUint16(8, date, true);
      v.setUint32(10, crc, true);
      v.setUint32(14, data.length, true);   // compressed size
      v.setUint32(18, raw.length, true);    // original size
      v.setUint16(22, name.length, true);
      v.setUint16(24, 0, true);             // no "extra" field
    };

    // Local file header: signature "PK\3\4" + common fields + name, then the data.
    const local = new Uint8Array(30);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    common(new DataView(local.buffer, 4));
    parts.push(local, name, data);

    // Central-directory entry: signature "PK\1\2", a few extra fields, then the name.
    const cen = new Uint8Array(46);
    const cv = new DataView(cen.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);              // "version made by"
    common(new DataView(cen.buffer, 6));
    // bytes 32–41: comment length, disk number, file attributes – all zero
    cv.setUint32(42, offset, true);         // where this file's local header starts
    central.push(cen, name);

    offset += local.length + name.length + data.length;
  }

  // End-of-central-directory record: signature "PK\5\6" + counts + location.
  const cdSize = central.reduce((n, p) => n + p.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);      // entries on this disk
  ev.setUint16(10, files.length, true);     // total entries
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);           // central directory starts right after the files

  return new Blob([...parts, ...central, end], { type: 'application/zip' });
}

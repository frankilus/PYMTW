# Bundled document readers

- Tesseract.js 7.0.0 and tesseract.js-core 7.0.0: https://github.com/naptha/tesseract.js
- English tessdata_fast: https://github.com/tesseract-ocr/tessdata_fast
- PDF.js / pdfjs-dist 5.6.205: https://github.com/mozilla/pdf.js

Licenses are included beside the files and in resource subdirectories. `manifest.json` records installed package versions and SHA-256 checksums of the distributed assets. The English model source is recorded and its exact bytes are pinned by hash.

Only the LSTM OCR cores used by OEM 1 are bundled (standard, SIMD and relaxed-SIMD variants). They embed their WebAssembly bytes. Model loading uses `gzip:false` and `cacheMethod:none`. PDF resources include CMaps, standard fonts and image-decoder WebAssembly files. All paths are explicitly configured to this same-origin directory. No CDN fallback is used.

Do not add remote OCR or telemetry without revisiting the tool's privacy design. Never write uploaded files, OCR text or parsed payroll entries to the repository or browser storage.

// Client-side image downscale/compress. Firebase Storage isn't available on
// this project's (free) plan, so uploaded photos are embedded as base64
// inside Firestore documents — which cap out at 1MB per document. Compressing
// on the client keeps a typical phone photo (several MB) down to well under
// that limit before it ever gets sent anywhere.
export function compressImageToDataUrl(file: File, maxDim = 1200, quality = 0.65): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(objectUrl);
      if (!ctx) { reject(new Error("Canvas isn't supported in this browser")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Couldn't read that image")); };
    img.src = objectUrl;
  });
}

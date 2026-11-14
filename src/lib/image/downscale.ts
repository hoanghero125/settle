/**
 * Shrinks a camera photo before upload. Phone photos are several megabytes;
 * Vercel rejects request bodies over 4.5 MB, and a smaller image is faster
 * and cheaper for the model while staying readable.
 */
export async function downscaleImage(file: File, maxSide = 1600, quality = 0.72): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", quality);
}

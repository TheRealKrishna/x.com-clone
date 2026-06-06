import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, hasCloudinary } from "../api/config";

/**
 * Upload an image File to Cloudinary if configured; otherwise fall back to a
 * base64 data URL so local development works with no external services.
 * Returns a URL string (remote or data URL), or "" on failure.
 */
export async function uploadImage(file) {
  if (!file) return "";

  if (!hasCloudinary) {
    return fileToDataUrl(file);
  }

  try {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    data.append("cloud_name", CLOUDINARY_CLOUD_NAME);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: data,
    });
    const json = await res.json();
    return json.secure_url || json.url || (await fileToDataUrl(file));
  } catch {
    return fileToDataUrl(file);
  }
}

export function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

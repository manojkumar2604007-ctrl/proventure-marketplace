export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export function getCloudinaryOptimizedUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number | "auto";
    crop?: string;
  } = {}
): string {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com")) return url;

  const transforms: string[] = ["f_auto"];
  if (options.quality) transforms.push(`q_${options.quality}`);
  else transforms.push("q_auto");
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);

  const transformString = transforms.join(",");
  return url.replace("/upload/", `/upload/${transformString}/`);
}

export async function uploadToCloudinary(
  fileOrBase64: string,
  folder = "proventure-marketplace"
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "proventure_marketplace_uploads";

  if (!cloudName || cloudName === "demo") {
    // Return sample high-res image for offline/demo development
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
  }

  try {
    const formData = new FormData();
    formData.append("file", fileOrBase64);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
  }
}

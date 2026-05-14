"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{ url: string; public_id: string; width: number; height: number }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "rcv_media",
      },
      (error, result) => {
        if (error) reject(error);
        else if (result) {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export async function uploadMultipleToCloudinary(formData: FormData) {
  const files = formData.getAll("files") as File[];
  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  const results = await Promise.all(
    files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new Promise<{ url: string; public_id: string; width: number; height: number }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "rcv_media" },
          (error, result) => {
            if (error) reject(error);
            else if (result) {
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
              });
            }
          }
        );
        uploadStream.end(buffer);
      });
    })
  );

  return results;
}

export async function deleteFromCloudinary(publicId: string) {
  return new Promise<{ result: string }>((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

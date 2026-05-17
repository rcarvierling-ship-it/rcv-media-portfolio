"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function checkConfig() {
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary credentials are missing in environment variables");
  }
}

export async function uploadToCloudinary(formData: FormData) {
  checkConfig();
  console.log("Starting single upload to Cloudinary...");
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{ url: string; public_id: string; width: number; height: number; metadata?: any }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "rcv_media",
        image_metadata: true,
        exif: true,
      },
      (error, result) => {
        if (error) reject(error);
        else if (result) {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            metadata: { ...result.exif, ...result.image_metadata },
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export async function uploadMultipleToCloudinary(formData: FormData) {
  checkConfig();
  const files = formData.getAll("files") as File[];
  console.log(`Starting batch upload of ${files?.length || 0} files to Cloudinary...`);
  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  const results = await Promise.all(
    files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new Promise<{ url: string; public_id: string; width: number; height: number; metadata?: any }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder: "rcv_media",
            image_metadata: true,
            exif: true,
          },
          (error, result) => {
            if (error) reject(error);
            else if (result) {
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
                metadata: { ...result.exif, ...result.image_metadata },
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

export async function getCloudinarySignature() {
  checkConfig();
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { 
      timestamp, 
      folder: "rcv_media",
      image_metadata: true,
      exif: true
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: "rcv_media",
    image_metadata: true,
    exif: true,
  };
}

export async function deleteFromCloudinary(publicId: string) {
  return new Promise<{ result: string }>((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

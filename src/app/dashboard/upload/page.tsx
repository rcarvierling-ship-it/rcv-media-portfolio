"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { uploadMultipleToCloudinary } from "@/app/actions/upload";
import { addPhoto } from "@/app/actions/photos";
import { createClient } from "@/utils/supabase/client";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchAlbums() {
      const supabase = createClient();
      const { data } = await supabase.from("albums").select("id, title");
      if (data) setAlbums(data);
    }
    fetchAlbums();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 20,
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles);
      setError("");
      setSuccess(false);
    }
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please select at least one file to upload.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const titleBase = formData.get("title") as string;
    const category = formData.get("category") as string;
    const album_id = formData.get("album_id") as string;
    const is_featured = formData.get("is_featured") === "on";

    try {
      const uploadData = new FormData();
      files.forEach(f => uploadData.append("files", f));
      
      const cloudinaryResults = await uploadMultipleToCloudinary(uploadData);

      // Save each to Supabase
      for (let i = 0; i < cloudinaryResults.length; i++) {
        const res = cloudinaryResults[i];
        // If multiple files, append number to title
        const title = files.length > 1 ? `${titleBase} ${i + 1}` : titleBase;
        
        await addPhoto({
          title,
          category,
          album_id: album_id || null,
          is_featured,
          image_url: res.url,
          public_id: res.public_id,
          width: res.width,
          height: res.height,
        });
      }

      setSuccess(true);
      setFiles([]);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || "An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-tighter mb-2">Upload Photos</h1>
        <p className="text-zinc-400">Add new images to your portfolio or an album.</p>
      </header>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-white bg-white/5" : "border-zinc-800 hover:border-zinc-500 bg-zinc-900"
          }`}
        >
          <input {...getInputProps()} />
          {files.length > 0 ? (
            <div className="text-white">{files.length} file(s) selected</div>
          ) : (
            <div className="text-zinc-500 uppercase tracking-widest text-sm font-bold">
              {isDragActive ? "Drop images here" : "Drag & drop images, or click to select"}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Title Base</label>
            <input 
              name="title"
              type="text" 
              required
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-white px-4 py-3 text-white outline-none transition-colors"
              placeholder="e.g. Championship Game (will append 1, 2, 3 for multiple)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Category</label>
              <select name="category" className="w-full bg-zinc-900 border border-zinc-800 focus:border-white px-4 py-3 text-white outline-none transition-colors appearance-none">
                <option value="Sports">Sports</option>
                <option value="Basketball">Basketball</option>
                <option value="Volleyball">Volleyball</option>
                <option value="Portraits">Portraits</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Events">Events</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Album (Optional)</label>
              <select name="album_id" className="w-full bg-zinc-900 border border-zinc-800 focus:border-white px-4 py-3 text-white outline-none transition-colors appearance-none">
                <option value="">None</option>
                {albums.map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <input type="checkbox" name="is_featured" id="featured" className="w-4 h-4 bg-zinc-900 border-zinc-800 accent-white" />
            <label htmlFor="featured" className="text-sm font-bold uppercase tracking-widest text-zinc-300">Feature on Homepage</label>
          </div>
        </div>

        {error && <div className="text-red-500 text-sm font-bold p-4 bg-red-500/10 border border-red-500/20">{error}</div>}
        {success && <div className="text-green-500 text-sm font-bold p-4 bg-green-500/10 border border-green-500/20">Photos uploaded successfully!</div>}

        <button 
          type="submit"
          disabled={loading}
          className="w-full px-8 py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Photos"}
        </button>
      </form>
    </div>
  );
}

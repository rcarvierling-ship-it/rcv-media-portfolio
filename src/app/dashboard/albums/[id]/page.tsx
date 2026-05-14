"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, CheckCircle2, Circle, 
  Search, Filter, Save, Image as ImageIcon,
  Upload, X, Loader2, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { uploadMultipleToCloudinary } from "@/app/actions/upload";
import { addPhoto } from "@/app/actions/photos";
import Link from "next/link";

export default function AlbumMediaManager() {
  const { id } = useParams();
  const [album, setAlbum] = useState<any>(null);
  const [allPhotos, setAllPhotos] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Direct Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: files => setUploadFiles(prev => [...prev, ...files])
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    const [albumRes, photosRes] = await Promise.all([
      supabase.from("albums").select("*").eq("id", id).single(),
      supabase.from("photos").select("*").order("created_at", { ascending: false })
    ]);

    if (albumRes.data) setAlbum(albumRes.data);
    if (photosRes.data) {
      setAllPhotos(photosRes.data);
      const inAlbum = photosRes.data.filter(p => p.album_id === id).map(p => p.id);
      setSelectedIds(new Set(inAlbum));
    }
    setLoading(false);
  }

  const handleDirectUpload = async () => {
    if (uploadFiles.length === 0) return;
    setUploading(true);
    
    try {
      const uploadData = new FormData();
      uploadFiles.forEach(f => uploadData.append("files", f));
      
      const cloudinaryResults = await uploadMultipleToCloudinary(uploadData);
      
      const newPhotoIds: string[] = [];
      for (let i = 0; i < cloudinaryResults.length; i++) {
        const res = cloudinaryResults[i];
        const result = await addPhoto({
          title: `${album.title} Asset ${Date.now() + i}`,
          category: album.category || "Client Vault",
          album_id: id as string,
          is_featured: false,
          image_url: res.url,
          public_id: res.public_id,
          width: res.width,
          height: res.height,
        }) as any;
        if (result?.success) {
          newPhotoIds.push(result.data.id);
        }
      }

      // Refresh data
      await fetchData();
      // Auto-select new photos
      setSelectedIds(prev => {
        const next = new Set(prev);
        newPhotoIds.forEach(pid => next.add(pid));
        return next;
      });
      
      setUploadFiles([]);
      setShowUpload(false);
      alert("Direct upload successful. Photos added to this vault.");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const togglePhoto = (photoId: string) => {
    const next = new Set(selectedIds);
    if (next.has(photoId)) {
      next.delete(photoId);
    } else {
      next.add(photoId);
    }
    setSelectedIds(next);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // 1. Remove all currently assigned photos from this album
    await supabase
      .from("photos")
      .update({ album_id: null })
      .eq("album_id", id);

    // 2. Assign selected photos to this album
    if (selectedIds.size > 0) {
      await supabase
        .from("photos")
        .update({ album_id: id })
        .in("id", Array.from(selectedIds));
      
      // 3. Update cover image if not set
      if (!album.cover_image_url && selectedIds.size > 0) {
        const firstPhoto = allPhotos.find(p => selectedIds.has(p.id));
        if (firstPhoto) {
          await supabase.from("albums").update({ cover_image_url: firstPhoto.image_url }).eq("id", id);
        }
      }
    }

    setIsSaving(false);
    router.refresh();
    router.push("/dashboard/albums");
  };

  const filteredPhotos = allPhotos.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-12 text-zinc-500 uppercase font-black tracking-widest text-xs">Mapping Media...</div>;

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <Link href="/dashboard/albums" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-4">
             <ArrowLeft size={14} /> Back to Albums
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Manage Media: {album?.title}</h1>
          <p className="text-zinc-500 font-light tracking-wide uppercase text-[10px]">Deliver assets directly to this vault ({selectedIds.size} synced)</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className={`px-8 py-4 ${showUpload ? 'bg-zinc-800 text-white' : 'bg-white/5 text-white border border-white/10'} text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center gap-2`}
          >
            {showUpload ? <X size={14} /> : <Upload size={14} />} 
            {showUpload ? "Cancel Upload" : "Direct Upload"}
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-10 py-4 bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? "Syncing..." : "Sync Vault"} <Save size={14} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showUpload && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="premium-card p-10 bg-brand-accent/5 border border-brand-accent/20 rounded-2xl">
               <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black uppercase tracking-tighter text-white">Direct Upload Bridge</h2>
                  <p className="text-[10px] text-brand-accent font-black uppercase tracking-widest">Assets will be auto-linked to this vault</p>
               </div>
               
               <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed p-16 text-center cursor-pointer transition-all rounded-xl mb-8 ${
                    isDragActive ? "border-brand-accent bg-brand-accent/10" : "border-zinc-800 hover:border-brand-accent/50 bg-black/40"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload size={32} className="mx-auto mb-4 text-zinc-700" />
                  <p className="text-zinc-500 uppercase tracking-[0.2em] text-[10px] font-black">
                    {isDragActive ? "Release to stage assets" : "Drag client photos here or click to browse"}
                  </p>
               </div>

               {uploadFiles.length > 0 && (
                 <div className="space-y-6">
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                       {uploadFiles.map((f, i) => (
                         <div key={i} className="aspect-square bg-zinc-800 rounded-sm flex items-center justify-center text-[10px] text-zinc-500 font-mono relative group">
                            {f.name.slice(-4)}
                            <button onClick={(e) => { e.stopPropagation(); setUploadFiles(prev => prev.filter((_, idx) => idx !== i)); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                         </div>
                       ))}
                    </div>
                    <button 
                      onClick={handleDirectUpload}
                      disabled={uploading}
                      className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3"
                    >
                      {uploading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                      {uploading ? "Uploading to Cloudinary..." : `Deliver ${uploadFiles.length} Assets to Vault`}
                    </button>
                 </div>
               )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="premium-card p-6 bg-zinc-900/20 border border-white/5 rounded-2xl">
         <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
               <input 
                 type="text" 
                 placeholder="Filter library..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-black/40 border border-white/10 pl-12 pr-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-brand-accent/50 transition-all"
               />
            </div>
            <div className="flex gap-6">
               <button onClick={() => setSelectedIds(new Set())} className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Deselect All</button>
               <button onClick={() => setSelectedIds(new Set(allPhotos.map(p => p.id)))} className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Select Entire Library</button>
            </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredPhotos.map((photo) => {
               const isSelected = selectedIds.has(photo.id);
               return (
                  <motion.div 
                    key={photo.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => togglePhoto(photo.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      isSelected ? 'border-brand-accent shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-transparent'
                    }`}
                  >
                     <img src={photo.image_url} alt={photo.title} className={`w-full h-full object-cover transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40'}`} />
                     <div className="absolute top-2 right-2">
                        {isSelected ? (
                          <CheckCircle2 size={20} className="text-brand-accent bg-black rounded-full" />
                        ) : (
                          <Circle size={20} className="text-white/20" />
                        )}
                     </div>
                     {photo.album_id && photo.album_id !== id && (
                       <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[8px] font-black uppercase tracking-widest text-zinc-400">
                          In other album
                       </div>
                     )}
                  </motion.div>
               );
            })}
         </div>
      </section>
    </div>
  );
}

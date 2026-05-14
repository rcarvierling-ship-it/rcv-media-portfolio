"use client";

import { useState, useMemo } from "react";
import { 
  Search, Filter, Plus, Trash2, 
  Edit3, Star, Check, X, 
  Loader2, Upload, ExternalLink,
  ChevronDown, Grid, List as ListIcon,
  Image as ImageIcon, MoreVertical,
  ChevronUp, Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { updatePhoto, deletePhoto, addPhoto } from "@/app/actions/photos";
import { uploadToCloudinary, getCloudinarySignature } from "@/app/actions/upload";
import { createClient } from "@/utils/supabase/client";

export function MediaLibraryClient({ initialPhotos, albums }: { initialPhotos: any[], albums: any[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  
  // Upload State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const router = useRouter();
  const supabase = createClient();

  const PORTFOLIO_TAGS = ["Sports", "Basketball", "Volleyball", "Football", "Soccer", "Portraits", "Lifestyle", "Events", "Cinematic"];
  const categories = ["All", ...PORTFOLIO_TAGS];

  const filteredPhotos = useMemo(() => {
    return photos.filter(p => {
      const matchesSearch = (p.title?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [photos, searchTerm, categoryFilter]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 20,
    onDrop: acceptedFiles => {
      setFiles(prev => [...prev, ...acceptedFiles].slice(0, 20));
    }
  });

  const handleToggleFeatured = async (photo: any) => {
    setIsProcessing(photo.id);
    await updatePhoto(photo.id, { is_featured: !photo.is_featured });
    setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, is_featured: !p.is_featured } : p));
    setIsProcessing(null);
  };

  const handleDelete = async (photo: any) => {
    if (!confirm("Are you sure? This will delete the photo from the library and Cloudinary permanently.")) return;
    setIsProcessing(photo.id);
    try {
      await deletePhoto(photo.id, photo.public_id);
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      if (selectedPhoto?.id === photo.id) setSelectedPhoto(null);
    } catch (err) {
      alert("Delete failed.");
    }
    setIsProcessing(null);
  };

  const handleUpdatePhoto = async (id: string, updates: any) => {
    setIsProcessing(id);
    try {
      await updatePhoto(id, updates);
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      if (selectedPhoto?.id === id) setSelectedPhoto({ ...selectedPhoto, ...updates });
    } catch (err) {
      alert("Update failed.");
    }
    setIsProcessing(null);
  };

  const handleToggleCurated = async (photo: any) => {
    setIsProcessing(photo.id);
    await updatePhoto(photo.id, { is_curated: !photo.is_curated });
    setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, is_curated: !p.is_curated } : p));
    setIsProcessing(null);
  };

  const handleBatchUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploadLoading(true);
    const formData = new FormData(e.currentTarget);
    const tag = formData.get("category") as string;
    const album_id = formData.get("album_id") as string;
    const auto_publish = formData.get("auto_publish") === "on";

    try {
      // 1. Get secure signature from server
      const signData = await getCloudinarySignature();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Direct syncing file ${i + 1}/${files.length}: ${file.name}`);
        
        // 2. Prepare Direct Upload Payload
        const directData = new FormData();
        directData.append("file", file);
        directData.append("api_key", signData.apiKey!);
        directData.append("timestamp", signData.timestamp.toString());
        directData.append("signature", signData.signature);
        directData.append("folder", signData.folder);
        
        // 3. Push Directly to Cloudinary Edge
        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
          { method: "POST", body: directData }
        );
        
        const res = await uploadResponse.json();
        
        if (res.error) {
          throw new Error(res.error.message || "Cloudinary upload failed");
        }
        
        // 4. Archive in Database
        const result = await addPhoto({
          title: file.name.split('.')[0],
          category: tag,
          album_id: album_id || null,
          is_featured: false,
          is_curated: auto_publish,
          image_url: res.secure_url,
          public_id: res.public_id,
          width: res.width,
          height: res.height,
        }) as any;
        
        if (result?.success) {
          setPhotos(prev => [result.data, ...prev]);
        }
      }

      setFiles([]);
      setIsUploadOpen(false);
    } catch (err: any) {
      console.error("Direct sync failed:", err);
      alert(`Sync failed: ${err.message || "There was a problem pushing your media to the edge."}`);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">Master Library</h1>
          <p className="text-zinc-500 font-light tracking-wide uppercase text-[10px]">Managing {photos.length} assets across your entire horizon</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setIsUploadOpen(!isUploadOpen)} 
             className={`px-8 py-4 ${isUploadOpen ? 'bg-zinc-800 text-white' : 'bg-white text-black'} text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2 rounded-sm`}
           >
             {isUploadOpen ? <ChevronUp size={14} /> : <Plus size={14} />} {isUploadOpen ? 'Close Upload' : 'Batch Upload'}
           </button>
        </div>
      </header>

      {/* UPLOAD SECTION (EXPANDABLE) */}
      <AnimatePresence>
         {isUploadOpen && (
           <motion.section 
             initial={{ height: 0, opacity: 0 }} 
             animate={{ height: 'auto', opacity: 1 }} 
             exit={{ height: 0, opacity: 0 }}
             className="overflow-hidden"
           >
             <div className="premium-card p-10 bg-zinc-900 border border-white/10 rounded-sm mb-12">
                <form onSubmit={handleBatchUpload} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                   <div className="lg:col-span-7">
                      <div 
                        {...getRootProps()} 
                        className={`border-2 border-dashed aspect-video rounded-sm flex flex-col items-center justify-center gap-6 transition-all cursor-pointer ${
                          isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 hover:border-white/20 bg-black/40'
                        }`}
                      >
                         <input {...getInputProps()} />
                         <div className="p-6 bg-zinc-800 rounded-full text-zinc-500 group-hover:text-white transition-colors">
                            <Upload size={32} />
                         </div>
                         <div className="text-center">
                            <p className="text-xs font-black uppercase tracking-widest text-white mb-2">
                               {files.length > 0 ? `${files.length} Files Prepared` : 'Drag & Drop Media'}
                            </p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Supports PNG, JPG, WEBP (Max 20 Files)</p>
                         </div>
                      </div>
                      
                      {files.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                           {files.map((f, i) => {
                             const isTooLarge = f.size > 10 * 1024 * 1024;
                             return (
                               <div key={i} className={`px-3 py-1 bg-zinc-800 text-[8px] font-black uppercase border rounded-full flex items-center gap-2 ${
                                 isTooLarge ? 'border-red-500/50 text-red-500' : 'border-white/5 text-zinc-400'
                               }`}>
                                  {f.name} ({(f.size / (1024 * 1024)).toFixed(1)}MB) 
                                  {isTooLarge && <span className="text-red-500 font-bold">[TOO LARGE]</span>}
                                  <X size={10} className="cursor-pointer hover:text-white" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} />
                               </div>
                             );
                           })}
                        </div>
                      )}
                   </div>

                   <div className="lg:col-span-5 space-y-8">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <Tag size={12} /> Assign Portfolio Tags
                         </label>
                         <select name="category" required className="w-full bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-blue-500 transition-all text-sm font-bold uppercase tracking-widest">
                            {PORTFOLIO_TAGS.map(tag => (
                              <option key={tag} value={tag}>{tag}</option>
                            ))}
                         </select>
                      </div>

                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <ImageIcon size={12} /> Target Album (Optional)
                         </label>
                         <select name="album_id" className="w-full bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-blue-500 transition-all text-sm font-bold uppercase tracking-widest">
                            <option value="">No Album</option>
                            {albums.map(a => (
                              <option key={a.id} value={a.id}>{a.title}</option>
                            ))}
                         </select>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-black/40 border border-white/5 rounded-sm">
                         <input type="checkbox" name="auto_publish" id="auto_publish" className="w-4 h-4 accent-blue-600" />
                         <label htmlFor="auto_publish" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Publish Instantly to Website</label>
                      </div>

                      <div className="pt-6">
                         <button 
                           disabled={files.length === 0 || uploadLoading}
                           className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                         >
                            {uploadLoading ? <Loader2 className="animate-spin" size={16} /> : <>Commence Batch Sync <Upload size={16} /></>}
                         </button>
                      </div>
                   </div>
                </form>
             </div>
           </motion.section>
         )}
      </AnimatePresence>

      {/* FILTERS & SEARCH */}
      <section className="premium-card p-6 bg-zinc-900/20 border border-white/5 rounded-sm flex flex-col md:flex-row gap-6 items-center">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input 
              type="text" 
              placeholder="Search your library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 pl-12 pr-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-blue-500/50 transition-all"
            />
         </div>
         <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setCategoryFilter(cat)}
                className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                  categoryFilter === cat ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/5 text-zinc-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
         </div>
      </section>

      {/* ASSET GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
         {filteredPhotos.map((photo) => (
           <motion.div 
              layout
              key={photo.id}
              className={`relative aspect-square group bg-zinc-900 border transition-all overflow-hidden rounded-sm ${
                selectedPhoto?.id === photo.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-white/5'
              }`}
           >
              <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
              
              {/* Curation Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                 {photo.is_curated ? (
                   <div className="bg-emerald-500 text-white px-2 py-0.5 rounded-[2px] text-[7px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-black/40">
                      <Check size={8} /> Live
                   </div>
                 ) : (
                   <div className="bg-zinc-800/80 backdrop-blur-md text-zinc-400 px-2 py-0.5 rounded-[2px] text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                      <X size={8} /> Hidden
                   </div>
                 )}
                 {photo.is_featured && (
                   <div className="bg-blue-500 text-white px-2 py-0.5 rounded-[2px] text-[7px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-black/40">
                      <Star size={8} fill="currentColor" /> Featured
                   </div>
                 )}
              </div>

              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                 <div className="flex justify-between items-start">
                    <button 
                      onClick={() => handleToggleFeatured(photo)}
                      className={`p-2 rounded-full transition-all ${photo.is_featured ? 'text-blue-500 bg-white' : 'text-white hover:text-blue-500 bg-black/40'}`}
                    >
                      <Star size={14} fill={photo.is_featured ? "currentColor" : "none"} />
                    </button>
                    <div className="flex gap-2">
                       <button onClick={() => setSelectedPhoto(photo)} className="p-2 text-white hover:text-blue-500 bg-black/40 rounded-full transition-all"><Edit3 size={14} /></button>
                    </div>
                 </div>
                 <div className="flex justify-between items-end">
                    <div className="max-w-[70%]">
                       <p className="text-[10px] font-black uppercase tracking-tighter text-white truncate leading-none mb-1">{photo.title}</p>
                       <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{photo.category}</p>
                    </div>
                    <button onClick={() => handleDelete(photo)} className="p-2 text-zinc-400 hover:text-red-500 bg-black/40 rounded-full transition-all"><Trash2 size={14} /></button>
                 </div>
              </div>

              {isProcessing === photo.id && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                   <Loader2 className="animate-spin text-blue-500" />
                </div>
              )}
           </motion.div>
         ))}
      </div>

      {/* QUICK EDIT MODAL */}
      <AnimatePresence>
         {selectedPhoto && (
           <div className="fixed inset-0 z-[500] flex items-center justify-end">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedPhoto(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                className="relative w-full max-w-xl h-full bg-zinc-950 border-l border-white/5 p-12 overflow-y-auto"
              >
                 <button onClick={() => setSelectedPhoto(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
                 
                 <div className="mb-12">
                    <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Asset Intelligence</span>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white leading-none mb-4">Edit Details</h2>
                 </div>

                 <div className="aspect-video w-full bg-zinc-900 rounded-sm overflow-hidden mb-12 border border-white/5">
                    <img src={selectedPhoto.image_url} alt="Preview" className="w-full h-full object-cover" />
                 </div>

                 <div className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Asset Title</label>
                       <input 
                         className="w-full bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-blue-500 transition-all text-sm font-bold"
                         value={selectedPhoto.title || ""}
                         onChange={(e) => setSelectedPhoto({ ...selectedPhoto, title: e.target.value })}
                         onBlur={(e) => handleUpdatePhoto(selectedPhoto.id, { title: e.target.value })}
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Image Tag</label>
                          <select 
                            className="w-full bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-blue-500 transition-all text-sm font-bold uppercase"
                            value={selectedPhoto.category || ""}
                            onChange={(e) => handleUpdatePhoto(selectedPhoto.id, { category: e.target.value })}
                          >
                             {PORTFOLIO_TAGS.map(tag => (
                               <option key={tag} value={tag}>{tag}</option>
                             ))}
                          </select>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Associated Album</label>
                          <select 
                            className="w-full bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-blue-500 transition-all text-sm font-bold uppercase"
                            value={selectedPhoto.album_id || ""}
                            onChange={(e) => handleUpdatePhoto(selectedPhoto.id, { album_id: e.target.value || null })}
                          >
                             <option value="">No Album</option>
                             {albums.map(a => (
                               <option key={a.id} value={a.id}>{a.title}</option>
                             ))}
                          </select>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-6 bg-zinc-900/50 border border-white/5 rounded-sm">
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Public Portfolio</p>
                             <p className="text-[9px] text-zinc-500 uppercase">Surface this asset on your public website</p>
                          </div>
                          <button 
                            onClick={() => handleToggleCurated(selectedPhoto)}
                            className={`w-12 h-6 rounded-full relative transition-all ${selectedPhoto.is_curated ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                          >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${selectedPhoto.is_curated ? 'left-7' : 'left-1'}`} />
                          </button>
                       </div>

                       <div className="flex items-center justify-between p-6 bg-zinc-900/50 border border-white/5 rounded-sm">
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Feature on Homepage</p>
                             <p className="text-[9px] text-zinc-500 uppercase">Surface this asset in "The Edit" carousel</p>
                          </div>
                          <button 
                            onClick={() => handleToggleFeatured(selectedPhoto)}
                            className={`w-12 h-6 rounded-full relative transition-all ${selectedPhoto.is_featured ? 'bg-blue-600' : 'bg-zinc-800'}`}
                          >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${selectedPhoto.is_featured ? 'left-7' : 'left-1'}`} />
                          </button>
                       </div>
                    </div>

                    <div className="pt-10 border-t border-white/5">
                       <button 
                         onClick={() => handleDelete(selectedPhoto)}
                         className="w-full py-4 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded-sm flex items-center justify-center gap-2"
                       >
                          <Trash2 size={14} /> Delete Asset Permanently
                       </button>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}

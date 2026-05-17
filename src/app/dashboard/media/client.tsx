"use client";

import { useState, useMemo } from "react";
import { 
  Search, Filter, Plus, Trash2, 
  Edit3, Star, Check, X, 
  Loader2, Upload, ExternalLink,
  ChevronDown, Grid, List as ListIcon,
  ImageIcon, MoreVertical,
  ChevronUp, Tag, Download, HardDrive
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { updatePhoto, deletePhoto, addPhoto } from "@/app/actions/photos";
import { uploadToCloudinary, getCloudinarySignature } from "@/app/actions/upload";
import { createClient } from "@/utils/supabase/client";

function parseTechnicalMetadata(res: any) {
  const meta = { ...res.exif, ...res.image_metadata };
  
  // 1. ISO
  let iso: number | undefined = undefined;
  const isoVal = meta.ISOSpeedRatings || meta.ISOSpeed || meta.ISO || meta.iso || meta.isoSpeedRatings;
  if (isoVal) {
    const parsed = parseInt(isoVal);
    if (!isNaN(parsed)) {
      iso = parsed;
    }
  }

  // 2. Aperture
  let aperture: string | undefined = undefined;
  const apVal = meta.FNumber || meta.ApertureValue || meta.aperture || meta.Aperture;
  if (apVal) {
    const str = String(apVal).trim();
    aperture = str.toLowerCase().startsWith('f/') ? str : `f/${str}`;
  }

  // 3. Shutter Speed
  let shutter_speed: string | undefined = undefined;
  const ssVal = meta.ExposureTime || meta.ShutterSpeedValue || meta.shutter_speed || meta.ShutterSpeed;
  if (ssVal) {
    shutter_speed = String(ssVal).trim();
  }

  // 4. Focal Length
  let focal_length: string | undefined = undefined;
  const flVal = meta.FocalLength || meta.focal_length || meta.FocalLengthIn35mmFormat;
  if (flVal) {
    focal_length = String(flVal).trim();
  }

  // 5. Camera Model
  let camera_model: string | undefined = undefined;
  const camVal = meta.Model || meta.model || meta.CameraModel;
  if (camVal) {
    camera_model = String(camVal).trim();
  }

  // 6. Lens Model
  let lens_model: string | undefined = undefined;
  const lensVal = meta.LensModel || meta.LensInfo || meta.Lens || meta.lens_model;
  if (lensVal) {
    lens_model = String(lensVal).trim();
  }

  return { iso, aperture, shutter_speed, focal_length, camera_model, lens_model };
}

export function MediaLibraryClient({ initialPhotos, albums }: { initialPhotos: any[], albums: any[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  
  // Upload State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<any[]>([]); // { file, category, album_id, is_curated, is_featured }
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
      const newStaged = acceptedFiles.map(file => ({
        file,
        category: "Sports",
        album_id: "",
        is_curated: false,
        is_featured: false,
        preview: URL.createObjectURL(file)
      }));
      setStagedFiles(prev => [...prev, ...newStaged].slice(0, 20));
    }
  });

  const updateStaged = (index: number, updates: any) => {
    setStagedFiles(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  const removeStaged = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

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
      await deletePhoto(photo.id, photo.public_id, photo.raw_storage_path);
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

  const handleBatchUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stagedFiles.length === 0) return;

    setUploadLoading(true);

    try {
      const signData = await getCloudinarySignature();
      
      for (let i = 0; i < stagedFiles.length; i++) {
        const item = stagedFiles[i];
        const { file, category, album_id, is_curated, is_featured } = item;
        
        console.log(`Uploading file ${i + 1}/${stagedFiles.length}: ${file.name}`);
        
        // 1. Upload MASTER to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `masters/${fileName}`;

        const { data: storageData, error: storageError } = await supabase.storage
          .from('master-collection')
          .upload(filePath, file);

        if (storageError) {
           console.error("Supabase Storage Error:", storageError);
           throw new Error(`Original photo upload failed for ${file.name}. Ensure 'master-collection' bucket exists.`);
        }

        const { data: { publicUrl: rawImageUrl } } = supabase.storage
          .from('master-collection')
          .getPublicUrl(filePath);

        // 2. Prepare Cloudinary Preview (Resize if >10MB)
        let fileToUploadToCloudinary: File | Blob = file;
        if (file.size > 10 * 1024 * 1024) {
           console.log(`Generating web preview for ${file.name}...`);
           const img = document.createElement('img');
           img.src = URL.createObjectURL(file);
           await new Promise(resolve => img.onload = resolve);
           
           const canvas = document.createElement('canvas');
           const ctx = canvas.getContext('2d');
           const MAX_WIDTH = 2500;
           let width = img.width;
           let height = img.height;

           if (width > MAX_WIDTH) {
             height *= MAX_WIDTH / width;
             width = MAX_WIDTH;
           }
           
           canvas.width = width;
           canvas.height = height;
           ctx?.drawImage(img, 0, 0, width, height);
           
           fileToUploadToCloudinary = await new Promise(resolve => 
             canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.8)
           ) as Blob;
        }

        // 3. Prepare Cloudinary Payload
        const directData = new FormData();
        directData.append("file", fileToUploadToCloudinary);
        directData.append("api_key", signData.apiKey!);
        directData.append("timestamp", signData.timestamp.toString());
        directData.append("signature", signData.signature);
        directData.append("folder", signData.folder);
        if (signData.image_metadata) {
           directData.append("image_metadata", "true");
        }
        if (signData.exif) {
           directData.append("exif", "true");
        }
        
        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
          { method: "POST", body: directData }
        );
        
        const res = await uploadResponse.json();
        if (res.error) throw new Error(res.error.message || "Cloudinary upload failed");
        
        // 4. Archive in Database with Dual Links & Technical Metadata
        const techDetails = parseTechnicalMetadata(res);
        
        const result = await addPhoto({
          title: "RCV Frame",
          category: category,
          album_id: album_id || null,
          is_featured: is_featured,
          is_curated: is_curated,
          image_url: res.secure_url,
          raw_image_url: rawImageUrl,
          raw_storage_path: filePath,
          public_id: res.public_id,
          width: res.width,
          height: res.height,
          // Technical Details
          ...techDetails
        }) as any;
        
        if (result?.success) {
          setPhotos(prev => [result.data, ...prev]);
        }
      }

      setStagedFiles([]);
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
          <h1 className="text-5xl font-black uppercase tracking-tighter text-foreground mb-2">Photo Library</h1>
          <p className="text-zinc-400 font-light tracking-wide uppercase text-[10px]">Managing {photos.length} photos in your library</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setIsUploadOpen(!isUploadOpen)} 
             className={`px-8 py-4 ${isUploadOpen ? 'bg-secondary text-white border border-white/10' : 'bg-brand-accent text-black shadow-brand-glow'} text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 rounded-full shadow-lg`}
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
             <div className="bg-card p-6 md:p-10 border border-white/5 rounded-[2rem] mb-12 shadow-premium">
                <div className="space-y-8">
                   {/* Dropzone */}
                   <div 
                     {...getRootProps()} 
                     className={`border-2 border-dashed h-48 rounded-[1.5rem] flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${
                       isDragActive ? 'border-brand-accent bg-brand-accent/5' : 'border-white/5 hover:border-brand-accent/30 bg-secondary'
                     }`}
                   >
                      <input {...getInputProps()} />
                      <div className="p-4 bg-card rounded-full text-zinc-500 shadow-sm border border-white/5">
                         <Upload size={24} />
                      </div>
                      <div className="text-center">
                         <p className="text-[10px] font-black uppercase tracking-widest text-white">Drag & drop photos here to stage them</p>
                         <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">Supports High-Res RAW / JPG / WEBP (Max 20)</p>
                      </div>
                   </div>

                   {/* Staging Area */}
                   {stagedFiles.length > 0 && (
                     <div className="space-y-4">
                        <div className="flex justify-between items-center px-4">
                           <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Photos Ready to Upload ({stagedFiles.length})</h3>
                           <button onClick={() => setStagedFiles([])} className="text-[8px] font-black uppercase tracking-widest text-red-500 hover:text-red-400">Clear All</button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                           {stagedFiles.map((item, index) => (
                             <div key={index} className="bg-secondary border border-white/5 p-4 rounded-[1.5rem] flex flex-col xl:flex-row items-center gap-6 group transition-colors hover:border-brand-accent/20">
                                {/* Preview & Info */}
                                <div className="flex items-center gap-4 w-full xl:w-1/4">
                                   <div className="w-16 h-16 bg-card rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                                      <img src={item.preview} className="w-full h-full object-cover" />
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-[10px] font-black text-white uppercase truncate mb-1">{item.file.name}</p>
                                      <p className={`text-[8px] font-bold uppercase tracking-widest ${item.file.size > 50*1024*1024 ? 'text-red-500' : 'text-zinc-500'}`}>
                                         {(item.file.size / (1024 * 1024)).toFixed(1)}MB {item.file.size > 50*1024*1024 && '[TOO LARGE]'}
                                      </p>
                                   </div>
                                </div>

                                {/* Granular Controls */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                                   <div className="space-y-1.5">
                                      <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Portfolio Tag</label>
                                      <select 
                                        value={item.category} 
                                        onChange={(e) => updateStaged(index, { category: e.target.value })}
                                        className="w-full bg-card border border-white/5 px-4 py-2 text-[10px] font-black uppercase text-white outline-none focus:border-brand-accent transition-all rounded-full"
                                      >
                                         {PORTFOLIO_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                                      </select>
                                   </div>
                                   <div className="space-y-1.5">
                                      <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Client Album</label>
                                      <select 
                                        value={item.album_id} 
                                        onChange={(e) => updateStaged(index, { album_id: e.target.value })}
                                        className="w-full bg-card border border-white/5 px-4 py-2 text-[10px] font-black uppercase text-white outline-none focus:border-brand-accent transition-all rounded-full"
                                      >
                                         <option value="">No Album</option>
                                         {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                                      </select>
                                   </div>
                                   <div className="flex items-center gap-3 pt-4 md:pt-0">
                                      <button 
                                        onClick={() => updateStaged(index, { is_curated: !item.is_curated })}
                                        className={`flex-1 py-2.5 px-3 border rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                                          item.is_curated ? 'bg-brand-accent border-brand-accent text-black shadow-sm' : 'bg-card border-white/5 text-zinc-500'
                                        }`}
                                      >
                                         {item.is_curated ? 'Show on Portfolio' : 'Hide from Portfolio'}
                                      </button>
                                      <button 
                                        onClick={() => updateStaged(index, { is_featured: !item.is_featured })}
                                        className={`flex-1 py-2.5 px-3 border rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                                          item.is_featured ? 'bg-brand-accent border-brand-accent text-black shadow-sm' : 'bg-card border-white/5 text-zinc-500'
                                        }`}
                                      >
                                         {item.is_featured ? 'Featured' : 'Standard'}
                                      </button>
                                   </div>
                                   <div className="flex items-center justify-end">
                                      <button onClick={() => removeStaged(index)} className="p-3 text-zinc-500 hover:text-red-500 transition-colors bg-card rounded-full border border-white/5 hover:border-red-500/20 shadow-sm">
                                         <Trash2 size={16} />
                                      </button>
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>

                        <div className="pt-8 border-t border-white/5">
                           <button 
                             disabled={uploadLoading || stagedFiles.some(f => f.file.size > 50*1024*1024)}
                             onClick={handleBatchUpload}
                             className="w-full py-5 bg-brand-accent text-black font-black uppercase tracking-[0.3em] text-[10px] hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-brand-glow rounded-full"
                           >
                              {uploadLoading ? <Loader2 className="animate-spin" size={16} /> : <>Upload staged photos <Upload size={16} /></>}
                           </button>
                           {stagedFiles.some(f => f.file.size > 50*1024*1024) && (
                             <p className="text-center text-red-500 text-[8px] font-black uppercase tracking-widest mt-4">One or more files exceed the 50MB Upload Limit</p>
                           )}
                        </div>
                     </div>
                   )}
                </div>
             </div>
           </motion.section>
         )}
      </AnimatePresence>

      {/* FILTERS & SEARCH */}
      <section className="bg-card p-6 border border-white/5 rounded-[2rem] flex flex-col md:flex-row gap-6 items-center shadow-premium">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Search your library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary border border-white/5 pl-12 pr-6 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-brand-accent transition-all"
            />
         </div>
         <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setCategoryFilter(cat)}
                className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                  categoryFilter === cat ? 'bg-brand-accent border-brand-accent text-black shadow-brand-glow' : 'bg-card border-white/5 text-zinc-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
         </div>
      </section>

      {/* ASSET GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 3xl:grid-cols-10 gap-6">
         {filteredPhotos.map((photo) => (
           <motion.div 
              layout
              key={photo.id}
              className={`relative aspect-square group bg-card border transition-all overflow-hidden rounded-[1.5rem] shadow-premium ${
                selectedPhoto?.id === photo.id ? 'border-brand-accent ring-4 ring-brand-glow' : 'border-white/5'
              }`}
           >
              <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
              
              {/* Curation Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                 {photo.is_curated ? (
                   <div className="bg-brand-accent text-black px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                      <Check size={8} strokeWidth={4} /> Live
                   </div>
                 ) : (
                   <div className="bg-secondary/90 backdrop-blur-md text-zinc-500 px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-widest flex items-center gap-1 border border-white/5">
                      <X size={8} strokeWidth={4} /> Hidden
                   </div>
                 )}
                 {photo.is_featured && (
                   <div className="bg-black text-white px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                      <Star size={8} fill="currentColor" /> Featured
                   </div>
                 )}
              </div>

              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-card/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-5">
                 <div className="flex justify-between items-start">
                    <button 
                      onClick={() => handleToggleFeatured(photo)}
                      className={`p-2.5 rounded-full transition-all shadow-sm ${photo.is_featured ? 'text-black bg-brand-accent' : 'text-zinc-500 hover:text-white bg-secondary border border-white/5'}`}
                    >
                      <Star size={14} fill={photo.is_featured ? "currentColor" : "none"} />
                    </button>
                    <div className="flex gap-2">
                       <button onClick={() => setSelectedPhoto(photo)} className="p-2.5 text-zinc-500 hover:text-white bg-secondary border border-white/5 rounded-full transition-all shadow-sm"><Edit3 size={14} /></button>
                    </div>
                 </div>
                 <div className="flex justify-between items-end">
                    <div className="max-w-[70%]">
                       <p className="text-[10px] font-black uppercase tracking-tighter text-white truncate leading-none mb-1">{photo.title}</p>
                       <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{photo.category}</p>
                    </div>
                    <button onClick={() => handleDelete(photo)} className="p-2.5 text-zinc-500 hover:text-red-500 bg-secondary border border-white/5 rounded-full transition-all shadow-sm"><Trash2 size={14} /></button>
                 </div>
              </div>

              {isProcessing === photo.id && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                   <Loader2 className="animate-spin text-brand-accent" />
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
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                className="relative w-full max-w-xl h-full bg-card border-l border-white/5 p-12 overflow-y-auto shadow-2xl"
              >
                 <button onClick={() => setSelectedPhoto(null)} className="absolute top-10 right-10 text-zinc-500 hover:text-white transition-colors p-2 bg-secondary rounded-full border border-white/5"><X size={20} /></button>
                 
                 <div className="mb-12">
                    <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Photo Details</span>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-none mb-4">Edit Details</h2>
                 </div>

                 <div className="aspect-video w-full bg-secondary rounded-[1.5rem] overflow-hidden mb-12 border border-white/5 relative group shadow-premium">
                    <img src={selectedPhoto.image_url} alt="Preview" className="w-full h-full object-cover" />
                    {selectedPhoto.raw_image_url && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a 
                          href={selectedPhoto.raw_image_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-8 py-4 bg-brand-accent text-black font-black uppercase tracking-widest text-[10px] rounded-full flex items-center gap-2 hover:brightness-110 transition-all shadow-brand-glow"
                        >
                          <Download size={14} /> Download Original Photo
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Technical Narrative - Premium Pills */}
                  {(selectedPhoto.iso || selectedPhoto.aperture || selectedPhoto.shutter_speed) && (
                    <div className="flex flex-wrap gap-3 mb-12">
                       {selectedPhoto.iso && (
                         <div className="px-6 py-2.5 bg-secondary border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-sm">
                            ISO {selectedPhoto.iso}
                         </div>
                       )}
                       {selectedPhoto.aperture && (
                         <div className="px-6 py-2.5 bg-secondary border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-sm">
                            {selectedPhoto.aperture.includes('f/') ? selectedPhoto.aperture.toUpperCase() : `F/${selectedPhoto.aperture}`}
                         </div>
                       )}
                       {selectedPhoto.shutter_speed && (
                         <div className="px-6 py-2.5 bg-secondary border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-sm">
                            {selectedPhoto.shutter_speed}S
                         </div>
                       )}
                       {selectedPhoto.focal_length && (
                         <div className="px-6 py-2.5 bg-secondary border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-sm">
                            {selectedPhoto.focal_length}
                         </div>
                       )}
                    </div>
                  )}

                  {(selectedPhoto.camera_model || selectedPhoto.lens_model) && (
                    <div className="space-y-2 mb-12">
                       {selectedPhoto.camera_model && (
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shadow-brand-glow" /> {selectedPhoto.camera_model}
                         </p>
                       )}
                       {selectedPhoto.lens_model && (
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" /> {selectedPhoto.lens_model}
                         </p>
                       )}
                    </div>
                  )}
                  <div className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Photo Title</label>
                       <input 
                         className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none focus:border-brand-accent transition-all text-sm font-bold rounded-full shadow-sm"
                         value={selectedPhoto.title || ""}
                         onChange={(e) => setSelectedPhoto({ ...selectedPhoto, title: e.target.value })}
                         onBlur={(e) => handleUpdatePhoto(selectedPhoto.id, { title: e.target.value })}
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Category Tag</label>
                          <select 
                            className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none focus:border-brand-accent transition-all text-sm font-bold uppercase rounded-full shadow-sm"
                            value={selectedPhoto.category || ""}
                            onChange={(e) => handleUpdatePhoto(selectedPhoto.id, { category: e.target.value })}
                          >
                             {PORTFOLIO_TAGS.map(tag => (
                               <option key={tag} value={tag}>{tag}</option>
                             ))}
                          </select>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Photo Album</label>
                          <select 
                            className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none focus:border-brand-accent transition-all text-sm font-bold uppercase rounded-full shadow-sm"
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
                       <div className="flex items-center justify-between p-8 bg-secondary border border-white/5 rounded-[1.5rem] shadow-sm">
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Public Portfolio</p>
                             <p className="text-[9px] text-zinc-500 uppercase">Surface this asset on your public website</p>
                          </div>
                          <button 
                            onClick={() => handleToggleCurated(selectedPhoto)}
                            className={`w-14 h-7 rounded-full relative transition-all ${selectedPhoto.is_curated ? 'bg-brand-accent' : 'bg-background'}`}
                          >
                             <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${selectedPhoto.is_curated ? 'left-8' : 'left-1'}`} />
                          </button>
                       </div>
  
                       <div className="flex items-center justify-between p-8 bg-secondary border border-white/5 rounded-[1.5rem] shadow-sm">
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Feature on Homepage</p>
                             <p className="text-[9px] text-zinc-500 uppercase">Surface this asset in "The Edit" carousel</p>
                          </div>
                          <button 
                            onClick={() => handleToggleFeatured(selectedPhoto)}
                            className={`w-14 h-7 rounded-full relative transition-all ${selectedPhoto.is_featured ? 'bg-brand-accent' : 'bg-background'}`}
                          >
                             <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${selectedPhoto.is_featured ? 'left-8' : 'left-1'}`} />
                          </button>
                       </div>

                       {selectedPhoto.raw_image_url && (
                         <div className="flex items-center justify-between p-8 bg-brand-accent/5 border border-brand-accent/20 rounded-[1.5rem] shadow-sm">
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent mb-1">Original Photo Archive</p>
                               <p className="text-[9px] text-zinc-500 uppercase">High-resolution archive is active and secure</p>
                            </div>
                            <div className="p-3 bg-card rounded-full text-brand-accent shadow-sm border border-brand-accent/20">
                               <HardDrive size={18} />
                            </div>
                         </div>
                       )}
                    </div>

                    <div className="pt-10 border-t border-white/5">
                       <button 
                         onClick={() => handleDelete(selectedPhoto)}
                         className="w-full py-5 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded-full flex items-center justify-center gap-2 shadow-sm"
                       >
                          <Trash2 size={16} /> Delete Photo Permanently
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

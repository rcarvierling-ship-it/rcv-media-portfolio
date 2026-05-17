"use client";

import { useState, useMemo } from "react";
import { 
  Search, Filter, Plus, Trash2, 
  Edit3, Star, Check, X, 
  Loader2, Upload, ExternalLink,
  ChevronDown, Grid, List as ListIcon,
  ImageIcon, MoreVertical,
  ChevronUp, Tag, Download, HardDrive, EyeOff
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
  const [activeTab, setActiveTab] = useState<"all" | "upload" | "curated" | "hidden" | "featured">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  
  // Upload State
  const [stagedFiles, setStagedFiles] = useState<any[]>([]); // { file, category, album_id, is_curated, is_featured }
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const router = useRouter();
  const supabase = createClient();

  // Dynamically extract all unique categories currently in use, merging with core defaults
  const PORTFOLIO_TAGS = useMemo(() => {
    const existing = Array.from(new Set(photos.map(p => p.category).filter(Boolean))) as string[];
    const defaults = ["Sports", "Basketball", "Volleyball", "Football", "Soccer", "Portraits", "Lifestyle", "Events", "Cinematic"];
    const normalized = Array.from(new Set([...defaults, ...existing].map(t => t.charAt(0).toUpperCase() + t.slice(1))));
    return normalized.sort();
  }, [photos]);

  const categories = useMemo(() => ["All", ...PORTFOLIO_TAGS], [PORTFOLIO_TAGS]);

  const filteredPhotos = useMemo(() => {
    return photos.filter(p => {
      const matchesSearch = (p.title?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      
      let matchesTab = true;
      if (activeTab === "curated") matchesTab = p.is_curated === true;
      else if (activeTab === "hidden") matchesTab = p.is_curated !== true;
      else if (activeTab === "featured") matchesTab = p.is_featured === true;
      
      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [photos, searchTerm, categoryFilter, activeTab]);

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
    const newStatus = !photo.is_featured;
    try {
      await updatePhoto(photo.id, { is_featured: newStatus });
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, is_featured: newStatus } : p));
      if (selectedPhoto?.id === photo.id) {
        setSelectedPhoto({ ...selectedPhoto, is_featured: newStatus });
      }
    } catch (err) {
      alert("Featured toggle failed.");
    }
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
    const newStatus = !photo.is_curated;
    try {
      await updatePhoto(photo.id, { is_curated: newStatus });
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, is_curated: newStatus } : p));
      if (selectedPhoto?.id === photo.id) {
        setSelectedPhoto({ ...selectedPhoto, is_curated: newStatus });
      }
    } catch (err) {
      alert("Curated toggle failed.");
    }
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

        if (!uploadResponse.ok) {
          const errText = await uploadResponse.text();
          console.error("Cloudinary Error response:", errText);
          throw new Error(`Cloudinary upload failed: ${errText}`);
        }

        const res = await uploadResponse.json();
        const techDetails = parseTechnicalMetadata(res);

        // 4. Create database entry
        const result = await addPhoto({
          title: file.name.split('.')[0].replace(/[-_]/g, ' '),
          image_url: res.secure_url,
          public_id: res.public_id,
          category,
          album_id: album_id || null,
          is_curated: is_curated || false,
          is_featured: is_featured || false,
          raw_image_url: rawImageUrl,
          raw_storage_path: filePath,
          // Dimensions
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
      setActiveTab("all");
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
          <h1 className="text-5xl font-black uppercase tracking-tighter text-foreground mb-2 italic">Media Library</h1>
          <p className="text-zinc-400 font-black tracking-[0.4em] uppercase text-[10px]">Manage, upload, and curate portfolio and master library assets</p>
        </div>
      </header>

      {/* MULTI-TAB ARCHITECTURE */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-8">
        {[
          { id: "all", label: "All Photos", count: photos.length, icon: ImageIcon },
          { id: "upload", label: "Upload Batch", count: stagedFiles.length || null, icon: Upload },
          { id: "curated", label: "Curated Hub (Live)", count: photos.filter(p => p.is_curated).length, icon: Star },
          { id: "hidden", label: "Hidden Library", count: photos.filter(p => !p.is_curated).length, icon: EyeOff },
          { id: "featured", label: "Featured Edit", count: photos.filter(p => p.is_featured).length, icon: Check }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedPhoto(null); // Clear sidebar
              }}
              className={`px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                isActive 
                  ? "bg-brand-accent border-brand-accent text-black shadow-brand-glow" 
                  : "bg-card border-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              <Icon size={12} />
              {tab.label} {tab.count !== null && <span className="opacity-60 ml-0.5">({tab.count})</span>}
            </button>
          );
        })}
      </div>

      {activeTab === "upload" ? (
        /* INLINE UPLOAD COMPONENT */
        <div className="bg-card p-6 md:p-12 border border-white/5 rounded-[2.5rem] shadow-premium max-w-7xl">
           <div className="space-y-8">
              {/* Dropzone */}
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed h-56 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${
                  isDragActive ? 'border-brand-accent bg-brand-accent/5' : 'border-white/5 hover:border-brand-accent/30 bg-secondary'
                }`}
              >
                 <input {...getInputProps()} />
                 <div className="p-4 bg-card rounded-full text-zinc-500 shadow-sm border border-white/5">
                    <Upload size={28} />
                 </div>
                 <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Drag & drop photos here to stage them</p>
                    <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">Supports High-Res RAW / JPG / WEBP (Max 20)</p>
                 </div>
              </div>

              {/* Staging Area */}
              {stagedFiles.length > 0 ? (
                <div className="space-y-6">
                   <div className="flex justify-between items-center px-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Photos Ready to Upload ({stagedFiles.length})</h3>
                      <button onClick={() => setStagedFiles([])} className="text-[8px] font-black uppercase tracking-widest text-red-500 hover:text-red-400">Clear All</button>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2">
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
                                    value={PORTFOLIO_TAGS.includes(item.category) ? item.category : "Custom"} 
                                    onChange={(e) => {
                                       if (e.target.value === "Custom") {
                                          updateStaged(index, { category: "New Tag" });
                                       } else {
                                          updateStaged(index, { category: e.target.value });
                                       }
                                    }}
                                    className="w-full bg-card border border-white/5 px-4 py-2 text-[10px] font-black uppercase text-white outline-none focus:border-brand-accent transition-all rounded-full mb-1"
                                  >
                                     {PORTFOLIO_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                                     <option value="Custom">+ Custom...</option>
                                  </select>
                                  {(!PORTFOLIO_TAGS.includes(item.category) || item.category === "New Tag") && (
                                     <input 
                                        type="text"
                                        placeholder="Type custom tag..."
                                        className="w-full bg-black border border-brand-accent/30 px-3 py-1.5 text-[9px] font-bold uppercase text-white outline-none focus:border-brand-accent transition-all rounded-full"
                                        value={item.category === "New Tag" ? "" : item.category || ""}
                                        onChange={(e) => updateStaged(index, { category: e.target.value })}
                                     />
                                  )}
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
              ) : (
                <div className="py-20 text-center opacity-40">
                   <ImageIcon className="mx-auto mb-4 text-zinc-500 animate-pulse" size={48} />
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Your staging area is empty</p>
                   <p className="text-[8px] text-zinc-500 uppercase tracking-widest mt-1">Drag and drop assets above to configure their metadata and upload them</p>
                </div>
              )}
           </div>
        </div>
      ) : (
        /* EXPLORER & EDITING GRID */
        <div className="flex flex-col lg:flex-row gap-10 items-start">
           <div className="flex-1 space-y-10 w-full">
              {/* FILTERS & SEARCH */}
              <section className="bg-card p-6 border border-white/5 rounded-[2rem] flex flex-col md:flex-row gap-6 items-center shadow-premium">
                 <div className="relative flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search this view..."
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                 {filteredPhotos.map((photo) => (
                   <motion.div 
                      layout
                      key={photo.id}
                      className={`relative aspect-square group bg-card border transition-all overflow-hidden rounded-[1.5rem] shadow-premium cursor-pointer ${
                        selectedPhoto?.id === photo.id ? 'border-brand-accent ring-4 ring-brand-glow' : 'border-white/5'
                      }`}
                      onClick={() => setSelectedPhoto(photo)}
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
                              <Star size={8} fill="currentColor" className="text-brand-accent" /> Featured
                           </div>
                         )}
                      </div>

                      {/* Overlay Controls */}
                      <div className="absolute inset-0 bg-card/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-5">
                         <div className="flex justify-between items-start">
                            <button 
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleToggleFeatured(photo);
                              }}
                              className={`p-2.5 rounded-full transition-all shadow-sm ${photo.is_featured ? 'text-black bg-brand-accent' : 'text-zinc-500 hover:text-white bg-secondary border border-white/5'}`}
                            >
                               <Star size={12} fill={photo.is_featured ? "currentColor" : "none"} />
                            </button>
                            <button 
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleToggleCurated(photo);
                              }}
                              className={`p-2.5 rounded-full transition-all shadow-sm ${photo.is_curated ? 'text-black bg-brand-accent' : 'text-zinc-500 hover:text-white bg-secondary border border-white/5'}`}
                            >
                               {photo.is_curated ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                            </button>
                         </div>
                         <div className="min-w-0">
                            <p className="text-[10px] font-black text-white uppercase tracking-wider truncate mb-1">{photo.title}</p>
                            <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">{photo.category}</span>
                         </div>
                      </div>
                   </motion.div>
                 ))}

                 {filteredPhotos.length === 0 && (
                   <div className="col-span-full py-32 text-center opacity-30">
                      <ImageIcon className="mx-auto mb-4 text-zinc-500" size={48} />
                      <p className="text-[10px] font-black uppercase tracking-widest">No matching assets in this view</p>
                   </div>
                 )}
              </div>
           </div>

           {/* EDITING SIDEBAR */}
           <AnimatePresence>
             {selectedPhoto && (
               <div className="w-full lg:w-[480px] flex-shrink-0">
                  <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="bg-card border border-white/5 p-10 rounded-[2.5rem] shadow-premium sticky top-36 overflow-y-auto max-h-[calc(100vh-200px)]"
                  >
                     <div className="flex justify-between items-start mb-8">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent mb-1">Asset Control</p>
                           <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Edit Metadata</h2>
                        </div>
                        <button 
                          onClick={() => setSelectedPhoto(null)} 
                          className="p-3 bg-secondary rounded-full border border-white/5 text-zinc-400 hover:text-white transition-colors"
                        >
                           <X size={16} />
                        </button>
                     </div>

                     <div className="aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-8 border border-white/5 relative group/preview">
                        <img src={selectedPhoto.image_url} className="w-full h-full object-cover" />
                        <a 
                          href={selectedPhoto.image_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute bottom-4 right-4 p-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-full text-white opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center hover:scale-105 active:scale-95"
                          title="Open full resolution"
                        >
                           <ExternalLink size={14} />
                        </a>
                     </div>

                     {/* Technical EXIF Info Bar */}
                     {(selectedPhoto.camera_model || selectedPhoto.aperture || selectedPhoto.shutter_speed || selectedPhoto.iso) && (
                       <div className="flex flex-wrap gap-3 mb-10 pb-8 border-b border-white/5">
                          {selectedPhoto.iso && (
                            <div className="px-6 py-2.5 bg-secondary border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-sm">
                               ISO {selectedPhoto.iso}
                            </div>
                          )}
                          {selectedPhoto.aperture && (
                            <div className="px-6 py-2.5 bg-secondary border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-sm">
                               {selectedPhoto.aperture}
                            </div>
                          )}
                          {selectedPhoto.shutter_speed && (
                            <div className="px-6 py-2.5 bg-secondary border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-sm">
                               {selectedPhoto.shutter_speed}
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
                              <div className="space-y-3">
                                 <select 
                                   className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none focus:border-brand-accent transition-all text-sm font-bold uppercase rounded-full shadow-sm"
                                   value={PORTFOLIO_TAGS.includes(selectedPhoto.category) ? selectedPhoto.category : "Custom"}
                                   onChange={(e) => {
                                      if (e.target.value === "Custom") {
                                         handleUpdatePhoto(selectedPhoto.id, { category: "New Tag" });
                                      } else {
                                         handleUpdatePhoto(selectedPhoto.id, { category: e.target.value });
                                      }
                                   }}
                                 >
                                    {PORTFOLIO_TAGS.map(tag => (
                                      <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                    <option value="Custom">+ Create Custom...</option>
                                 </select>
                                 
                                 {(!PORTFOLIO_TAGS.includes(selectedPhoto.category) || selectedPhoto.category === "New Tag") && (
                                    <input 
                                       type="text"
                                       placeholder="TYPE CUSTOM TAG..."
                                       className="w-full bg-black border border-brand-accent/30 px-6 py-4 text-white outline-none focus:border-brand-accent transition-all text-sm font-bold uppercase rounded-[1.5rem] shadow-brand-glow"
                                       defaultValue={selectedPhoto.category === "New Tag" ? "" : selectedPhoto.category || ""}
                                       onBlur={(e) => {
                                          const newTag = e.target.value.trim();
                                          if (newTag) {
                                             handleUpdatePhoto(selectedPhoto.id, { category: newTag });
                                          }
                                       }}
                                       onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                             const newTag = (e.target as HTMLInputElement).value.trim();
                                             if (newTag) {
                                                handleUpdatePhoto(selectedPhoto.id, { category: newTag });
                                                (e.target as HTMLInputElement).blur();
                                             }
                                          }
                                       }}
                                    />
                                 )}
                              </div>
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
      )}
    </div>
  );
}

import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { AlbumClientView } from './client';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: album } = await supabase.from('albums').select('*').eq('slug', slug).single();

  if (!album) return { title: 'Album Not Found' };

  return {
    title: `${album.title} | RCV.Media`,
    description: album.description || `View the ${album.title} collection by RCV.Media.`,
    openGraph: {
      title: album.title,
      description: album.description,
      type: 'website',
    },
  };
}

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: album } = await supabase
    .from('albums')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!album) notFound();

  if (album.is_private) {
    redirect(`/vault/${slug}`);
  }

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('album_id', album.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  return <AlbumClientView album={album} initialPhotos={photos || []} />;
}

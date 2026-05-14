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
    .select('*, bookings(*, contracts(*))')
    .eq('slug', slug)
    .single();

  if (!album) notFound();

  if (album.is_private) {
    redirect(`/vault/${slug}`);
  }

  // Determine if downloads are locked based on payment status
  // An album is locked if it's linked to a booking that has a contract which isn't fully paid
  const booking = album.bookings?.[0];
  const contract = booking?.contracts?.[0];
  const isLocked = contract ? !contract.is_final_paid : false;

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('album_id', album.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  return (
    <AlbumClientView 
      album={album} 
      initialPhotos={photos || []} 
      isLocked={isLocked}
      contractId={contract?.id}
    />
  );
}

import { ImageResponse } from 'next/og';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';

export const alt = 'RCV.Media - Social Preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: album } = await supabase
    .from('albums')
    .select('title, cover_image_url, client_name')
    .eq('slug', params.slug)
    .single();

  if (!album) {
    return new ImageResponse(
      (
        <div
          style={{
            background: 'black',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'sans-serif',
            fontSize: 48,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-0.05em',
          }}
        >
          RCV.Media // Portfolio
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Image with Blur */}
        {album.cover_image_url && (
          <img
            src={album.cover_image_url}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.6,
            }}
          />
        )}
        
        {/* Vignette Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.8) 100%)',
          }}
        />

        {/* Branded Elements */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0 80px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.4em',
              marginBottom: 40,
            }}
          >
            Official Collection
          </div>
          
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '-0.06em',
              lineHeight: 0.9,
              marginBottom: 40,
              fontStyle: 'italic',
            }}
          >
            {album.title}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <div style={{ width: 40, height: 2, background: 'rgba(255,255,255,0.2)' }} />
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
              }}
            >
              Client: {album.client_name || 'Official Portfolio'}
            </div>
            <div style={{ width: 40, height: 2, background: 'rgba(255,255,255,0.2)' }} />
          </div>
        </div>

        {/* Footer Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 12,
            fontWeight: 900,
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            letterSpacing: '1em',
          }}
        >
          RCV.Media // Agency Intelligence
        </div>
      </div>
    ),
    { ...size }
  );
}

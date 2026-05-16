import { ImageResponse } from 'next/og';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';

export const alt = 'RCV.Media - Secure Vault Access';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: album } = await supabase
    .from('albums')
    .select('title, cover_image_url, client_name')
    .eq('slug', params.slug)
    .single();

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background Image with Dark Tint */}
        {album?.cover_image_url && (
          <img
            src={album.cover_image_url}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.2,
              filter: 'grayscale(100%)',
            }}
          />
        )}
        
        {/* Grid Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        {/* Tactical Border */}
        <div
          style={{
            position: 'absolute',
            inset: 40,
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />

        {/* Branded Security Elements */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 100px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 20px',
              background: 'rgba(200, 255, 0, 0.1)',
              border: '1px solid rgba(200, 255, 0, 0.3)',
              borderRadius: 100,
              marginBottom: 40,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C8FF00' }} />
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: '#C8FF00',
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
              }}
            >
              Secure Client Vault
            </div>
          </div>
          
          <div
            style={{
              fontSize: 84,
              fontWeight: 900,
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
              lineHeight: 0.9,
              marginBottom: 20,
              fontStyle: 'italic',
            }}
          >
            {album?.title || 'Private Session'}
          </div>

          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.5em',
              marginTop: 20,
            }}
          >
            Confidential Client Delivery
          </div>
        </div>

        {/* Security Meta */}
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 80,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
           <div style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Access Protocol</div>
           <div style={{ fontSize: 12, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Encrypted // Passcode Required</div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 80,
            right: 80,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4,
          }}
        >
           <div style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Status</div>
           <div style={{ fontSize: 12, fontWeight: 900, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ready for Review</div>
        </div>
      </div>
    ),
    { ...size }
  );
}

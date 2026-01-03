import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doodleId = searchParams.get('id');

    if (!doodleId) {
      return new Response('Missing doodle ID', { status: 400 });
    }

    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response('Supabase not configured', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch doodle data
    const { data: doodle, error } = await supabase
      .from('doodles')
      .select('*')
      .eq('id', doodleId)
      .single();

    if (error || !doodle) {
      return new Response('Doodle not found', { status: 404 });
    }

    const username = doodle.user_username || 'Artist';
    const promptTitle = doodle.prompt_title || 'Daily Doodle';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            backgroundColor: '#fffaed',
            padding: '40px',
          }}
        >
          {/* Left side - Doodle image */}
          <div
            style={{
              display: 'flex',
              width: '500px',
              height: '500px',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
            }}
          >
            <img
              src={doodle.image_url}
              width={500}
              height={500}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Right side - Info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              marginLeft: '50px',
              flex: 1,
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '30px',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: '#f17313',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px',
                }}
              >
                <span style={{ fontSize: '28px' }}>✏️</span>
              </div>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#1c1917',
                }}
              >
                Daily Doodle Prompt
              </span>
            </div>

            {/* Prompt title */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: 700,
                color: '#1c1917',
                lineHeight: 1.2,
                marginBottom: '20px',
                maxWidth: '550px',
                display: 'flex',
              }}
            >
              "{promptTitle}"
            </div>

            {/* Artist info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '28px',
                color: '#78716c',
              }}
            >
              <span style={{ marginRight: '10px' }}>🎨</span>
              <span>by </span>
              <span
                style={{
                  color: '#f17313',
                  fontWeight: 600,
                  marginLeft: '8px',
                }}
              >
                {username}
              </span>
            </div>

            {/* CTA */}
            <div
              style={{
                display: 'flex',
                marginTop: '40px',
                backgroundColor: '#f17313',
                color: '#fff',
                padding: '15px 30px',
                borderRadius: '50px',
                fontSize: '22px',
                fontWeight: 600,
              }}
            >
              View on dailydoodleprompt.com
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG image error:', error);
    return new Response('Error generating image', { status: 500 });
  }
}

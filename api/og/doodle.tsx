export const config = {
  runtime: 'edge',
};

import { ImageResponse } from '@vercel/og';

export default async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Daily Doodle';
  const username = searchParams.get('username') || 'Artist';
  const imageUrl = searchParams.get('image') || '';

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
        <div
          style={{
            display: 'flex',
            width: '500px',
            height: '500px',
            borderRadius: '20px',
            backgroundColor: '#f5f0e6',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              width={500}
              height={500}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div style={{ fontSize: '120px' }}>🎨</div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginLeft: '50px',
            flex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
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
                fontSize: '30px',
              }}
            >
              ✏️
            </div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#1c1917' }}>
              Daily Doodle Prompt
            </div>
          </div>

          <div
            style={{
              fontSize: '44px',
              fontWeight: 700,
              color: '#1c1917',
              lineHeight: 1.2,
              marginBottom: '20px',
              maxWidth: '550px',
            }}
          >
            &ldquo;{title}&rdquo;
          </div>

          <div style={{ display: 'flex', alignItems: 'center', fontSize: '28px', color: '#78716c' }}>
            🎨 by{' '}
            <span style={{ color: '#f17313', fontWeight: 600, marginLeft: '8px' }}>
              {username}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: '40px',
              backgroundColor: '#f17313',
              color: '#ffffff',
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
}

export const config = {
  runtime: 'edge',
};

import { ImageResponse } from '@vercel/og';

export default async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Daily Doodle Prompt';
  const category = searchParams.get('category') || 'Creative';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const dateObj = new Date(date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#fffaed',
          padding: '60px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#f17313',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              fontSize: '36px',
            }}
          >
            ✏️
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#1c1917' }}>
            Daily Doodle Prompt
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '50px 60px',
            boxShadow: '0 10px 60px rgba(0,0,0,0.1)',
            maxWidth: '1000px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f17313',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: '50px',
              fontSize: '20px',
              fontWeight: 600,
              marginBottom: '30px',
            }}
          >
            {formattedDate}
          </div>

          <div
            style={{
              fontSize: '48px',
              fontWeight: 700,
              color: '#1c1917',
              textAlign: 'center',
              lineHeight: 1.3,
              marginBottom: '30px',
              maxWidth: '900px',
            }}
          >
            &ldquo;{title}&rdquo;
          </div>

          <div
            style={{
              display: 'flex',
              backgroundColor: '#f5f0e6',
              padding: '8px 20px',
              borderRadius: '20px',
              fontSize: '24px',
              color: '#78716c',
            }}
          >
            🏷️ {category}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: '40px',
            fontSize: '24px',
            color: '#78716c',
          }}
        >
          Join the daily creative challenge at{' '}
          <span style={{ color: '#f17313', fontWeight: 600, marginLeft: '8px' }}>
            dailydoodleprompt.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

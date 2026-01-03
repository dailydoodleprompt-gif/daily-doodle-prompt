export const config = {
  runtime: 'edge',
};

import { ImageResponse } from '@vercel/og';

export default async function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'Artist';
    const doodles = searchParams.get('doodles') || '0';
    const streak = searchParams.get('streak') || '0';
    const badges = searchParams.get('badges') || '0';
    const title = searchParams.get('title') || '';
    const isPremium = searchParams.get('premium') === 'true';

    const initial = username.charAt(0).toUpperCase();

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
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'absolute',
              top: '40px',
              left: '50px',
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
                fontSize: '30px',
              }}
            >
              ✏️
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

          {/* Main card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '50px 80px',
              boxShadow: '0 10px 60px rgba(0,0,0,0.1)',
              alignItems: 'center',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '60px',
                backgroundColor: '#f17313',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                fontSize: '56px',
                color: '#ffffff',
                fontWeight: 700,
                position: 'relative',
              }}
            >
              {initial}
              {isPremium && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '18px',
                    backgroundColor: '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                  }}
                >
                  👑
                </div>
              )}
            </div>

            {/* Username */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: 700,
                color: '#1c1917',
                marginBottom: title ? '8px' : '30px',
              }}
            >
              {username}
            </div>

            {/* Title */}
            {title && (
              <div
                style={{
                  fontSize: '24px',
                  color: '#78716c',
                  fontStyle: 'italic',
                  marginBottom: '30px',
                }}
              >
                {title}
              </div>
            )}

            {/* Stats row */}
            <div
              style={{
                display: 'flex',
                gap: '40px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '40px', fontWeight: 700, color: '#f17313' }}>
                  {doodles}
                </span>
                <span style={{ fontSize: '18px', color: '#78716c' }}>Doodles</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '40px', fontWeight: 700, color: '#f17313' }}>
                  🔥 {streak}
                </span>
                <span style={{ fontSize: '18px', color: '#78716c' }}>Day Streak</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '40px', fontWeight: 700, color: '#f17313' }}>
                  {badges}
                </span>
                <span style={{ fontSize: '18px', color: '#78716c' }}>Badges</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div
            style={{
              display: 'flex',
              marginTop: '40px',
              backgroundColor: '#f17313',
              color: '#ffffff',
              padding: '15px 40px',
              borderRadius: '50px',
              fontSize: '24px',
              fontWeight: 600,
            }}
          >
            View Profile →
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image Error:', error);
    return new Response('Error generating image', { status: 500 });
  }
}

import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const userId = searchParams.get('id');

    if (!username && !userId) {
      return new Response('Missing username or id', { status: 400 });
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

    // Fetch profile
    let query = supabase.from('profiles').select('*');
    if (userId) {
      query = query.eq('id', userId);
    } else if (username) {
      query = query.eq('username', username);
    }

    const { data: profile, error } = await query.single();

    if (error || !profile) {
      return new Response('Profile not found', { status: 404 });
    }

    // Count doodles
    const { count: doodleCount } = await supabase
      .from('doodles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id);

    // Count badges
    const { count: badgeCount } = await supabase
      .from('badges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id);

    // Get streak from streaks table
    const { data: streakData } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', profile.id)
      .single();

    const streak = streakData?.current_streak || 0;
    const initial = (profile.username || 'U')[0].toUpperCase();
    const isPremium = profile.is_premium || false;

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

          {/* Main card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#fff',
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
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: '56px', color: '#fff', fontWeight: 700 }}>
                {initial}
              </span>
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
                  }}
                >
                  <span style={{ fontSize: '20px' }}>👑</span>
                </div>
              )}
            </div>

            {/* Username */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: 700,
                color: '#1c1917',
                marginBottom: '8px',
                display: 'flex',
              }}
            >
              {profile.username}
            </div>

            {/* Title */}
            {profile.current_title && (
              <div
                style={{
                  fontSize: '24px',
                  color: '#78716c',
                  fontStyle: 'italic',
                  marginBottom: '30px',
                  display: 'flex',
                }}
              >
                {profile.current_title}
              </div>
            )}

            {/* Stats row */}
            <div
              style={{
                display: 'flex',
                gap: '50px',
                marginTop: profile.current_title ? '0' : '22px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '40px', fontWeight: 700, color: '#f17313' }}>
                  {doodleCount || 0}
                </span>
                <span style={{ fontSize: '18px', color: '#78716c' }}>Doodles</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '40px', fontWeight: 700, color: '#f17313', display: 'flex' }}>
                  🔥 {streak}
                </span>
                <span style={{ fontSize: '18px', color: '#78716c' }}>Day Streak</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '40px', fontWeight: 700, color: '#f17313' }}>
                  {badgeCount || 0}
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
              color: '#fff',
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
    console.error('OG image error:', error);
    return new Response('Error generating image', { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createClient as createSupabaseServer } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  
  let origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (!origin) {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
    origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : requestUrl.origin;
  }
  origin = origin.replace(/\/$/, ''); // Remove trailing slash

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const clientId = process.env.LINE_CLIENT_ID!;
  const clientSecret = process.env.LINE_CLIENT_SECRET!;
  const redirectUri = `${origin}/api/auth/line/callback`;

  try {
    // 1. Exchange code for access_token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('LINE Token Error:', tokenData);
      return NextResponse.redirect(`${origin}/login?error=line_token_error`);
    }

    // 2. Fetch user profile from LINE
    const profileResponse = await fetch('https://api.line.me/oauth2/v2.1/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profileData = await profileResponse.json();
    
    if (profileData.error) {
       console.error('LINE Profile Error:', profileData);
       return NextResponse.redirect(`${origin}/login?error=line_profile_error`);
    }

    const { sub: lineId, name, picture, email: lineEmail } = profileData;
    
    // We must ensure the user has an email for Supabase.
    // If LINE doesn't return an email, we create a fallback one.
    const email = lineEmail || `line_${lineId}@jongtour.com`;

    // 3. Initialize Admin Supabase Client
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Generate a deterministic, secure password for this LINE user
    const generatedPassword = `LineAuth@${lineId}!${clientSecret.substring(0, 10)}`;

    // 4. Check if user exists, create or update
    let existingUser = null;
    let page = 1;
    while (true) {
      const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 100 });
      if (listError || !existingUsers || existingUsers.users.length === 0) break;
      
      existingUser = existingUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (existingUser) break;
      
      if (existingUsers.users.length < 100) break;
      page++;
    }

    if (existingUser) {
      // Update existing user with latest LINE data and ensure password is set
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: generatedPassword,
        email_confirm: true,
        user_metadata: {
          ...existingUser.user_metadata,
          full_name: name,
          avatar_url: picture,
          line_id: lineId
        }
      });
    } else {
      // Create new user
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          avatar_url: picture,
          line_id: lineId,
          provider: 'line',
        },
      });

      if (createError) {
        console.error('Supabase Create User Error:', createError);
        return NextResponse.redirect(`${origin}/login?error=user_creation_failed`);
      }
    }

    // 5. Sign in using the deterministic password
    const cookieStore = await cookies();
    const supabaseServer = createSupabaseServer(cookieStore);

    const { error: signInError } = await supabaseServer.auth.signInWithPassword({
      email,
      password: generatedPassword,
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      return NextResponse.redirect(`${origin}/login?error=session_creation_failed`);
    }

    // 6. Success! Redirect to home page
    return NextResponse.redirect(`${origin}/`);

  } catch (err) {
    console.error('LINE Login Callback Exception:', err);
    return NextResponse.redirect(`${origin}/login?error=internal_server_error`);
  }
}

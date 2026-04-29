"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect("/login?error=" + encodeURIComponent(error.message));
  }

  // Redirect to homepage if successful
  redirect("/");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return redirect("/login?error=" + encodeURIComponent(error.message));
  }

  // Since email confirmation is disabled, we can redirect to homepage directly
  redirect("/");
}

import { headers } from "next/headers";

export async function signInWithGoogle() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const origin = (await headers()).get('origin') || 'http://localhost:3000';
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url);
  }
}

export async function signInWithLine() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const origin = (await headers()).get('origin') || 'http://localhost:3000';
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'line' as any,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url);
  }
}

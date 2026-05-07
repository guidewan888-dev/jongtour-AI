'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Return encoded error string to display on client
    redirect('/login?error=Could not authenticate user');
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

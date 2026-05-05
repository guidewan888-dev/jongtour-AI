import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/crypto'

export async function GET(
  request: Request,
  { params }: { params: { provider: string } }
) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/account/dashboard'
  const provider = params.provider

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user && data.session) {
      const email = data.user.email
      
      // 1. Missing Email Check (Rule #6)
      if (!email) {
        return NextResponse.redirect(`${origin}/auth/complete-profile?provider=${provider}&next=${encodeURIComponent(next)}`)
      }

      // 2. Duplicate / Merge Check (Rule #7, #8)
      const existingCustomer = await prisma.customer.findFirst({
        where: { email }
      })

      if (existingCustomer && existingCustomer.userId !== data.user.id) {
        // Security Risk: Email matches but it's a different Supabase user identity.
        // We MUST ask the user to verify ownership of the existing email before linking.
        // Sign them out of this temporary session to force password verification.
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/auth/confirm-link?email=${encodeURIComponent(email)}&provider=${provider}&providerId=${data.user.id}&next=${encodeURIComponent(next)}`)
      }

      // 3. Sync customer data safely
      let customerId = existingCustomer?.id
      if (!existingCustomer) {
        let customerRole = await prisma.role.findUnique({ where: { name: 'CUSTOMER' } })
        if (!customerRole) {
          customerRole = await prisma.role.create({ data: { name: 'CUSTOMER', description: 'Standard B2C Customer' } })
        }
        
        let dbUser = await prisma.user.findUnique({ where: { id: data.user.id } })
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: { id: data.user.id, email: email, passwordHash: 'SUPABASE_OAUTH', roleId: customerRole.id, status: 'ACTIVE' }
          })
        }

        const firstName = data.user.user_metadata?.first_name || data.user.user_metadata?.full_name?.split(' ')[0] || 'Unknown'
        const lastName = data.user.user_metadata?.last_name || data.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'User'
        
        const newCust = await prisma.customer.create({
          data: {
            userId: data.user.id,
            email: email,
            firstName,
            lastName,
            phone: data.user.user_metadata?.phone || ''
          }
        })
        customerId = newCust.id

        // Create Profile
        await prisma.userProfile.create({
          data: {
            userId: data.user.id,
            preferences: { providers: [provider] }
          }
        })
      }

      // 4. Save Encrypted Social Tokens (Rules #1, #2, #3, #4)
      if (customerId && provider !== 'email') {
        const providerToken = data.session.provider_token
        const providerRefreshToken = data.session.provider_refresh_token
        
        await prisma.customerSocialAccount.upsert({
          where: {
            provider_providerUserId: {
              provider: provider,
              providerUserId: data.user.id
            }
          },
          update: {
            accessTokenEncrypted: providerToken ? encrypt(providerToken) : null,
            refreshTokenEncrypted: providerRefreshToken ? encrypt(providerRefreshToken) : null,
            lastLoginAt: new Date(),
            avatarUrl: data.user.user_metadata?.avatar_url,
            displayName: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            providerEmail: email,
          },
          create: {
            customerId: customerId,
            provider: provider,
            providerUserId: data.user.id,
            providerEmail: email,
            displayName: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            avatarUrl: data.user.user_metadata?.avatar_url,
            accessTokenEncrypted: providerToken ? encrypt(providerToken) : null,
            refreshTokenEncrypted: providerRefreshToken ? encrypt(providerRefreshToken) : null,
          }
        })
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}

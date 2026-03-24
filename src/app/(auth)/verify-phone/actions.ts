'use server'

import { redirect } from 'next/navigation'
import { twilioClient, VERIFY_SERVICE_SID } from '@/lib/twilio'
import { createClient } from '@/utils/supabase/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function sendVerificationCode(formData: FormData) {
  const phone = formData.get('phone') as string
  if (!phone) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Update user with phone number in database
  await prisma.user.update({
    where: { email: user.email! },
    data: { phone }
  })

  // Trigger Twilio Verify
  try {
    await twilioClient.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verifications.create({ to: phone, channel: 'sms' })
  } catch (error) {
    console.error('Twilio Error:', error)
    // Here you would optimally redirect with an error param
  }
}

export async function verifyCode(formData: FormData) {
  const code = formData.get('code') as string
  const phone = formData.get('phone') as string
  
  if (!code || !phone) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  try {
    const verification = await twilioClient.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code })

    if (verification.status === 'approved') {
      // Mark user as verified in Prisma DB
      await prisma.user.update({
        where: { email: user.email! },
        data: { phoneVerified: true }
      })

      redirect('/dashboard')
    } else {
      redirect('/verify-phone?error=Invalid code')
    }
  } catch (error) {
    console.error('Twilio verification error:', error)
    redirect('/verify-phone?error=Verification failed')
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Usually, you would hit the Paystack API here to initialize a transaction
    // and return the authorization_url.
    // E.g., fetch('https://api.paystack.co/transaction/initialize', { ... })
    
    // For local development scaffolding, we simulate a direct pass:
    const mockRef = `hq_test_${Date.now()}`
    
    // Create pending enrollment & payment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id, // Assuming user.id exists in Prisma
        courseId: course.id,
        status: 'pending'
      }
    })

    await prisma.payment.create({
      data: {
        enrollmentId: enrollment.id,
        reference: mockRef,
        amount: course.price,
        currency: course.currency,
        method: 'card',
        status: 'pending'
      }
    })

    // Simulated callback URL
    return NextResponse.redirect(new URL(`/dashboard?mock_success=${mockRef}`, request.url))

  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

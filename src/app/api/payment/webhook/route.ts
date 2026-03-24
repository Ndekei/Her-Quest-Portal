import { NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    // Verify webhook signature (using env secret)
    const secret = process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock'
    const expectedSignature = crypto
      .createHmac('sha512', secret)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)

    if (event.event === 'charge.success') {
      const reference = event.data.reference

      // Find the pending payment
      const payment = await prisma.payment.findUnique({
        where: { reference },
        include: { enrollment: true }
      })

      if (payment && payment.status === 'pending') {
        // Mark payment successful
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'success', paidAt: new Date() }
        })

        // Activate enrollment
        await prisma.enrollment.update({
          where: { id: payment.enrollmentId },
          data: { status: 'active' }
        })
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

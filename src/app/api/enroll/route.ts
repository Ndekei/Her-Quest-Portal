import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await request.json()
    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId' }, { status: 400 })
    }

    // Ensure user exists in our DB (they might have just signed up via OAuth)
    let dbUser = await prisma.user.findUnique({ where: { email: user.email! } })
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email!,
          provider: user.app_metadata.provider || 'email',
        }
      })
    }

    // Check existing enrollment to prevent duplicates
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: dbUser.id,
          courseId,
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: dbUser.id,
        courseId,
        status: 'pending', // Will become 'active' after payment
      }
    })

    return NextResponse.json({ enrollment })
  } catch (error) {
    console.error('Error in enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    )
  }
}

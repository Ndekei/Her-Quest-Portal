import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { CourseCard } from '@/components/ui/CourseCard'
import { PortalNav } from '@/components/nav/PortalNav'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      enrollments: true,
      profile: true
    }
  })

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: { modules: true },
    orderBy: { createdAt: 'desc' }
  })

  // Basic layout matching the earth-tones from Her Quest
  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <PortalNav userFirstName={dbUser?.profile?.firstName || user.email?.split('@')[0]} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="mb-12">
          <p className="text-[var(--accent)] font-jost uppercase tracking-widest text-sm font-medium mb-3">
            The Hub
          </p>
          <h1 className="text-4xl md:text-5xl font-cormorant text-[var(--text)] font-light leading-tight">
            Your Journey Awaits<br />
            <span className="italic text-stone-400">Step Into Your Identity.</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course: any) => {
            const isEnrolled = !!dbUser?.enrollments.find((e: any) => e.courseId === course.id)
            return (
              <CourseCard key={course.id} course={course} isEnrolled={isEnrolled} />
            )
          })}

          {courses.length === 0 && (
            <div className="col-span-full py-20 text-center text-stone-400 font-jost text-lg border border-dashed border-stone-300 rounded-xl">
              No courses are available at this time.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

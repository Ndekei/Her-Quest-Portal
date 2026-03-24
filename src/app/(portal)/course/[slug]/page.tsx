import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      instructor: true,
      modules: { orderBy: { order: 'asc' } }
    }
  })

  if (!course) notFound()

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: { enrollments: true }
  })

  const isEnrolled = !!dbUser?.enrollments.find((e: any) => e.courseId === course.id)

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24 relative">
      <Link href="/dashboard" className="absolute top-8 left-8 z-40 text-sm font-jost text-white/80 hover:text-white uppercase tracking-widest flex items-center gap-2 mix-blend-difference">
        <span>← Back to Hub</span>
      </Link>

      {/* Hero / Video Embed */}
      <section className="relative w-full h-[60vh] min-h-[500px] bg-stone-900 overflow-hidden flex items-center justify-center border-b border-stone-800">
        <div className="absolute inset-0 opacity-40">
           {/* If there's an intro video, embed iframe; else use thumbnail as background */}
           {course.thumbnailUrl ? (
            <Image src={course.thumbnailUrl} alt="Course Cover" fill className="object-cover blur-sm" />
           ) : null}
        </div>
        
        {/* Placeholder for actual Video Player (e.g. Vimeo/YouTube iframe) */}
        <div className="relative z-10 w-full max-w-4xl aspect-video bg-black/80 rounded-xl shadow-2xl flex items-center justify-center border border-white/10 group cursor-pointer overflow-hidden backdrop-blur-md">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5V19L19 12L8 5Z" />
              </svg>
            </div>
            <p className="font-jost text-white/70 uppercase tracking-widest text-xs">Watch Introduction</p>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <div className="max-w-4xl mx-auto px-6 mt-16 flex flex-col md:flex-row gap-16">
        {/* Main Column */}
        <div className="flex-1 space-y-16">
          <section>
            <p className="text-[var(--accent)] font-jost uppercase tracking-widest text-sm font-medium mb-2">
              The Journey Details
            </p>
            <h1 className="text-4xl md:text-5xl font-cormorant text-[var(--text)] mb-6">
              {course.title}
            </h1>
            <div className="font-jost text-stone-600 space-y-4 text-lg leading-relaxed">
              {course.description}
            </div>
          </section>

          {/* Curriculum Accordion / List */}
          <section>
            <h2 className="text-3xl font-cormorant text-[var(--text)] mb-8 border-b border-stone-200 pb-4">
              Curriculum Modules
            </h2>
            <div className="space-y-4">
              {course.modules.length > 0 ? (
                course.modules.map((mod: any, i: number) => (
                  <div key={mod.id} className="p-6 border border-stone-200 rounded-xl bg-[var(--surface)] hover:border-[var(--accent)] transition-colors">
                    <div className="flex gap-6 items-start">
                      <div className="font-jost text-stone-300 text-3xl font-light w-8">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-cormorant text-2xl text-[var(--text)] mb-2">
                          {mod.title}
                        </h3>
                        {mod.description && (
                          <p className="font-jost text-stone-500 text-sm">
                            {mod.description}
                          </p>
                        )}
                      </div>
                      {mod.duration && (
                        <div className="font-jost text-xs uppercase text-stone-400 tracking-wider">
                          {mod.duration} MIN
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm font-jost text-stone-400">Curriculum is being finalized.</p>
              )}
            </div>
          </section>

          {/* Instructor Bio */}
          {course.instructor && (
            <section className="bg-[var(--surface)] border border-stone-200 rounded-2xl p-8 md:p-12 flex flex-col sm:flex-row items-center sm:items-start gap-8 mt-16">
              {course.instructor.avatarUrl ? (
                <Image 
                  src={course.instructor.avatarUrl} 
                  alt={course.instructor.name} 
                  width={120} height={120} 
                  className="rounded-full object-cover border-4 border-[var(--bg)] shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-stone-200" />
              )}
              <div>
                <h3 className="text-sm font-jost uppercase tracking-widest text-[var(--accent)] mb-1">
                  Meet the Moderator
                </h3>
                <h4 className="text-3xl font-cormorant text-[var(--text)] mb-4">
                  {course.instructor.name}
                </h4>
                <p className="font-jost text-stone-600 text-sm leading-relaxed">
                  {course.instructor.bio}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Sticky Sidebar / CTA */}
        <div className="w-full md:w-80 relative">
          <div className="sticky top-32 p-8 bg-[var(--surface)] border border-stone-200 rounded-2xl shadow-sm text-center">
            <h4 className="font-cormorant text-2xl text-[var(--text)] mb-2">{isEnrolled ? 'You are enrolled' : 'Begin Your Quest'}</h4>
            <div className="font-cormorant text-3xl text-[var(--accent)] mb-6">
              {Number(course.price) === 0 ? 'Free' : `${course.currency} ${Number(course.price).toLocaleString()}`}
            </div>
            
            {isEnrolled ? (
              <button disabled className="w-full py-4 px-6 border border-stone-300 rounded-md bg-stone-100 text-stone-400 text-sm font-jost uppercase tracking-widest cursor-not-allowed">
                Included in your Library
              </button>
            ) : (
              <form action={`/api/payment/initiate`}>
                <input type="hidden" name="courseId" value={course.id} />
                <button type="submit" className="w-full py-4 px-6 border shadow-sm text-sm font-medium text-white bg-[var(--accent)] hover:bg-[#A36D48] transition-colors font-jost tracking-widest uppercase rounded">
                  Enroll Now
                </button>
              </form>
            )}

            <ul className="mt-8 space-y-3 font-jost text-sm text-stone-500 text-left">
              <li className="flex gap-3 items-start border-b border-stone-100 pb-2">
                <span className="text-[var(--accent)]">✦</span>
                {course.modules.length} Intensive Modules
              </li>
              <li className="flex gap-3 items-start border-b border-stone-100 pb-2">
                <span className="text-[var(--accent)]">✦</span>
                Weekly Live Sessions Access
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-[var(--accent)]">✦</span>
                Exclusive Study Material
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

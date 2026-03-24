import Image from 'next/image'
import Link from 'next/link'
import { Prisma } from '@prisma/client'

type CourseWithRelations = Prisma.CourseGetPayload<{
  include: { modules: true }
}>

export function CourseCard({ course, isEnrolled }: { course: CourseWithRelations, isEnrolled: boolean }) {
  return (
    <Link href={`/course/${course.slug}`} className="group block">
      <div className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-[var(--surface)] transition-all hover:shadow-lg hover:border-[var(--accent)]">
        <div className="relative h-48 w-full overflow-hidden bg-stone-100">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-stone-200 flex items-center justify-center">
              <span className="text-stone-400 font-jost text-sm uppercase">No Image</span>
            </div>
          )}
          {isEnrolled && (
            <div className="absolute top-3 right-3 bg-[var(--accent)] text-white text-xs font-bold px-3 py-1 rounded-full font-jost tracking-wider">
              ENROLLED
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 p-6">
          <div className="flex items-center justify-between text-xs text-stone-500 font-jost uppercase tracking-wider mb-2">
            <span>{course.modules.length} Modules</span>
            <span>{course.totalHours} Hours</span>
          </div>
          <h3 className="text-xl font-cormorant font-semibold text-[var(--text)] mb-2 group-hover:text-[var(--accent)] transition-colors">
            {course.title}
          </h3>
          <p className="text-sm font-jost text-stone-500 line-clamp-2 mb-4 flex-1">
            {course.description}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <span className="text-lg font-cormorant font-medium text-[var(--text)]">
              {Number(course.price) === 0 ? 'Free' : `${course.currency} ${course.price.toString()}`}
            </span>
            <span className="text-[var(--accent)] text-sm font-jost font-medium group-hover:translate-x-1 transition-transform">
              {isEnrolled ? 'Continue →' : 'View Course →'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

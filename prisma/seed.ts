import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Create Instructor: Naomi
  const naomi = await prisma.instructor.create({
    data: {
      name: 'Naomi Makumi',
      bio: 'Naomi Makumi is a woman of deep faith, vision, and purpose. As the founder of Her Quest, she carries a God-given mandate to help women recover their true identity.',
      avatarUrl: '/assets/NaomiMakumi.JPG', // Linking to front-end asset
    },
  })

  // 2. Create the Her Quest Course
  const course = await prisma.course.create({
    data: {
      title: 'The Her Quest Journey',
      slug: 'the-her-quest-journey',
      description: '10 weeks. One transformation. A community of women walking together toward the truth of who they are.',
      thumbnailUrl: '/assets/hero.png',
      introVideoUrl: 'https://player.vimeo.com/video/123456789', // Placeholder
      totalHours: 20.0,
      price: 15000.0, // e.g. 15,000 KES
      currency: 'KES',
      isPublished: true,
      audience: 'women',
      topic: 'identity',
      instructorId: naomi.id,
    },
  })

  // 3. Create Modules
  const modulesData = [
    { title: 'The Endless Search', description: 'Understanding the four forms of identity women navigate.', duration: 120 },
    { title: 'Anchored in the Word', description: 'Discovering your true identity as intended by God since creation.', duration: 120 },
    { title: 'Effective & Relevant', description: 'Taking your place in God\'s agenda here on earth.', duration: 120 },
  ]

  for (const [index, mod] of modulesData.entries()) {
    await prisma.module.create({
      data: {
        courseId: course.id,
        title: mod.title,
        description: mod.description,
        order: index + 1,
        duration: mod.duration,
      },
    })
  }

  console.log('Seed completed: Her Quest Journey has been created.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

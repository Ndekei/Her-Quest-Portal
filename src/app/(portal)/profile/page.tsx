import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PortalNav } from '@/components/nav/PortalNav'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: { profile: true }
  })

  // We could implement server actions for updates here...

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PortalNav userFirstName={dbUser?.profile?.firstName || user.email?.split('@')[0]} />
      
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-cormorant text-[var(--text)] mb-8">Profile Settings</h1>
        
        <div className="bg-[var(--surface)] border border-stone-200 rounded-xl p-8 shadow-sm space-y-8">
          {/* Avatar Section */}
          <section className="flex items-center gap-6 pb-8 border-b border-stone-100">
            <div className="w-24 h-24 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-jost text-2xl uppercase shadow-inner">
              {(dbUser?.profile?.firstName || user.email || 'U')[0]}
            </div>
            <div>
              <p className="font-jost text-stone-500 text-sm mb-2">Profile Picture</p>
              <button className="px-4 py-2 border border-stone-300 rounded-md text-sm font-jost text-[var(--text)] hover:bg-stone-50 transition-colors">
                Upload New Image
              </button>
            </div>
          </section>

          {/* Personal Info */}
          <section className="space-y-6">
            <h2 className="font-cormorant text-2xl text-[var(--text)]">Personal Information</h2>
            
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] font-jost mb-1">
                  First Name
                </label>
                <input 
                  type="text" 
                  defaultValue={dbUser?.profile?.firstName || ''}
                  className="w-full px-4 py-3 border border-stone-300 rounded-md bg-[var(--bg)] focus:ring-[var(--accent)] focus:border-[var(--accent)] font-jost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] font-jost mb-1">
                  Last Name
                </label>
                <input 
                  type="text" 
                  defaultValue={dbUser?.profile?.lastName || ''}
                  className="w-full px-4 py-3 border border-stone-300 rounded-md bg-[var(--bg)] focus:ring-[var(--accent)] focus:border-[var(--accent)] font-jost"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text)] font-jost mb-1">
                  Email Address
                </label>
                <input 
                  type="email" 
                  disabled
                  defaultValue={user.email}
                  className="w-full px-4 py-3 border border-stone-200 rounded-md bg-stone-100 text-stone-500 cursor-not-allowed font-jost"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text)] font-jost mb-1">
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  disabled
                  defaultValue={dbUser?.phone || ''}
                  className="w-full px-4 py-3 border border-stone-200 rounded-md bg-stone-100 text-stone-500 cursor-not-allowed font-jost"
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <button type="button" className="py-3 px-6 bg-[var(--accent)] text-white hover:bg-[#A36D48] rounded-md shadow-sm font-jost tracking-widest text-sm font-medium transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="mt-8 text-right">
          <form action="/auth/signout" method="post">
            <button className="text-stone-500 hover:text-red-500 font-jost text-sm transition-colors border-b border-transparent hover:border-red-500 pb-1">
              Sign Out Securely
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import JobCard from '../../components/dashboard/JobCard'

export default function CustomerDashboard() {
  const { profile } = useAuth()
  const { isEN } = useLanguage()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false)
      return
    }
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, job_steps(*)')
        .eq('musteri_id', profile.id)
        .order('created_at', { ascending: false })

      if (!error) setJobs(data || [])
      setLoading(false)
    }
    fetchJobs()
  }, [profile?.id])

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEN ? 'My Jobs' : 'İşlerim'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEN
              ? 'Track the progress of your print jobs'
              : 'Baskı işlerinizin durumunu takip edin'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">
              {isEN ? 'No jobs yet' : 'Henüz iş kaydı yok'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => navigate(`/panel/is/${job.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

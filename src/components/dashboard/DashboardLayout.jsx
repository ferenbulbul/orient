import { useState } from 'react'
import DashboardSidebar from './DashboardSidebar'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Masaüstünde menü amblem moduna daraltılabilir (geniş tablolar için)
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === '1'
  )

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      localStorage.setItem('sidebarCollapsed', c ? '0' : '1')
      return !c
    })
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-slate-900">Euromat Panel</span>
          <div className="w-10" />
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

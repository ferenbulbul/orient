import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import Contact from './pages/Contact'
import './App.css'

const PAGE_COMPONENTS = {
  home: <Home />,
  services: <Services />,
  contact: <Contact />,
}

function App() {
  const [activePage, setActivePage] = useState('home')

  return (
    <div className="app-shell">
      <Navbar activePage={activePage} onNavigate={setActivePage} />
      <main className="content-area">
        {PAGE_COMPONENTS[activePage] ?? <Home />}
      </main>
      <Footer />
    </div>
  )
}

export default App

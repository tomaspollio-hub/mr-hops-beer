import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import AgeGate from '../ui/AgeGate'

export default function PublicLayout() {
  return (
    <>
      <AgeGate />
      <div className="min-h-screen flex flex-col bg-hops-black">
        <Navbar />
        <main className="flex-1 page-enter">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  )
}

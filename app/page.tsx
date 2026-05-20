import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Events from '@/components/Events'
import Gallery from '@/components/Gallery'
import Officers from '@/components/Officers'
import Join from '@/components/Join'
import Epigraph from '@/components/Epigraph'
import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ScrollReveal'

export default function Page() {
  return (
    <>
      <Nav />
      <Hero />
      <div className="divider" />
      <About />
      <div className="divider" />
      <Events />
      <div className="divider" />
      <Gallery />
      <div className="divider" />
      <Officers />
      <Join />
      <Epigraph />
      <div className="divider" />
      <Footer />
      <ScrollReveal />
    </>
  )
}

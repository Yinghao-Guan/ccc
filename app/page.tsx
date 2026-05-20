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
import StoryShell from '@/components/StoryShell'

export default function Page() {
  return (
    <>
      <Nav />
      <StoryShell>
        <Hero />
        <About />
        <Events />
        <Gallery />
        <Officers />
        <Join />
        <Epigraph />
        <Footer />
      </StoryShell>
      <ScrollReveal />
    </>
  )
}

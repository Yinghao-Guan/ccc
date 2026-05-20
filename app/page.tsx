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
import Transition from '@/components/Transition'

export default function Page() {
  return (
    <>
      <Nav />
      <StoryShell>
        <Hero />
        <Transition from="hero" to="about" />
        <About />
        <Transition from="about" to="events" />
        <Events />
        <Transition from="events" to="gallery" />
        <Gallery />
        <Transition from="gallery" to="officers" />
        <Officers />
        <Transition from="officers" to="join" />
        <Join />
        <Transition from="join" to="epigraph" />
        <Epigraph />
        <div className="divider" />
        <Footer />
      </StoryShell>
      <ScrollReveal />
    </>
  )
}

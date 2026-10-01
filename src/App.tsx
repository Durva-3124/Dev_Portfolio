import { Fragment } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/layout/ScrollProgress';
import CustomCursor from '@/components/ui/CustomCursor';
import Preloader from '@/components/ui/Preloader';
import FloatingWidget from '@/three/FloatingWidget';
import Hero from '@/sections/Hero';
import About from '@/sections/About';
import Skills from '@/sections/Skills';
import Experience from '@/sections/Experience';
import MyDesk from '@/sections/MyDesk';
import Projects from '@/sections/Projects';
import Education from '@/sections/Education';
import Certifications from '@/sections/Certifications';
import BeyondCode from '@/sections/BeyondCode';
import Contact from '@/sections/Contact';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useTheme } from '@/hooks/useTheme';
import { useKonami } from '@/hooks/useKonami';
import confetti from 'canvas-confetti';

function App() {
  useSmoothScroll();
  useTheme();
  useKonami(() => confetti({ colors: ['#800020', '#e0b878'], particleCount: 120, spread: 80 }));

  return (
    <Fragment>
      <Preloader />
      <CustomCursor />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <MyDesk />
        <Projects />
        <Education />
        <Certifications />
        <BeyondCode />
        <Contact />
      </main>
      <Footer />
      <FloatingWidget />
    </Fragment>
  );
}

export default App;

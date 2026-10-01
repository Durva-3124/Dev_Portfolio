import { Fragment } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/layout/ScrollProgress';
import CustomCursor from '@/components/ui/CustomCursor';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useTheme } from '@/hooks/useTheme';
import {
  personal,
  hero,
  about,
  skills,
  experience,
  projects,
  education,
  certifications,
  contact,
} from '@/data';

void personal;
void hero;
void about;
void skills;
void experience;
void projects;
void education;
void certifications;
void contact;

function App() {
  useSmoothScroll();
  useTheme();

  return (
    <Fragment>
      <CustomCursor />
      <ScrollProgress />
      <Navbar />
      <main>
        <section id="hero">Hero placeholder</section>
        <section id="about">About placeholder</section>
        <section id="skills">Skills placeholder</section>
        <section id="experience">Experience placeholder</section>
        <section id="my-desk">My Desk placeholder</section>
        <section id="projects">Projects placeholder</section>
        <section id="education">Education placeholder</section>
        <section id="certifications">Certifications placeholder</section>
        <section id="contact">Contact placeholder</section>
      </main>
      <Footer />
    </Fragment>
  );
}

export default App;

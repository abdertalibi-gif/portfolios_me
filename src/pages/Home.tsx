import React from 'react';
import ScrollToTop from "../components/ScrollToTop";
import ScrollProgress from "../components/ScrollProgress";
import Navbar from "../components/Navbar";
import ThreeBackground from "../components/ThreeBackground";
import Hero from "../components/Hero";
import About from "../components/About";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import Education from "../components/Education";
import Experience from "../components/Experience";
import Certifications from "../components/Certifications";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text selection:bg-brand-primary/10">
      <ScrollProgress />
      <ScrollToTop />
      <ThreeBackground />
      <Navbar />
      
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Education />
        <Experience />
        <Certifications />
        <Contact />
      </main>

      <Footer />
    </div>
  );
};

export default Home;

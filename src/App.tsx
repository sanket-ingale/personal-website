import { Header, Hero } from "@/components/Hero";
import { About, Contact, Education, Experience, Skills, Work } from "@/components/Sections";
import { CursorGlow } from "@/components/CursorGlow";
import { MobileDock } from "@/components/MobileDock";

export default function App() {
  return (
    <div className="min-h-screen">
      <CursorGlow />
      <Header />
      <main className="pb-28 sm:pb-0">
        <Hero />
        <About />
        <Experience />
        <Work />
        <Skills />
        <Education />
        <Contact />
      </main>
      <MobileDock />
    </div>
  );
}

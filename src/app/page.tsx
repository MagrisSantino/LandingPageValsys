// app/page.tsx
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Services } from "@/components/services"
import { Projects } from "@/components/projects"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"
import { Dock } from "@/components/dock"

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden pb-28">
      <Navbar />
      <Hero />
      <Services />
      <Projects />
      <Contact />
      <Footer />
      <Dock />
    </main>
  )
}

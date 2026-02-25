import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <section id="home" className="w-full pt-24">
      <Navbar />
      <Hero />
      <Footer />
    </section>
  );
}
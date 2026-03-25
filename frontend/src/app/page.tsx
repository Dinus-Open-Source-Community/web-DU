import Hero from "@/components/home/Hero";
import GuestLayout from "../components/layout/GuestLayout";
import Feature from "@/components/home/Feature";
import Benefit from "@/components/home/Benefit";
import { DataCourse, ProgramFeatures } from "@/lib/dummyData";
import Community from "@/components/home/Community";

export default function Home() {
  return (
    <section id="home" className="bg-muted w-full pt-24">
      <GuestLayout>
        <Hero />
        <Feature Data={DataCourse} />
        <Benefit DataFeatures={ProgramFeatures} />
        <Community />
      </GuestLayout>
    </section>
  );
}

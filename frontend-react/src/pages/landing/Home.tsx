import type { IProgramFeatures } from '../../lib/types/utils'
import Benefit from '../../components/home/Benefit'
import Community from '../../components/home/Community'
import Feature from '../../components/home/Feature'
import Hero from '../../components/home/Hero'
import GuestLayout from '../../components/layouts/GuestLayouts'
import {
  BookIcons,
  CertificateIcons,
  GlobeLearningIcon,
  JobIcons,
} from '@/components/shared/icon'
import { useFeaturedCourses } from '@/hooks/landing/use-featured-courses'

export default function Home() {
  const { courses: featuredCourses, isLoading: isFeaturedCoursesLoading } = useFeaturedCourses()

  const featureIconMap: Record<string, React.ReactNode> = {
    book: <BookIcons />,
    globe: <GlobeLearningIcon />,
    job: <JobIcons />,
    certificate: <CertificateIcons />,
  };

  const programFeatures: IProgramFeatures[] = [
    {
      title: "Materi OSS nyata",
      description:
        "Berlatih lewat proyek komunitas Doscom yang bisa kamu kontribusikan ke portofolio.",
      icon: featureIconMap.book,
    },
    {
      title: "Jaringan profesional",
      description:
        "Networking dengan mentor industri dan sesama kontributor open source.",
      icon: featureIconMap.globe,
    },
    {
      title: "Proyek kerja tim",
      description:
        "Simulasi sprint tim sekaligus code review untuk mirip lingkungan kerja.",
      icon: featureIconMap.job,
    },
    {
      title: "Sertifikat partisipasi",
      description:
        "Bukti pembelajaran resmi setelah menyelesai modul capstone.",
      icon: featureIconMap.certificate,
    },
  ];
  return (
    <GuestLayout>
      <section id="home" className="bg-muted w-full">
        <Hero />
        <Feature courses={featuredCourses} isLoading={isFeaturedCoursesLoading} />
        <Benefit DataFeatures={programFeatures} />
        <Community />
      </section>
    </GuestLayout>
  );
}

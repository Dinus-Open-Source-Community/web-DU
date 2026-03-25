import GuestLayout from "@/components/layout/GuestLayout";
import Section1 from "./_components/Section1";
import { DataCourse } from "@/lib/dummyData";

export default function CoursePage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <GuestLayout>
        <Section1 Data={DataCourse} />
      </GuestLayout>
    </main>
  );
}

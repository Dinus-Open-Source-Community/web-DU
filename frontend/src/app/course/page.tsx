import Navbar from "@/components/layout/Navbar";

export default function CoursePage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      {/* Memanggil Navbar di halaman ini */}
      <Navbar />
      
      {/* Konten Halaman Course */}
      <div className="flex flex-col items-center justify-center pt-32 px-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#0A84DC] mb-6">
          Our Courses
        </h1>
      </div>
    </main>
  );
}
import Navbar from "@/components/Navbar";

export default function CoursePage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      {/* Memanggil Navbar di halaman ini */}
      <Navbar />

      {/* Konten Halaman Course */}
      <div className="flex flex-col items-center justify-center px-10 pt-32 text-center">
        <h1 className="mb-6 text-4xl font-bold text-[#0A84DC] md:text-5xl">
          Our Courses
        </h1>
      </div>
    </main>
  );
}

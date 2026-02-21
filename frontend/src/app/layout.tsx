import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../styles/globals.css"; 

// Konfigurasi font global
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Doscom University",
  description: "Open Source Bootcamp",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} bg-[#f5f5f5] text-slate-800 antialiased`}>
        {children}
      </body>
    </html>
  );
}
"use client"; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const Navbar: React.FC = () => {

  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Course', href: '/course' },
    { name: 'Community', href: '/community' },
    { name: 'About', href: '/about' },
  ];

  return (
    <div className="w-full bg-[#0A84DC] flex justify-center">
      <nav className="w-full max-w-360 h-26.5 px-2 py-6 flex items-center justify-between">
        
        {/* --- Logo --- */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="font-bold text-[24px] leading-[1.2] text-[#F2F2F2]">
            Doscom<br />University
          </Link>
        </div>

        {/* --- Menu Navigasi --- */}
        <div className="flex-none">
          <ul className="flex items-center gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className={`inline-block px-6 py-2 rounded-3xl text-[18px] leading-[1.2] transition-all duration-300 hover:scale-105 ${
                      isActive 
                        ? 'bg-[#F2F2F2] text-[#0A84DC] font-semibold' // Aktif: Putih, Teks Biru, Tebal
                        : 'text-[#F2F2F2] font-normal hover:bg-[#F2F2F2] hover:text-[#0A84DC]' // Tidak Aktif: Teks Putih. Saat hover -> Bg Putih, Teks Biru
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* --- Menu Autentikasi --- */}
        <div className="flex-1 flex justify-end items-center gap-3">
          <Link 
            href="/auth/register" 
            className="flex items-center justify-center px-7.5 py-2.5 h-10.5 border border-[#F2F2F2] rounded-3xl text-[#F2F2F2] font-semibold text-[16px] hover:bg-white/10 transition-colors"
          >
            Daftar
          </Link>
          <Link 
            href="/auth/login" 
            className="flex items-center justify-center px-7.5 py-2.5 h-10.5 bg-[#F2F2F2] rounded-3xl text-[#0A84DC] font-semibold text-[16px] hover:bg-white hover:shadow-md transition-all"
          >
            Masuk
          </Link>
        </div>

      </nav>
    </div>
  );
};

export default Navbar;
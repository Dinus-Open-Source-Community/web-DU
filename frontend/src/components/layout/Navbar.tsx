"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Course", href: "/course" },
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <nav className="bg-primary text-popover fixed top-0 left-0 z-50 w-full shadow-md">
      <div className="mx-auto flex w-full max-w-400 items-center justify-between px-32 py-4">
        <Link href="/" className="text-2xl font-bold whitespace-pre text-white">
          Doscom{"\n"}University
        </Link>
        <div className="hidden items-center lg:flex">
          <nav className="flex w-full flex-wrap items-center justify-center gap-2">
            {navLinks.map((navLink) => (
              <Link
                key={navLink.href}
                href={navLink.href}
                className={`flex items-center justify-center rounded-2xl py-2 text-lg font-medium transition-all ${
                  pathname === navLink.href
                    ? "bg-popover text-primary px-6"
                    : "px-2 text-white hover:text-white/80"
                }`}
              >
                {navLink.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden gap-4 lg:flex">
          <Link href="/auth/register">
            <Button
              className="bg-primary text-popover rounded-2xl px-7"
              variant="outline"
            >
              Daftar
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button
              className="bg-popover text-primary rounded-2xl px-7"
              variant={"ghost"}
            >
              Masuk
            </Button>
          </Link>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-2xl border border-white/40 px-3 py-2 text-white lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="mx-auto flex w-full max-w-400 flex-col gap-3 px-32 pb-6">
          <div className="flex flex-col gap-2">
            {navLinks.map((navLink) => (
              <Link
                key={navLink.href}
                href={navLink.href}
                className={`px-4 py-2 text-base transition ${pathname === navLink.href ? "bg-popover text-primary rounded-2xl font-medium" : "text-white hover:text-white/80"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {navLink.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
              <Button
                className="bg-primary text-popover w-full rounded-2xl px-7"
                variant="outline"
              >
                Daftar
              </Button>
            </Link>
            <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
              <Button
                className="bg-popover text-primary w-full rounded-2xl px-7"
                variant={"ghost"}
              >
                Masuk
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

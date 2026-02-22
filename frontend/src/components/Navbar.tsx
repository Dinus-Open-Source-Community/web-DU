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
        <nav className="fixed left-0 top-0 z-50 w-full bg-primary text-popover shadow-md">
            <div className="mx-auto flex w-full max-w-400 items-center justify-between px-32 py-4">
                <Link href="/" className="text-2xl font-bold whitespace-pre text-white">
                    Doscom{"\n"}University
                </Link>
                <div className="hidden items-center gap-8 lg:flex">
                    <div className="flex">
                        {navLinks.map((navLink) => (
                            <Link
                                key={navLink.href}
                                href={navLink.href}
                                className={`text-lg px-7 py-1 transition ${pathname === navLink.href ? "font-medium bg-popover text-primary rounded-2xl" : "text-white hover:text-white/80"}`}
                            >
                                {navLink.label}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="hidden gap-4 lg:flex">
                    <Link href="/auth/register">
                        <Button className="rounded-2xl bg-primary text-popover px-7" variant="outline">Daftar</Button>
                    </Link>
                    <Link href="/auth/login">
                        <Button className="rounded-2xl bg-popover text-primary px-7" variant={"ghost"}>Masuk</Button>
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
            <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="mx-auto flex w-full max-w-400 flex-col gap-3 px-32 pb-6">
                    <div className="flex flex-col gap-2">
                        {navLinks.map((navLink) => (
                            <Link
                                key={navLink.href}
                                href={navLink.href}
                                className={`text-base px-4 py-2 transition ${pathname === navLink.href ? "font-medium bg-popover text-primary rounded-2xl" : "text-white hover:text-white/80"}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {navLink.label}
                            </Link>
                        ))}
                    </div>
                    <div className="flex flex-col gap-3">
                        <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                            <Button className="w-full rounded-2xl bg-primary text-popover px-7" variant="outline">Daftar</Button>
                        </Link>
                        <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                            <Button className="w-full rounded-2xl bg-popover text-primary px-7" variant={"ghost"}>Masuk</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

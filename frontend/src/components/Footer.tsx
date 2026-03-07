"use client";

import Link from "next/link";
import { useState } from "react";
import { Github, Linkedin, Twitter, Instagram, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinks = {
    Product: [
        { label: "Course", href: "/course" },
        { label: "Community", href: "/community" },
        { label: "Pricing", href: "/pricing" },
        { label: "About", href: "/about" },
    ],
    Company: [
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Contact", href: "/contact" },
    ],
    Legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Disclaimer", href: "/disclaimer" },
    ],
};

const socialLinks = [
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Mail, href: "mailto: ", label: "Email" },
];

export default function Footer() {
    const [email, setEmail] = useState("");

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle newsletter subscription
        console.log("Subscribing email:", email);
        setEmail("");
    };

    return (
        <footer className="w-full bg-secondary-foreground text-popover">
            {/* Newsletter Section */}
            <div className="mx-auto max-w-400 px-32 py-12">
                <div className="rounded-xl bg-card backdrop-blur-sm border border-blue-500/20 px-8 py-12 sm:px-12">
                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div className="text-center md:text-left">
                            <h2 className="text-4xl font-bold text-primary sm:text-3xl">
                                Subscribe to our newsletter
                            </h2>
                            <p className="mt-2 text-xl text-primary">
                                Be the first receive update, tips, and more.
                            </p>
                        </div>
                        <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-3">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="flex-1 rounded-md bg-popover/5 py-5 text-secondary-foreground placeholder:text-gray-700/40 border-gray-300 border-2"
                            />
                            <Button
                                type="submit"
                                className="rounded-md bg-primary py-5 px-7 text-white"
                            >
                                Subscribe
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="mx-auto max-w-400 px-32 pt-8 pb-12">
                <div className="flex flex-col md:flex-row gap-8 md:justify-between">
                    {/* Brand Section */}
                    <div className="shrink-0 md:max-w-lg">
                        <Link href="/" className="text-[26px] text-primary font-bold whitespace-pre">
                            Doscom University
                        </Link>
                        <p className="mt-4 text-popover leading-relaxed">
                            Doscom University is one of DOSCOM's open source intensive training programs (bootcamps).
                        </p>
                        <div className="mt-6 flex gap-4">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <Link
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-popover"
                                        aria-label={social.label}
                                    >
                                        <Icon className="h-7 w-7" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="flex flex-wrap gap-8 md:gap-12 lg:gap-16">
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <div key={category} className="shrink-0">
                                <h3 className="text-sm font-semibold uppercase tracking-wider">
                                    {category}
                                </h3>
                                <ul className="mt-4 space-y-3">
                                    {links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-popover/70 transition hover:text-popover"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

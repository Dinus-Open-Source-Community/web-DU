"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardCheck,
  FileText,
  Award,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "My Course", href: "/admin/course", icon: BookOpen },
  { label: "Participants", href: "/admin/participant", icon: Users },
  { label: "Attendance", href: "/admin/attendance", icon: ClipboardCheck },
  { label: "Assignments", href: "/admin/assignment", icon: FileText },
  { label: "Certificates", href: "/admin/certificate", icon: Award },
  { label: "Settings", href: "/admin/setting", icon: Settings },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-30 flex h-screen w-[220] flex-col bg-white shadow-md">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-6 border-b border-[#dcdcdc]">
          <span className="text-[#0a84dc] font-bold text-lg leading-tight">
            Doscom
            <br />
            University
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1 flex-1 px-3 py-4 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#0a84dc] text-white shadow-sm"
                      : "text-[#555555] hover:bg-[#f0f7ff] hover:text-[#0a84dc]"
                  }`}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-white" : "text-[#888888]"}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6">
          <button
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#555555] hover:bg-red-50 hover:text-red-500 transition-all duration-200"
            onClick={() => {
              console.log("Logout clicked");
            }}
          >
            <LogOut size={18} className="text-[#888888]" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-[220]">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between bg-white px-8 py-4 shadow-sm border-b border-[#dcdcdc]">
          <div>
            <h1 className="text-lg font-semibold text-[#232323]">Dashboard</h1>
            <p className="text-xs text-[#a29f9f]">Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification */}
            <button className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#f2f2f2] hover:bg-[#e7f3fc] transition-colors">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#555"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            {/* avatar */}
            <div className="w-9 h-9 rounded-full bg-[#0a84dc] flex items-center justify-center text-white text-sm font-bold">
              U
            </div>
          </div>
        </header>

        {/* content page */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;

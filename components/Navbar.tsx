"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

interface NavbarProps {
  showNavLinks?: boolean;
}

export default function Navbar({ showNavLinks = true }: NavbarProps) {
  const handleClick = (id: string) => {
    if (window.location.pathname !== "/") {
      window.location.href = `/#${id}`;
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 rounded-lg p-1.5 group-hover:bg-indigo-700 transition-colors">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">DocExplain</span>
        </Link>

        {showNavLinks && (
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleClick("about")}
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
            >
              About Us
            </button>
            <button
              onClick={() => handleClick("help")}
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Help
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Moon, Sun } from "lucide-react";

interface NavbarProps {
  showNavLinks?: boolean;
}

export default function Navbar({ showNavLinks = true }: NavbarProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("docexplain-dark");
    if (saved === "true" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      localStorage.setItem("docexplain-dark", String(next));
      return next;
    });
  };

  const handleClick = (id: string) => {
    if (window.location.pathname !== "/") {
      window.location.href = `/#${id}`;
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-cream-50/80 dark:bg-bark-900/80 backdrop-blur-xl shadow-sm shadow-bark-900/5 dark:shadow-black/20"
        : "bg-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-terra-500 rounded-xl p-2 group-hover:scale-105 transition-transform">
            <FileText className="h-4.5 w-4.5 text-cream-50" />
          </div>
          <span className="text-xl font-serif text-bark-900 dark:text-cream-50">DocExplain</span>
        </Link>

        <div className="flex items-center gap-5 sm:gap-7">
          {showNavLinks && (
            <div className="hidden sm:flex items-center gap-1 bg-sand-100/60 dark:bg-bark-800/60 rounded-full px-1.5 py-1">
              {[
                { label: "About", id: "about" },
                { label: "Help", id: "help" },
                { label: "Contact", id: "contact" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleClick(item.id)}
                  className="text-sm font-medium text-bark-500 dark:text-sand-300 hover:text-terra-600 dark:hover:text-terra-300 hover:bg-white/60 dark:hover:bg-bark-700/60 px-3 py-1.5 rounded-full transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full bg-white/60 dark:bg-bark-800/60 hover:bg-white dark:hover:bg-bark-700 backdrop-blur-sm shadow-sm transition-all hover:scale-105"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-4 w-4 text-terra-300" /> : <Moon className="h-4 w-4 text-bark-400" />}
          </button>
        </div>
      </div>
    </nav>
  );
}
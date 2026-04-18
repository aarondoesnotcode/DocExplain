"use client";

import { useState } from "react";
import { Upload, FileText, AlertCircle, ArrowRight, Shield, Clock, Users, BookOpen, HelpCircle, MessageCircle, Github } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      setFile(null);
      return;
    }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(selectedFile.type)) {
      setError("Please upload an image (JPG, PNG) or PDF file");
      setFile(null);
      return;
    }
    setError("");
    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process document");
      }

      const data = await response.json();
      sessionStorage.setItem("docResults", JSON.stringify(data));
      window.location.href = "/results";
    } catch (err) {
      setError("Failed to process document. Please try again.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 pt-16">
        {/* Hero Section */}
        <section className="px-4 pt-16 pb-10 sm:pt-24 sm:pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Shield className="h-4 w-4" />
              Free &amp; private — no login required
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Understand your official
              <br />
              <span className="text-indigo-600">UK documents</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Upload a TfL fine, council letter, or eviction notice and instantly
              get a plain English explanation, key deadlines, and a ready-to-use
              response letter.
            </p>
          </div>
        </section>

        {/* Upload Section */}
        <section className="px-4 pb-16">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              {/* Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer mb-5 ${
                  isDragOver
                    ? "border-indigo-500 bg-indigo-50/50"
                    : "border-gray-200 hover:border-indigo-400 hover:bg-gray-50/50"
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className={`mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isDragOver ? "bg-indigo-100" : "bg-gray-100"}`}>
                    <Upload className={`h-7 w-7 ${isDragOver ? "text-indigo-600" : "text-gray-400"}`} />
                  </div>
                  <p className="text-gray-700 font-medium mb-1">
                    {file ? file.name : "Drop your document here or click to browse"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    JPG, PNG, or PDF up to 10 MB
                  </p>
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full bg-indigo-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analysing your document…
                  </>
                ) : (
                  <>
                    Analyse Document
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Disclaimer */}
              <p className="text-xs text-gray-400 text-center mt-4">
                This is not legal advice. For further help, contact{" "}
                <a href="https://www.citizensadvice.org.uk/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                  Citizens Advice
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How it works</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { icon: Upload, title: "Upload", desc: "Take a photo or upload a PDF of your official document." },
                { icon: FileText, title: "Analyse", desc: "AI reads and explains the document in plain English." },
                { icon: ArrowRight, title: "Act", desc: "Get key deadlines, actions, and a ready-made response letter." },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Docs */}
        <section className="px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Supported document types</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { emoji: "🚇", title: "TfL Fines", desc: "Penalty charge notices and fare evasion letters" },
                  { emoji: "🏠", title: "Council Letters", desc: "Housing, tax, and benefits correspondence" },
                  { emoji: "📋", title: "Eviction Notices", desc: "Section 21, Section 8, and court orders" },
                ].map((doc, i) => (
                  <div key={i} className="text-center p-4 rounded-xl bg-gray-50">
                    <div className="text-3xl mb-3">{doc.emoji}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{doc.title}</h3>
                    <p className="text-sm text-gray-500">{doc.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About Us */}
        <section id="about" className="px-4 pb-20 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">About Us</h2>
            <p className="text-gray-500 text-center max-w-2xl mx-auto mb-10">
              DocExplain was built to make official documents accessible to everyone. We believe no one should lose out because a letter was too hard to understand.
            </p>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { icon: Users, title: "Built for people", desc: "Designed for migrants, elderly users, and anyone who struggles with complex language." },
                { icon: Shield, title: "Private by design", desc: "Your documents are processed in real-time and never stored on our servers." },
                { icon: Clock, title: "Instant results", desc: "Get a full breakdown in seconds — no waiting, no appointments." },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Help */}
        <section id="help" className="px-4 pb-24 scroll-mt-20">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Help</h2>
            <div className="space-y-4">
              {[
                {
                  icon: Upload,
                  q: "What file types can I upload?",
                  a: "You can upload JPG or PNG images (e.g. a photo of a letter) or a PDF file. The maximum file size is 10 MB.",
                },
                {
                  icon: Shield,
                  q: "Is my document stored anywhere?",
                  a: "No. Your document is processed in real-time and is never saved to our servers. It exists only for the duration of the analysis.",
                },
                {
                  icon: BookOpen,
                  q: "What documents are supported?",
                  a: "Currently we support TfL fines, council letters, and eviction notices. More document types will be added soon.",
                },
                {
                  icon: MessageCircle,
                  q: "Is this legal advice?",
                  a: "No. DocExplain provides plain-English summaries and suggested actions, but this is not a substitute for professional legal advice. For expert help, contact Citizens Advice.",
                },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.q}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="px-4 pb-24 scroll-mt-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">Contact Us</h2>
            <p className="text-gray-500 text-center mb-10">Get in touch with the team behind DocExplain</p>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  name: "Aaron Parwany",
                  handle: "@aarondoesnotcode",
                  linkedin: "https://www.linkedin.com/in/aaron-parwany/",
                  github: "https://github.com/aarondoesnotcode",
                  img: "/aaron pfp.jpeg",
                },
                {
                  name: "Ajay Solanki",
                  handle: "@ajaysoll",
                  linkedin: "https://www.linkedin.com/in/ajay-solanki05/",
                  github: "https://github.com/ajaysoll",
                  img: "/ajay pfp.jpeg",
                },
              ].map((person, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
                  <img
                    src={person.img}
                    alt={person.name}
                    className="w-20 h-20 rounded-full object-cover mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{person.handle}</p>
                  <div className="flex items-center gap-3">
                    <a
                      href={person.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#0A66C2] bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                    <a
                      href={person.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-100 bg-white py-8 px-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <span>@aarondoesnotcode @ajaysoll</span>
            <span>This is not legal advice. For further help, contact <a href="https://www.citizensadvice.org.uk/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Citizens Advice</a>.</span>
          </div>
        </footer>
      </main>
    </>
  );
}
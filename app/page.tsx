"use client";

import { useState } from "react";
import { Upload, FileText, AlertCircle, ArrowRight, Shield, Clock, Users, BookOpen, MessageCircle, Github } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [sampleOutputError, setSampleOutputError] = useState(false);
  const [fullscreenImg, setFullscreenImg] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.size > 10 * 1024 * 1024) { setError("File size must be less than 10MB"); setFile(null); return; }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(selectedFile.type)) { setError("Please upload an image (JPG, PNG) or PDF file"); setFile(null); return; }
    setError(""); setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) validateAndSetFile(f); };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true); setError("");
    try {
      const formData = new FormData(); formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Failed to process document");
      const data = await response.json();
      sessionStorage.setItem("docResults", JSON.stringify(data));
      window.location.href = "/results";
    } catch (err) { setError("Failed to process document. Please try again."); console.error(err); }
    finally { setIsUploading(false); }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream-50 dark:bg-bark-900 pt-16 relative overflow-hidden transition-colors">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-terra-200/30 dark:bg-terra-800/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute top-[60%] left-0 w-[500px] h-[500px] bg-sage-200/30 dark:bg-sage-800/10 rounded-full blur-[100px] -translate-x-1/3 pointer-events-none" />

        {/* Hero */}
        <section className="relative px-5 pt-24 pb-14 sm:pt-32 sm:pb-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-terra-100/60 dark:bg-terra-900/30 text-terra-700 dark:text-terra-300 text-sm font-medium px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
              <Shield className="h-3.5 w-3.5" />
              Free &amp; private — no login required
            </div>
            <h1 className="text-5xl sm:text-6xl font-serif text-bark-900 dark:text-cream-50 tracking-tight mb-6 leading-[1.1]">
              Understand your<br />
              <span className="text-terra-500 dark:text-terra-300">official documents</span>
            </h1>
            <p className="text-lg text-bark-400 dark:text-sand-400 max-w-lg mx-auto leading-relaxed">
              Upload any UK official document and get a plain English breakdown with deadlines, actions, and a ready-made response.
            </p>
          </div>
        </section>

        {/* Upload */}
        <section className="relative px-5 pb-20">
          <div className="max-w-md mx-auto">
            <div className="bg-white/70 dark:bg-bark-800/60 backdrop-blur-xl rounded-3xl shadow-lg shadow-bark-900/5 dark:shadow-black/20 border border-white/50 dark:border-bark-700/50 p-8 transition-colors">
              <div
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer mb-6 ${
                  isDragOver
                    ? "border-terra-400 bg-terra-50/50 dark:bg-terra-950/20"
                    : "border-sand-300/60 dark:border-bark-600/60 hover:border-terra-300 dark:hover:border-terra-600 hover:bg-cream-100/30 dark:hover:bg-bark-700/30"
                }`}
              >
                <input type="file" id="file-upload" className="hidden" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} disabled={isUploading} />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className={`mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isDragOver ? "bg-terra-100 dark:bg-terra-900 scale-110" : "bg-sand-100 dark:bg-bark-700"}`}>
                    <Upload className={`h-7 w-7 transition-colors ${isDragOver ? "text-terra-500" : "text-bark-300 dark:text-bark-400"}`} />
                  </div>
                  <p className="text-bark-700 dark:text-cream-100 font-medium mb-1">{file ? file.name : "Drop your document here or click to browse"}</p>
                  <p className="text-bark-300 dark:text-bark-500 text-sm">JPG, PNG, or PDF up to 10 MB</p>
                  <p className="text-bark-400/70 dark:text-bark-500/70 text-xs mt-2">For best results, use a clear, well-lit photo or a high-quality PDF</p>
                </label>
              </div>

              {error && (
                <div className="bg-red-50/80 dark:bg-red-950/40 border border-red-100/60 dark:border-red-800/40 rounded-xl p-3 mb-4 flex items-start backdrop-blur-sm">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button onClick={handleUpload} disabled={!file || isUploading}
                className="w-full bg-terra-500 text-cream-50 py-4 px-4 rounded-2xl font-semibold hover:bg-terra-600 focus:outline-none focus:ring-2 focus:ring-terra-400 focus:ring-offset-2 disabled:bg-sand-300 dark:disabled:bg-bark-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2.5 text-base active:scale-[0.98]"
              >
                {isUploading ? (
                  <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Analysing your document…</>
                ) : (<>Analyse Document<ArrowRight className="h-5 w-5" /></>)}
              </button>

              <p className="text-xs text-bark-300/80 dark:text-bark-500 text-center mt-5">
                This is not legal advice. For further help, contact{" "}
                <a href="https://www.citizensadvice.org.uk/" target="_blank" rel="noopener noreferrer" className="underline hover:text-terra-500 dark:hover:text-terra-400 transition-colors">Citizens Advice</a>.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works + Example Output */}
        <section className="relative px-5 pb-24">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-serif text-bark-900 dark:text-cream-50 mb-10">How it works</h2>
              <div className="space-y-8">
                {[
                  { icon: Upload, title: "Upload", desc: "Take a photo or upload a PDF of your official document." },
                  { icon: FileText, title: "Analyse", desc: "AI reads and explains the document in plain English." },
                  { icon: ArrowRight, title: "Act", desc: "Get key deadlines, actions, and a ready-made response letter." },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-5 group">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-terra-100/60 dark:bg-terra-900/30 flex items-center justify-center group-hover:bg-terra-200/60 dark:group-hover:bg-terra-800/30 transition-colors">
                      <step.icon className="h-6 w-6 text-terra-500 dark:text-terra-300" />
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold text-bark-900 dark:text-cream-100 mb-1 text-lg">{step.title}</h3>
                      <p className="text-bark-400 dark:text-sand-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-serif text-bark-900 dark:text-cream-50 mb-10">See what you get</h2>
              <div className="bg-white/70 dark:bg-bark-800/60 backdrop-blur-xl rounded-3xl shadow-lg shadow-bark-900/5 dark:shadow-black/20 border border-white/50 dark:border-bark-700/50 overflow-hidden transition-colors">
                <div className="bg-terra-100/40 dark:bg-terra-900/20 px-5 py-3 border-b border-terra-100/30 dark:border-terra-900/20 backdrop-blur-sm">
                  <span className="text-xs font-semibold text-terra-600 dark:text-terra-300 uppercase tracking-widest">Your Results</span>
                </div>
                <div className="p-5 flex items-center justify-center bg-cream-50/30 dark:bg-bark-800/30 min-h-[340px]">
                  {sampleOutputError ? (
                    <div className="flex flex-col items-center gap-3 text-bark-200 dark:text-bark-500">
                      <FileText className="h-10 w-10" />
                      <p className="text-sm">Add sample-output.jpg to /public</p>
                    </div>
                  ) : (
                    <img src="/sample-output.jpg" alt="Example analysis results" className="w-full scale-105 rounded-2xl shadow-md object-contain cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setFullscreenImg(true)} onError={() => setSampleOutputError(true)} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Docs */}
        <section className="relative px-5 pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-serif text-bark-900 dark:text-cream-50 mb-4">Any UK official document</h2>
            <p className="text-bark-400 dark:text-sand-400 max-w-xl mx-auto mb-10 leading-relaxed">
              From parking fines to NHS letters — if it&apos;s an official UK document, we can break it down for you.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { emoji: "🚇", title: "TfL & Transport" },
                { emoji: "🏠", title: "Council & Housing" },
                { emoji: "📋", title: "Eviction & Court" },
                { emoji: "🏥", title: "NHS & Medical" },
                { emoji: "💰", title: "Tax & HMRC" },
                { emoji: "🏛️", title: "Immigration" },
                { emoji: "⚖️", title: "Legal Notices" },
                { emoji: "📨", title: "Benefits & DWP" },
              ].map((doc, i) => (
                <div key={i} className="bg-white/60 dark:bg-bark-800/50 backdrop-blur-lg rounded-2xl border border-white/40 dark:border-bark-700/40 p-4 text-center hover:shadow-md hover:shadow-bark-900/5 dark:hover:shadow-black/10 transition-all hover:-translate-y-0.5">
                  <div className="text-2xl mb-2">{doc.emoji}</div>
                  <p className="text-sm font-medium text-bark-700 dark:text-sand-300">{doc.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Us */}
        <section id="about" className="relative px-5 pb-24 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif text-bark-900 dark:text-cream-50 text-center mb-4">About Us</h2>
            <p className="text-bark-400 dark:text-sand-400 text-center max-w-xl mx-auto mb-12 leading-relaxed">
              DocExplain was built to make official documents accessible to everyone. No one should lose out because a letter was too hard to understand.
            </p>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { icon: Users, title: "Built for people", desc: "Designed for migrants, elderly users, and anyone who struggles with complex language." },
                { icon: Shield, title: "Private by design", desc: "Your documents are processed in real-time and never stored on our servers." },
                { icon: Clock, title: "Instant results", desc: "Get a full breakdown in 30–60 seconds — no waiting, no appointments." },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-sage-100/60 dark:bg-sage-900/30 flex items-center justify-center mb-5">
                    <item.icon className="h-6 w-6 text-sage-600 dark:text-sage-300" />
                  </div>
                  <h3 className="font-semibold text-bark-900 dark:text-cream-100 mb-2">{item.title}</h3>
                  <p className="text-sm text-bark-400 dark:text-sand-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Help */}
        <section id="help" className="relative px-5 pb-24 scroll-mt-20">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-serif text-bark-900 dark:text-cream-50 text-center mb-12">Help</h2>
            <div className="space-y-4">
              {[
                { icon: Upload, q: "What file types can I upload?", a: "You can upload JPG or PNG images (e.g. a photo of a letter) or a PDF file. The maximum file size is 10 MB." },
                { icon: Shield, q: "Is my document stored anywhere?", a: "No. Your document is processed in real-time and is never saved to our servers. It exists only for the duration of the analysis." },
                { icon: BookOpen, q: "What documents are supported?", a: "Any UK official document — TfL fines, council letters, eviction notices, NHS letters, HMRC notices, immigration documents, court orders, DWP letters, and more." },
                { icon: MessageCircle, q: "Is this legal advice?", a: "No. DocExplain provides plain-English summaries and suggested actions, but this is not a substitute for professional legal advice. For expert help, contact Citizens Advice." },
              ].map((item, i) => (
                <div key={i} className="bg-white/60 dark:bg-bark-800/50 backdrop-blur-lg rounded-2xl border border-white/40 dark:border-bark-700/40 p-6 flex gap-5 transition-colors hover:bg-white/80 dark:hover:bg-bark-800/60">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-terra-100/60 dark:bg-terra-900/30 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-terra-500 dark:text-terra-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-bark-900 dark:text-cream-100 mb-1.5">{item.q}</h3>
                    <p className="text-sm text-bark-400 dark:text-sand-400 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="relative px-5 pb-24 scroll-mt-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif text-bark-900 dark:text-cream-50 text-center mb-4">Get in touch</h2>
            <p className="text-bark-400 dark:text-sand-400 text-center mb-12">Meet the team behind DocExplain</p>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { name: "Aaron Parwany", handle: "@aarondoesnotcode", linkedin: "https://www.linkedin.com/in/aaron-parwany/", github: "https://github.com/aarondoesnotcode", img: "/aaron pfp.jpeg" },
                { name: "Ajay Solanki", handle: "@ajaysoll", linkedin: "https://www.linkedin.com/in/ajay-solanki05/", github: "https://github.com/ajaysoll", img: "/ajay pfp.jpeg" },
              ].map((person, i) => (
                <div key={i} className="bg-white/60 dark:bg-bark-800/50 backdrop-blur-lg rounded-3xl border border-white/40 dark:border-bark-700/40 p-7 flex flex-col items-center text-center transition-all hover:shadow-md hover:shadow-bark-900/5 dark:hover:shadow-black/10 hover:-translate-y-0.5">
                  <img src={person.img} alt={person.name} className="w-22 h-22 rounded-2xl object-cover mb-5 ring-2 ring-sand-200/60 dark:ring-bark-600/60 shadow-sm" />
                  <h3 className="text-lg font-semibold text-bark-900 dark:text-cream-100 mb-0.5">{person.name}</h3>
                  <p className="text-sm text-bark-300 dark:text-bark-500 mb-5">{person.handle}</p>
                  <div className="flex items-center gap-2.5">
                    <a href={person.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-bark-500 dark:text-sand-300 hover:text-terra-500 dark:hover:text-terra-300 bg-sand-100/60 dark:bg-bark-700/60 hover:bg-terra-50 dark:hover:bg-terra-950 px-3.5 py-2 rounded-xl transition-all"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      LinkedIn
                    </a>
                    <a href={person.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-bark-500 dark:text-sand-300 hover:text-bark-900 dark:hover:text-cream-50 bg-sand-100/60 dark:bg-bark-700/60 hover:bg-sand-200/60 dark:hover:bg-bark-600/60 px-3.5 py-2 rounded-xl transition-all"
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
        <footer className="border-t border-sand-200/50 dark:border-bark-700/50 bg-white/40 dark:bg-bark-900/60 backdrop-blur-lg py-8 px-5 transition-colors">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-bark-300 dark:text-bark-500">
            <span>@aarondoesnotcode @ajaysoll</span>
            <span>This is not legal advice. For further help, contact <a href="https://www.citizensadvice.org.uk/" target="_blank" rel="noopener noreferrer" className="underline hover:text-terra-500 dark:hover:text-terra-400 transition-colors">Citizens Advice</a>.</span>
          </div>
        </footer>
        {/* Fullscreen image overlay */}
        {fullscreenImg && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 cursor-pointer" onClick={() => setFullscreenImg(false)}>
            <img src="/sample-output.jpg" alt="Example analysis results" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
            <button onClick={() => setFullscreenImg(false)} className="absolute top-5 right-5 text-white/70 hover:text-white text-sm font-medium bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full transition-all">Close</button>
          </div>
        )}
      </main>
    </>
  );
}
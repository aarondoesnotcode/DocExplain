"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, Clock, Edit2, Copy, Download } from "lucide-react";
import Navbar from "@/components/Navbar";

interface DocumentResults {
  summary: string;
  key_points: string[];
  urgency: "low" | "medium" | "high";
  deadline: string;
  actions: string[];
  recommended_action: string;
  response_letter: string;
}

export default function ResultsPage() {
  const [results, setResults] = useState<DocumentResults | null>(null);
  const [editingLetter, setEditingLetter] = useState(false);
  const [letterContent, setLetterContent] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedResults = sessionStorage.getItem("docResults");
    if (storedResults) {
      const parsed = JSON.parse(storedResults);
      setResults(parsed);
      setLetterContent(parsed.response_letter);
    }
  }, []);

  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case "high":
        return { bg: "bg-red-50/70 dark:bg-red-950/40", border: "border-red-200/60 dark:border-red-800/40", text: "text-red-700 dark:text-red-300", icon: "text-red-500 dark:text-red-400" };
      case "medium":
        return { bg: "bg-amber-50/70 dark:bg-amber-950/40", border: "border-amber-200/60 dark:border-amber-800/40", text: "text-amber-700 dark:text-amber-300", icon: "text-amber-500 dark:text-amber-400" };
      case "low":
        return { bg: "bg-sage-50/70 dark:bg-sage-950/40", border: "border-sage-200/60 dark:border-sage-800/40", text: "text-sage-700 dark:text-sage-300", icon: "text-sage-500 dark:text-sage-400" };
      default:
        return { bg: "bg-sand-50/70 dark:bg-bark-800/40", border: "border-sand-200/60 dark:border-bark-700/40", text: "text-bark-700 dark:text-sand-300", icon: "text-bark-400" };
    }
  };

  const handleCopyLetter = async () => {
    await navigator.clipboard.writeText(letterContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLetter = () => {
    const blob = new Blob([letterContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "response-letter.txt";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!results) {
    return (
      <>
        <Navbar showNavLinks={false} />
        <div className="min-h-screen bg-cream-50 dark:bg-bark-900 pt-16 flex items-center justify-center transition-colors">
          <div className="text-center">
            <p className="text-bark-400 dark:text-sand-400 mb-4">No document results found.</p>
            <Link href="/" className="text-terra-500 dark:text-terra-300 hover:text-terra-600 font-medium">Upload a document</Link>
          </div>
        </div>
      </>
    );
  }

  const urgencyStyle = getUrgencyStyle(results.urgency);

  return (
    <>
      <Navbar showNavLinks={false} />
      <main className="min-h-screen bg-cream-50 dark:bg-bark-900 pt-16 relative overflow-hidden transition-colors">
        {/* Decorative blob */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-terra-200/20 dark:bg-terra-800/10 rounded-full blur-[100px] translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-5 py-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-bark-400 dark:text-sand-400 hover:text-terra-500 dark:hover:text-terra-300 transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Upload another document
          </Link>

          <div className="bg-white/70 dark:bg-bark-800/60 backdrop-blur-xl rounded-3xl shadow-lg shadow-bark-900/5 dark:shadow-black/20 border border-white/50 dark:border-bark-700/50 p-7 sm:p-9 mb-6 transition-colors">
            {/* Summary */}
            <section className="mb-10">
              <h2 className="text-lg font-serif text-bark-900 dark:text-cream-50 mb-4 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-terra-100/60 dark:bg-terra-900/30 flex items-center justify-center">
                  <FileText className="h-4.5 w-4.5 text-terra-500 dark:text-terra-300" />
                </div>
                Summary
              </h2>
              <p className="text-bark-600 dark:text-sand-300 leading-relaxed text-[15px]">{results.summary}</p>
            </section>

            {/* Urgency + Deadline */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              <div className={`${urgencyStyle.bg} ${urgencyStyle.border} border backdrop-blur-sm rounded-2xl p-5`}>
                <div className="flex items-center gap-2 mb-2">
                  {results.urgency === "high" ? <AlertTriangle className={`h-5 w-5 ${urgencyStyle.icon}`} /> : results.urgency === "medium" ? <Clock className={`h-5 w-5 ${urgencyStyle.icon}`} /> : <CheckCircle className={`h-5 w-5 ${urgencyStyle.icon}`} />}
                  <span className={`font-semibold text-sm ${urgencyStyle.text}`}>Urgency</span>
                </div>
                <p className={`capitalize text-xl font-serif font-bold ${urgencyStyle.text}`}>{results.urgency}</p>
              </div>
              <div className="bg-sand-50/70 dark:bg-bark-700/40 border border-sand-200/60 dark:border-bark-600/40 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-terra-500 dark:text-terra-300" />
                  <span className="font-semibold text-sm text-bark-600 dark:text-sand-400">Deadline</span>
                </div>
                <p className="text-bark-800 dark:text-sand-200 font-bold font-serif text-2xl">{results.deadline || "Not specified"}</p>
              </div>
            </div>

            {/* Key Points */}
            <section className="mb-10">
              <h2 className="text-lg font-serif text-bark-900 dark:text-cream-50 mb-4">Key Points</h2>
              <ul className="space-y-2.5">
                {results.key_points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3.5 bg-sand-50/60 dark:bg-bark-700/40 rounded-xl p-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-terra-100/60 dark:bg-terra-900/30 text-terra-600 dark:text-terra-300 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                    <span className="text-bark-700 dark:text-sand-300 text-sm leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Actions */}
            <section className="mb-10">
              <h2 className="text-lg font-serif text-bark-900 dark:text-cream-50 mb-4">Actions You Can Take</h2>
              <ul className="space-y-2.5">
                {results.actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-3.5 bg-sand-50/60 dark:bg-bark-700/40 rounded-xl p-4">
                    <CheckCircle className="h-5 w-5 text-terra-500 dark:text-terra-300 flex-shrink-0 mt-0.5" />
                    <span className="text-bark-700 dark:text-sand-300 text-sm leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Recommended Action */}
            <section className="mb-10">
              <h2 className="text-lg font-serif text-bark-900 dark:text-cream-50 mb-4">Recommended Action</h2>
              <div className="bg-terra-50/60 dark:bg-bark-700/40 border-l-4 border-terra-400 dark:border-terra-600 p-5 rounded-r-xl backdrop-blur-sm">
                <p className="text-bark-800 dark:text-sand-200 font-medium text-sm leading-relaxed">{results.recommended_action}</p>
              </div>
            </section>

            {/* Response Letter */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif text-bark-900 dark:text-cream-50">Response Letter</h2>
                <div className="flex gap-2">
                  <button onClick={handleCopyLetter} className="text-xs font-medium bg-sand-100/60 dark:bg-bark-700/60 hover:bg-sand-200/60 dark:hover:bg-bark-600/60 text-bark-500 dark:text-sand-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors backdrop-blur-sm">
                    <Copy className="h-3.5 w-3.5" />{copied ? "Copied" : "Copy"}
                  </button>
                  <button onClick={handleDownloadLetter} className="text-xs font-medium bg-sand-100/60 dark:bg-bark-700/60 hover:bg-sand-200/60 dark:hover:bg-bark-600/60 text-bark-500 dark:text-sand-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors backdrop-blur-sm">
                    <Download className="h-3.5 w-3.5" />Download
                  </button>
                  <button onClick={() => setEditingLetter(!editingLetter)} className="text-xs font-medium bg-terra-100/60 dark:bg-terra-900/30 hover:bg-terra-200/60 dark:hover:bg-terra-800/30 text-terra-600 dark:text-terra-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors backdrop-blur-sm">
                    <Edit2 className="h-3.5 w-3.5" />{editingLetter ? "Done" : "Edit"}
                  </button>
                </div>
              </div>
              <div className="border border-sand-200/60 dark:border-bark-600/40 rounded-2xl overflow-hidden bg-white/40 dark:bg-bark-800/30 backdrop-blur-sm">
                {editingLetter ? (
                  <textarea value={letterContent} onChange={(e) => setLetterContent(e.target.value)}
                    className="w-full h-64 p-5 text-sm bg-transparent text-bark-900 dark:text-sand-200 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-terra-400" />
                ) : (
                  <div className="p-5 whitespace-pre-wrap text-bark-600 dark:text-sand-300 text-sm leading-relaxed">{letterContent}</div>
                )}
              </div>
            </section>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100/60 dark:border-amber-800/40 rounded-2xl p-5 flex items-start gap-3.5 backdrop-blur-sm">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 dark:text-amber-200 font-semibold text-sm mb-0.5">Important Disclaimer</p>
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                This is not legal advice. For further help, contact{" "}
                <a href="https://www.citizensadvice.org.uk/" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900 dark:hover:text-amber-100">Citizens Advice</a>.
              </p>
            </div>
          </div>
        </div>

        <footer className="border-t border-sand-200/50 dark:border-bark-700/50 bg-white/40 dark:bg-bark-900/60 backdrop-blur-lg py-8 px-5 mt-8 transition-colors">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-bark-300 dark:text-bark-500">
            <span>@aarondoesnotcode @ajaysoll</span>
            <span>This is not legal advice. For further help, contact <a href="https://www.citizensadvice.org.uk/" target="_blank" rel="noopener noreferrer" className="underline hover:text-terra-500 dark:hover:text-terra-400 transition-colors">Citizens Advice</a>.</span>
          </div>
        </footer>
      </main>
    </>
  );
}
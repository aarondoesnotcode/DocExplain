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
        return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: "text-red-500" };
      case "medium":
        return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-500" };
      case "low":
        return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-500" };
      default:
        return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", icon: "text-gray-500" };
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
    a.href = url;
    a.download = "response-letter.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!results) {
    return (
      <>
        <Navbar showNavLinks={false} />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No document results found.</p>
            <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Upload a document
            </Link>
          </div>
        </div>
      </>
    );
  }

  const urgencyStyle = getUrgencyStyle(results.urgency);

  return (
    <>
      <Navbar showNavLinks={false} />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 pt-16">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Upload another document
          </Link>

          {/* Main card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-6">
            {/* Summary */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Summary
              </h2>
              <p className="text-gray-600 leading-relaxed">{results.summary}</p>
            </section>

            {/* Urgency + Deadline row */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className={`${urgencyStyle.bg} ${urgencyStyle.border} border rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-1">
                  {results.urgency === "high" ? (
                    <AlertTriangle className={`h-5 w-5 ${urgencyStyle.icon}`} />
                  ) : results.urgency === "medium" ? (
                    <Clock className={`h-5 w-5 ${urgencyStyle.icon}`} />
                  ) : (
                    <CheckCircle className={`h-5 w-5 ${urgencyStyle.icon}`} />
                  )}
                  <span className={`font-semibold text-sm ${urgencyStyle.text}`}>Urgency</span>
                </div>
                <p className={`capitalize text-lg font-bold ${urgencyStyle.text}`}>{results.urgency}</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-sm text-blue-700">Deadline</span>
                </div>
                <p className="text-blue-800 font-bold">{results.deadline || "Not specified"}</p>
              </div>
            </div>

            {/* Key Points */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Points</h2>
              <ul className="space-y-2">
                {results.key_points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-gray-700 text-sm leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Actions */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Actions You Can Take</h2>
              <ul className="space-y-2">
                {results.actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-3 bg-indigo-50/60 rounded-lg p-3">
                    <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Recommended Action */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Recommended Action</h2>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <p className="text-gray-800 font-medium text-sm leading-relaxed">{results.recommended_action}</p>
              </div>
            </section>

            {/* Response Letter */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Response Letter</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLetter}
                    className="text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownloadLetter}
                    className="text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                  <button
                    onClick={() => setEditingLetter(!editingLetter)}
                    className="text-xs font-medium bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    {editingLetter ? "Done" : "Edit"}
                  </button>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {editingLetter ? (
                  <textarea
                    value={letterContent}
                    onChange={(e) => setLetterContent(e.target.value)}
                    className="w-full h-64 p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  />
                ) : (
                  <div className="p-4 whitespace-pre-wrap text-gray-600 text-sm leading-relaxed">
                    {letterContent}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-semibold text-sm mb-0.5">Important Disclaimer</p>
              <p className="text-amber-700 text-sm">
                This is not legal advice. For further help, contact{" "}
                <a href="https://www.citizensadvice.org.uk/" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">
                  Citizens Advice
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-100 bg-white py-8 px-4 mt-8">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <span>@aarondoesnotcode @ajaysoll</span>
            <span>This is not legal advice. For further help, contact <a href="https://www.citizensadvice.org.uk/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Citizens Advice</a>.</span>
          </div>
        </footer>
      </main>
    </>
  );
}
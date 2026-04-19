"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, Clock, Edit2, Copy, Download, Mail, ChevronRight, ExternalLink, Phone, Globe, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";

interface DocumentResults {
  summary: string;
  key_points: string[];
  urgency: "low" | "medium" | "high";
  deadline: string;
  actions: string[];
  recommended_action: string;
  response_letter: string;
  timeline: Array<{ label: string; date: string; description: string }>;
  appeal_info: { method: string; email?: string; website?: string; phone?: string; address?: string };
}

function parseDeadlineDate(deadline: string): Date | null {
  if (!deadline || deadline === "No deadline specified") return null;

  const cleaned = deadline.replace(/(\d+)(st|nd|rd|th)/gi, "$1").trim();

  const formats = [
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,       // DD/MM/YYYY or DD-MM-YYYY
    /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,        // YYYY-MM-DD or YYYY/MM/DD
    /^(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i,
    /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})$/i,
    /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i,
  ];

  for (const fmt of formats) {
    const match = cleaned.match(fmt);
    if (match) {
      const parts = match.slice(1);
      if (fmt === formats[0]) {
        // DD/MM/YYYY
        const d = new Date(+parts[2], +parts[1] - 1, +parts[0]);
        if (!isNaN(d.getTime())) return d;
      } else if (fmt === formats[1]) {
        // YYYY-MM-DD
        const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
        if (!isNaN(d.getTime())) return d;
      } else {
        const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const shortMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        let monthIndex = monthNames.findIndex(m => m.toLowerCase() === (parts[1] || parts[0]).toLowerCase());
        if (monthIndex === -1) monthIndex = shortMonths.findIndex(m => m.toLowerCase() === (parts[1] || parts[0]).toLowerCase());
        if (monthIndex === -1) continue;
        let day: number, year: number;
        if (fmt === formats[2] || fmt === formats[4]) {
          day = +parts[0]; year = +parts[2];
        } else {
          day = +parts[1]; year = +parts[2];
        }
        const d = new Date(year, monthIndex, day);
        if (!isNaN(d.getTime())) return d;
      }
    }
  }

  // Fallback: let JS try
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
}

function getCalculatedUrgency(deadline: string): { level: "low" | "medium" | "high"; passed: boolean; deadlineDate: Date | null; displayDeadline: string } {
  const deadlineDate = parseDeadlineDate(deadline);
  if (!deadlineDate) {
    return { level: "medium", passed: false, deadlineDate: null, displayDeadline: deadline || "Not specified" };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(deadlineDate);
  target.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { level: "high", passed: true, deadlineDate, displayDeadline: target.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) };
  }
  if (daysLeft < 4) {
    return { level: "high", passed: false, deadlineDate, displayDeadline: target.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) };
  }
  if (daysLeft <= 7) {
    return { level: "medium", passed: false, deadlineDate, displayDeadline: target.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) };
  }
  return { level: "low", passed: false, deadlineDate, displayDeadline: target.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) };
}

export default function ResultsPage() {
  const [results, setResults] = useState<DocumentResults | null>(null);
  const [editingLetter, setEditingLetter] = useState(false);
  const [letterContent, setLetterContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAppeal, setShowAppeal] = useState(false);

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

  const urgencyInfo = getCalculatedUrgency(
    results.deadline && results.deadline !== "No deadline specified"
      ? results.deadline
      : (results.timeline && results.timeline.length > 0 ? results.timeline[results.timeline.length - 1].date : "")
  );
  const urgencyStyle = getUrgencyStyle(urgencyInfo.level);

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
              {urgencyInfo.passed ? (
                <div className="bg-sand-50/70 dark:bg-bark-700/40 border border-sand-200/60 dark:border-bark-600/40 backdrop-blur-sm rounded-2xl p-5 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-bark-400" />
                    <span className="font-semibold text-sm text-bark-500 dark:text-sand-400">Current Level of Urgency</span>
                  </div>
                  <p className="text-bark-500 dark:text-sand-400 text-base font-serif">Deadline has passed</p>
                  <p className="text-bark-400 dark:text-sand-500 text-sm mt-1">{urgencyInfo.displayDeadline}</p>
                </div>
              ) : (
                <div className={`${urgencyStyle.bg} ${urgencyStyle.border} border backdrop-blur-sm rounded-2xl p-5 text-center`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {urgencyInfo.level === "high" ? <AlertTriangle className={`h-5 w-5 ${urgencyStyle.icon}`} /> : urgencyInfo.level === "medium" ? <Clock className={`h-5 w-5 ${urgencyStyle.icon}`} /> : <CheckCircle className={`h-5 w-5 ${urgencyStyle.icon}`} />}
                    <span className={`font-semibold text-sm ${urgencyStyle.text}`}>Current Level of Urgency</span>
                  </div>
                  <p className={`capitalize text-xl font-serif font-bold ${urgencyStyle.text}`}>{urgencyInfo.level}</p>
                </div>
              )}
              <div className="bg-sand-50/70 dark:bg-bark-700/40 border border-sand-200/60 dark:border-bark-600/40 backdrop-blur-sm rounded-2xl p-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-terra-500 dark:text-terra-300" />
                  <span className="font-semibold text-sm text-bark-600 dark:text-sand-400">Deadline</span>
                </div>
                <p className="text-bark-800 dark:text-sand-200 font-serif text-xl">{urgencyInfo.displayDeadline}</p>
              </div>
            </div>

            {/* Timeline */}
            {results.timeline && results.timeline.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-serif text-bark-900 dark:text-cream-50 mb-5 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-terra-100/60 dark:bg-terra-900/30 flex items-center justify-center">
                    <Clock className="h-4.5 w-4.5 text-terra-500 dark:text-terra-300" />
                  </div>
                  Timeline
                </h2>
                <div className="overflow-x-auto -mx-2 px-2 pb-2">
                  <div className="relative min-w-max mx-auto w-fit">
                    {/* Horizontal connector line */}
                    <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-sand-200 dark:bg-bark-600" />
                    <div className="flex items-start">
                      {results.timeline.map((event, i) => {
                        const eventDate = parseDeadlineDate(event.date);
                        const now = new Date(); now.setHours(0,0,0,0);
                        const target = eventDate ? (() => { const d = new Date(eventDate); d.setHours(0,0,0,0); return d; })() : null;
                        const isPast = target && target < now;
                        const isLast = i === results.timeline.length - 1;

                        return (
                          <div key={i} className="flex-1 flex flex-col items-center min-w-[140px] max-w-[180px] px-2">
                            {/* Label above */}
                            <span className={`text-xs font-semibold text-center leading-tight mb-3 ${isPast ? "text-bark-400 dark:text-bark-500" : "text-bark-700 dark:text-sand-300"}`}>
                              {event.label}
                            </span>
                            {/* Dot on the line */}
                            <div className={`w-5 h-5 rounded-full border-[3px] z-10 flex-shrink-0 ${
                              isPast
                                ? "bg-bark-200 dark:bg-bark-600 border-bark-300 dark:border-bark-500"
                                : isLast
                                  ? "bg-terra-500 dark:bg-terra-400 border-terra-600 dark:border-terra-500"
                                  : "bg-white dark:bg-bark-800 border-terra-300 dark:border-terra-500"
                            }`} />
                            {/* Date below */}
                            <span className={`text-sm font-serif font-bold mt-3 text-center whitespace-nowrap ${isPast ? "text-bark-400 dark:text-bark-500 line-through" : "text-bark-800 dark:text-sand-200"}`}>
                              {event.date}
                            </span>
                            {/* Description */}
                            {event.description && (
                              <span className={`text-[11px] text-center mt-1 leading-snug ${isPast ? "text-bark-300 dark:text-bark-600" : "text-bark-500 dark:text-sand-400"}`}>
                                {event.description}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

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

            {/* Appeal Information */}
            {results.appeal_info && (
              <section className="mb-10">
                <h2 className="text-lg font-serif text-bark-900 dark:text-cream-50 mb-4 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-terra-100/60 dark:bg-terra-900/30 flex items-center justify-center">
                    <ExternalLink className="h-4.5 w-4.5 text-terra-500 dark:text-terra-300" />
                  </div>
                  How to Appeal
                </h2>
                <div className="border border-sand-200/60 dark:border-bark-600/40 rounded-2xl p-6 bg-white/40 dark:bg-bark-800/30 backdrop-blur-sm space-y-3">
                  <p className="text-bark-700 dark:text-sand-300 text-sm font-medium">{results.appeal_info.method}</p>
                  <div className="flex flex-wrap gap-3">
                    {results.appeal_info.email && (
                      <a href={`mailto:${results.appeal_info.email}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sand-50/80 dark:bg-bark-700/50 border border-sand-200/60 dark:border-bark-600/40 text-sm text-bark-700 dark:text-sand-300 hover:bg-sand-100/80 dark:hover:bg-bark-600/50 transition-colors">
                        <Mail className="h-4 w-4 text-terra-500 dark:text-terra-300" />
                        {results.appeal_info.email}
                      </a>
                    )}
                    {results.appeal_info.website && (
                      <a href={results.appeal_info.website.startsWith("http") ? results.appeal_info.website : `https://${results.appeal_info.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sand-50/80 dark:bg-bark-700/50 border border-sand-200/60 dark:border-bark-600/40 text-sm text-bark-700 dark:text-sand-300 hover:bg-sand-100/80 dark:hover:bg-bark-600/50 transition-colors">
                        <Globe className="h-4 w-4 text-terra-500 dark:text-terra-300" />
                        {results.appeal_info.website.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                    {results.appeal_info.phone && (
                      <a href={`tel:${results.appeal_info.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sand-50/80 dark:bg-bark-700/50 border border-sand-200/60 dark:border-bark-600/40 text-sm text-bark-700 dark:text-sand-300 hover:bg-sand-100/80 dark:hover:bg-bark-600/50 transition-colors">
                        <Phone className="h-4 w-4 text-terra-500 dark:text-terra-300" />
                        {results.appeal_info.phone}
                      </a>
                    )}
                    {results.appeal_info.address && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sand-50/80 dark:bg-bark-700/50 border border-sand-200/60 dark:border-bark-600/40 text-sm text-bark-700 dark:text-sand-300">
                        <MapPin className="h-4 w-4 text-terra-500 dark:text-terra-300 flex-shrink-0" />
                        {results.appeal_info.address}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Response Letter / Appeal */}
            <section>
              {!showAppeal ? (
                <div className="border border-sand-200/60 dark:border-bark-600/40 rounded-2xl p-6 bg-white/40 dark:bg-bark-800/30 backdrop-blur-sm text-center">
                  <div className="w-12 h-12 rounded-2xl bg-terra-100/60 dark:bg-terra-900/30 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-terra-500 dark:text-terra-300" />
                  </div>
                  <h2 className="text-lg font-serif text-bark-900 dark:text-cream-50 mb-2">Want to appeal?</h2>
                  <p className="text-bark-500 dark:text-sand-400 text-sm mb-5 max-w-md mx-auto">We can generate a professional response letter for you to send to the issuer. You can edit it before using it.</p>
                  <button
                    onClick={() => setShowAppeal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-terra-500 hover:bg-terra-600 text-white font-medium text-sm rounded-xl transition-colors"
                  >
                    Generate Appeal Letter
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
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
                  <p className="text-bark-400 dark:text-bark-500 text-xs mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    This is a suggested draft — ensure accuracy before submitting
                  </p>
                  <div className="border border-sand-200/60 dark:border-bark-600/40 rounded-2xl overflow-hidden bg-white/40 dark:bg-bark-800/30 backdrop-blur-sm">
                    {editingLetter ? (
                      <textarea value={letterContent} onChange={(e) => setLetterContent(e.target.value)}
                        className="w-full h-64 p-5 text-sm bg-transparent text-bark-900 dark:text-sand-200 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-terra-400" />
                    ) : (
                      <div className="p-5 whitespace-pre-wrap text-bark-600 dark:text-sand-300 text-sm leading-relaxed">{letterContent}</div>
                    )}
                  </div>
                </>
              )}
            </section>
          </div>

          {/* Disclaimer */}
          <div className="space-y-3">
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
            <div className="bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100/60 dark:border-amber-800/40 rounded-2xl p-5 flex items-start gap-3.5 backdrop-blur-sm">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 dark:text-amber-200 font-semibold text-sm mb-0.5">Accuracy Notice</p>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  The information on this page is generated from your uploaded document using AI and OCR. Accuracy depends on the quality of your photo or scan — blurry, cropped, or low-quality images may produce errors. Please double-check all dates, amounts, reference numbers, and details against your original document before taking any action.
                </p>
              </div>
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
"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, Clock, Edit2, Copy, Download } from "lucide-react";

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

  useEffect(() => {
    const storedResults = sessionStorage.getItem("docResults");
    if (storedResults) {
      const parsed = JSON.parse(storedResults);
      setResults(parsed);
      setLetterContent(parsed.response_letter);
    }
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <AlertTriangle className="h-5 w-5" />;
      case "medium":
        return <Clock className="h-5 w-5" />;
      case "low":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(letterContent);
    // You could add a toast notification here
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading results...</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Go back to upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => (window.location.href = "/")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Upload Another Document
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Document Analysis
          </h1>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {/* Summary Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-indigo-600" />
              Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{results.summary}</p>
          </section>

          {/* Urgency and Deadline */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className={`border rounded-lg p-4 ${getUrgencyColor(results.urgency)}`}>
              <h3 className="font-semibold mb-2 flex items-center">
                {getUrgencyIcon(results.urgency)}
                <span className="ml-2">Urgency Level</span>
              </h3>
              <p className="capitalize">{results.urgency}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold mb-2 flex items-center text-blue-900">
                <Clock className="h-5 w-5 mr-2" />
                Deadline
              </h3>
              <p className="text-blue-900">{results.deadline || "Not specified"}</p>
            </div>
          </div>

          {/* Key Points */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Key Points</h2>
            <ul className="space-y-2">
              {results.key_points.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start bg-gray-50 rounded-lg p-3"
                >
                  <span className="text-indigo-600 font-bold mr-2 mt-1">
                    {index + 1}.
                  </span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Actions */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Actions You Can Take
            </h2>
            <ul className="space-y-2">
              {results.actions.map((action, index) => (
                <li
                  key={index}
                  className="flex items-start bg-indigo-50 rounded-lg p-3"
                >
                  <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{action}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Recommended Action */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Recommended Action
            </h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <p className="text-gray-800 font-medium">{results.recommended_action}</p>
            </div>
          </section>

          {/* Response Letter */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-900">
                Response Letter
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLetter}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded flex items-center transition-colors"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </button>
                <button
                  onClick={handleDownloadLetter}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded flex items-center transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
                <button
                  onClick={() => setEditingLetter(!editingLetter)}
                  className="text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded flex items-center transition-colors"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  {editingLetter ? "Done" : "Edit"}
                </button>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg">
              {editingLetter ? (
                <textarea
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                  className="w-full h-64 p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="p-4 whitespace-pre-wrap text-gray-700">
                  {letterContent}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-semibold text-sm mb-1">
                Important Disclaimer
              </p>
              <p className="text-amber-900 text-sm">
                This is not legal advice. For further help, contact{" "}
                <a
                  href="https://www.citizensadvice.org.uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-700"
                >
                  Citizens Advice
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
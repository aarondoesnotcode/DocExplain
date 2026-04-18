"use client";

import { useState } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
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

      // Store results in sessionStorage and redirect
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            DocExplain
          </h1>
          <p className="text-gray-600 text-lg">
            Understand your UK official documents
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <FileText className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Upload Your Document
            </h2>
            <p className="text-gray-600 text-sm">
              We accept TfL fines, council letters, and eviction notices
            </p>
          </div>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer mb-4">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600 mb-1">
                {file ? file.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-gray-400 text-sm">
                JPG, PNG, or PDF (max 10MB)
              </p>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? "Processing..." : "Analyze Document"}
          </button>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 text-center mt-4">
            This is not legal advice. For further help, contact Citizens Advice.
          </p>
        </div>

        {/* Supported Document Types */}
        <div className="mt-6 bg-white/70 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">
            Supported Document Types:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• TfL fines and penalty notices</li>
            <li>• Council letters and notices</li>
            <li>• Eviction notices</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
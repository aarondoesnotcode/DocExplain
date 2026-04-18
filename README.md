# DocExplain
Global Hacktour Project @ UCL | @aarondoesnotcode @ajaysoll

## Overview
DocExplain helps users in the UK understand complex official documents (TfL fines, council letters, eviction notices, NHS letters) by providing plain English explanations, key points, deadlines, and actionable responses.

## Features
- **Document Upload**: Upload images (JPG, PNG) or PDF files
- **OCR Processing**: Extract text using Google Vision API or Tesseract
- **AI Analysis**: Get structured analysis using Google Gemini AI
- **Actionable Results**: Clear summaries, key points, deadlines, and recommended actions
- **Response Letter**: Generate professional response letters that can be edited
- **Mobile-Friendly**: Optimized for mobile users
- **No Login Required**: Simple and accessible

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Next.js API routes (Node.js)
- **OCR**: Google Vision API (primary) or Tesseract (fallback)
- **AI**: Google Gemini API

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Google Cloud API key with Vision API enabled
- Google AI API key with Gemini API enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd docexplain
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys:
```
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting API Keys

**Google Vision API:**
1. Go to Google Cloud Console
2. Create a project or select existing one
3. Enable Vision API
4. Create API credentials
5. Add the API key to your `.env.local`

**Gemini API:**
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a free API key
3. Add the API key to your `.env.local`

### Running the Application

Development mode:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Production build:
```bash
npm run build
npm start
```

## Usage

1. **Upload a Document**: Click the upload area or drag and drop a file (JPG, PNG, PDF)
2. **Wait for Processing**: The app will extract text and analyze the document
3. **View Results**: See the summary, key points, urgency level, and deadlines
4. **Take Action**: Review recommended actions and use the generated response letter
5. **Edit Response**: Customize the response letter as needed
6. **Copy or Download**: Easily copy the letter to clipboard or download as a text file

## Supported Document Types

- TfL fines and penalty notices
- Council letters and notices
- Eviction notices
- NHS letters

## Project Structure

```
docexplain/
├── app/
│   ├── api/
│   │   └── upload/
│   │       └── route.ts          # API endpoint for document processing
│   ├── globals.css               # Global styles and Tailwind directives
│   ├── layout.tsx                # Root layout component
│   ├── page.tsx                  # Upload page (homepage)
│   └── results/
│       └── page.tsx              # Results display page
├── lib/
│   └── utils.ts                  # Utility functions
├── types/
│   └── document.ts               # TypeScript type definitions
├── public/                       # Static assets
├── .env.local.example            # Environment variables template
├── CLAUDE.md                     # Project documentation for Claude Code
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies and scripts
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## API Response Format

The application returns structured JSON with the following format:

```json
{
  "summary": "Clear explanation of the document",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "urgency": "low | medium | high",
  "deadline": "Specific deadline or 'No deadline specified'",
  "actions": ["Action 1", "Action 2", "Action 3"],
  "recommended_action": "Most recommended action",
  "response_letter": "Professional response letter template"
}
```

## Important Notes

- **File Size Limit**: Maximum 10MB
- **Privacy**: Documents are processed and not stored
- **Legal Disclaimer**: The app includes a disclaimer that this is not legal advice
- **Performance**: Processing time depends on document complexity and file size

## Troubleshooting

**"Failed to extract text"**: Ensure the document is clear and readable. High-quality images work best.

**"Failed to analyze document"**: Check your API keys are correctly configured in `.env.local`.

**Slow processing**: Large files or complex documents may take longer. Tesseract (fallback) is slower than Google Vision API.

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Mobile-first responsive design
- Simple, clear language in UI

## Contributing

This is a hackathon project. Feel free to fork and improve!

## License

MIT

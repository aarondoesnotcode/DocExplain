# DocExplain
Global Hacktour Project @ UCL | @aarondoesnotcode @ajaysoll

## Overview
DocExplain helps people in the UK understand official documents by providing plain English explanations, key points, deadlines, and actionable responses. Works with any UK official document — TfL fines, council letters, eviction notices, NHS letters, HMRC notices, and more.

## Features
- **Document Upload**: Upload images (JPG, PNG) or PDF files
- **OCR Processing**: Multi-tier text extraction (Z.ai layout parsing, Google Vision, Tesseract fallback)
- **AI Analysis**: Structured analysis using Z.ai GLM models
- **Actionable Results**: Plain English summaries, key points, urgency, deadlines, timeline, and appeal info
- **Response Letter**: Generate editable professional response letters
- **Dark Mode**: Full light/dark mode support
- **Mobile-Friendly**: Optimised for mobile users
- **No Login Required**

## Tech Stack
- **Frontend**: Next.js 15 (App Router) + Tailwind CSS
- **Backend**: Next.js API routes (Node.js)
- **OCR**: Z.ai layout parsing (primary), Google Vision API (optional), Tesseract.js (fallback)
- **AI**: Z.ai API (`glm-5-turbo` for text, `glm-5v-turbo` for vision)

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Z.ai API key

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
ZAI_API_KEY=your_zai_api_key_here
ZAI_MODEL=glm-5-turbo
ZAI_VISION_MODEL=glm-5v-turbo
```

Optional — add Google Vision API for stronger image OCR:
```
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here
```

### Getting API Keys

**Z.ai API:**
1. Create or copy your Z.ai API key
2. Add it to `.env.local` as `ZAI_API_KEY`

**Google Vision API (optional):**
1. Go to Google Cloud Console
2. Create a project or select an existing one
3. Enable Vision API
4. Create API credentials
5. Add the API key to your `.env.local`

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
2. **Wait for Processing**: The app will extract text, analyse the document, and generate results (30–60 seconds)
3. **View Results**: See the summary, key points, urgency level, deadlines, timeline, and appeal information
4. **Take Action**: Review recommended actions and use the generated response letter
5. **Edit Response**: Customise the response letter as needed
6. **Copy or Download**: Copy the letter to clipboard or download as a text file

## Supported Document Types

Any UK official document, including:
- TfL fines and transport penalties
- Council letters and housing notices
- Eviction and court orders
- NHS and medical correspondence
- Tax and HMRC notices
- Immigration documents
- Legal notices
- Benefits and DWP letters

## Project Structure

```
docexplain/
├── app/
│   ├── api/
│   │   └── upload/
│   │       └── route.ts          # API endpoint for document processing
│   ├── globals.css               # Global styles, fonts, grain texture
│   ├── layout.tsx                # Root layout with dark mode script
│   ├── page.tsx                  # Upload page (homepage)
│   └── results/
│       └── page.tsx              # Results display page
├── components/
│   └── Navbar.tsx                # Shared navbar with dark mode toggle
├── lib/
│   ├── document-analysis.ts      # OCR + extraction + analysis pipeline
│   └── utils.ts                  # Utility functions
├── types/
│   └── document.ts               # TypeScript type definitions
├── public/                       # Static assets (profile photos, sample images)
├── .env.local.example            # Environment variables template
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind config with custom colour palette
└── tsconfig.json                 # TypeScript configuration
```

## API Response Format

```json
{
  "summary": "Plain English explanation of the document",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "urgency": "low | medium | high",
  "deadline": "Deadline date or 'No deadline specified'",
  "actions": ["Action 1", "Action 2", "Action 3"],
  "recommended_action": "Most recommended action",
  "response_letter": "Professional response letter template",
  "timeline": [
    { "label": "Event", "date": "Date", "description": "What happened" }
  ],
  "appeal_info": {
    "method": "How to appeal",
    "email": "contact@example.com",
    "website": "https://example.com",
    "phone": "0300 123 4567",
    "address": "Address if applicable"
  }
}
```

## Important Notes

- **File Size Limit**: Maximum 10MB
- **Privacy**: Documents are processed in real-time and never stored
- **Legal Disclaimer**: App includes a disclaimer that this is not legal advice — users are directed to Citizens Advice
- **Processing Time**: Typically 30–60 seconds depending on document complexity
- **Best Results**: Use a clear, well-lit photo or high-quality PDF for accurate text extraction

## Troubleshooting

**"Failed to extract text"**: Ensure the document image is clear and well-lit. High-quality images and PDFs work best.

**"Failed to analyze document"**: Check your `ZAI_API_KEY` is correctly set in `.env.local`.

**Slow processing**: Complex documents or large files take longer. If Google Vision API is not configured, Tesseract.js (local fallback) is slower.

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Code Style
- TypeScript throughout
- Mobile-first responsive design
- Warm earthy colour palette (terra, sage, bark, sand, cream)
- Serif headings (DM Serif Display), sans-serif body (Inter)

## Contributing

This is a hackathon project. Feel free to fork and improve!

## License

MIT
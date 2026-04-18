# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DocExplain is a web application that helps users in the UK understand complex official documents by providing plain English explanations, key points, deadlines, and actionable responses.

**Problem**: Many people struggle with official documents (TfL fines, council letters, eviction notices, NHS letters) written in complex language, leading to confusion and poor decisions.

**Solution**: Upload document → OCR extraction → AI analysis → Clear, actionable results

## Tech Stack

- **Frontend**: Next.js (App Router) + Tailwind CSS
- **Backend**: Next.js API routes (Node.js)
- **OCR**: Google Vision API (primary) or Tesseract (fallback)
- **AI**: Gemini API
- **No database** required for MVP

## Architecture

### Core Flow
1. User uploads document (image or PDF) via frontend
2. Frontend sends file to `/api/upload` endpoint
3. Backend extracts text using OCR (Google Vision API or Tesseract)
4. Backend sends extracted text to Gemini AI with structured prompt
5. AI returns JSON response with analysis
6. Frontend displays results in mobile-friendly UI

### AI Output Format (Required JSON Structure)
```json
{
  "summary": "string",
  "key_points": ["string"],
  "urgency": "low | medium | high",
  "deadline": "string",
  "actions": ["string"],
  "recommended_action": "string",
  "response_letter": "string"
}
```

## Scope and Constraints

### MVP Document Types (Only support 2-3 types)
- TfL fines
- Council letters  
- Eviction notices

### Key Requirements
- **No login required** for MVP
- **Fast response time** (optimize OCR and AI calls)
- **Simple language** throughout UI and explanations
- **Always include disclaimer**: "This is not legal advice. For further help, contact Citizens Advice."

### Frontend Pages
- Upload page (mobile-friendly file input)
- Results page (structured display with editable response letter)

### Backend API Routes
- `/api/upload` - handle file upload, OCR, AI processing
- Returns structured JSON matching the format above

## Development Commands

Since this is a new Next.js project, typical commands (once initialized):
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm test` - Run tests (if added)

## Important Design Decisions

1. **OCR Strategy**: Use Google Vision API as primary, Tesseract as fallback for offline/error scenarios
2. **AI Prompting**: Ensure Gemini always returns valid JSON - implement validation and retry logic
3. **Mobile-First**: Design UI for mobile users primarily, ensure readability and ease of use
4. **Error Handling**: Graceful degradation if OCR fails or AI returns invalid JSON
5. **No Database MVP**: State should be managed on frontend; backend is stateless

## Security Considerations

- Validate file types and sizes before processing
- Sanitize AI responses before displaying to prevent XSS
- Consider rate limiting for API routes
- Handle sensitive document information appropriately

## Development Approach

1. Start with core file upload and OCR functionality
2. Implement Gemini API integration with proper JSON parsing
3. Build simple mobile-friendly UI for upload/results
4. Add error handling and user feedback
5. Test with real UK documents from supported categories
6. Optimize performance (OCR caching, AI response optimization)

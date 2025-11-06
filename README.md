# AI FAQ Assistant

An intelligent FAQ assistant powered by AI, featuring semantic search, web crawling, and a chat widget interface. Built with Next.js, Supabase, and Cloudflare Workers.

## Features

- **AI-Powered Chat Widget**: Interactive chat interface for instant FAQ answers
- **Semantic Search**: Vector embeddings for accurate information retrieval
- **Web Crawling**: Automated page crawling and indexing
- **Supabase Backend**: PostgreSQL with pgvector for embeddings storage
- **Cloudflare Workers**: Serverless API endpoints for crawling and chat
- **TypeScript**: Full type safety across the stack

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL + pgvector)
- **Serverless**: Cloudflare Workers
- **AI**: OpenAI (GPT-4o-mini and text-embedding-3-small)

## Project Structure

```
ai-faq-assistant/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/         # Chat endpoint
│   │   └── crawl/        # Crawl endpoint
│   ├── auth/             # Authentication routes
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # React components
│   └── ChatWidget.tsx    # Chat widget component
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase client configurations
│   ├── embeddings.ts     # Embedding utilities
│   └── types.ts          # TypeScript type definitions
├── workers/               # Cloudflare Workers
│   ├── src/
│   │   ├── handlers/     # API handlers
│   │   │   ├── chat.ts   # Chat handler
│   │   │   └── crawl.ts  # Crawl handler
│   │   └── index.ts      # Worker entry point
│   ├── package.json
│   └── wrangler.toml     # Cloudflare configuration
└── supabase/
    └── schema.sql        # Database schema
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- Cloudflare account (for Workers)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ai-faq-assistant
npm install
cd workers && npm install && cd ..
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor
3. Enable the pgvector extension in your Supabase project
4. Get your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_WORKERS_API_URL=https://your-worker.workers.dev
```

### 4. Set Up Cloudflare Workers

1. Install Wrangler CLI globally (if not already installed):
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Configure worker secrets:
   ```bash
   cd workers
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_ANON_KEY
   wrangler secret put OPENAI_API_KEY
   ```

4. Update `workers/wrangler.toml` with your domain

5. Deploy the worker:
   ```bash
   npm run deploy
   ```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### Crawling Web Pages

To crawl and index a web page:

```bash
curl -X POST http://localhost:3000/api/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/faq",
    "selector": "main" # optional CSS selector
  }'
```

Or use the worker endpoint directly:

```bash
curl -X POST https://your-worker.workers.dev/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/faq"}'
```

### Using the Chat Widget

The chat widget is automatically included on the home page. Users can:
1. Click the chat button in the bottom-right corner
2. Type their question
3. Receive AI-generated answers based on your crawled content
4. View sources for the information provided

### Programmatic Chat API

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I reset my password?",
    "userId": "optional-user-id"
  }'
```

## Database Schema

The application uses the following main tables:

- **documents**: Stores crawled content with vector embeddings
- **conversations**: Tracks user conversations
- **messages**: Stores chat messages
- **crawl_jobs**: Monitors crawling tasks

See `supabase/schema.sql` for the complete schema.

## API Endpoints

### POST /api/crawl

Crawl and index a web page.

**Request Body:**
```json
{
  "url": "https://example.com/page",
  "maxPages": 10,
  "selector": ".content"
}
```

### POST /api/chat

Send a chat message and get an AI response.

**Request Body:**
```json
{
  "message": "Your question here",
  "conversationId": "optional-conversation-id",
  "userId": "optional-user-id"
}
```

## Deployment

### Deploy Next.js App

Deploy to Vercel:

```bash
npm install -g vercel
vercel
```

Or use your preferred hosting platform (Netlify, AWS, etc.)

### Deploy Cloudflare Workers

```bash
cd workers
npm run deploy
```

## Development Scripts

```bash
# Next.js development
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Cloudflare Workers
npm run workers:dev     # Start worker in dev mode
npm run workers:deploy  # Deploy worker to Cloudflare
```

## Customization

### Chat Widget

Customize the chat widget by modifying `components/ChatWidget.tsx`. Available props:

```tsx
<ChatWidget
  apiEndpoint="/api/chat"      // Custom API endpoint
  userId="user-123"             // User identifier
  position="bottom-right"       // Widget position
/>
```

### Embedding Model

To change the embedding model, update `lib/embeddings.ts` and adjust the vector dimensions in `supabase/schema.sql`.

### Chat Model

To use a different OpenAI model, modify the model parameter in `workers/src/handlers/chat.ts`.

## Security Considerations

1. **Row Level Security (RLS)**: Enabled on all Supabase tables
2. **API Keys**: Store in environment variables, never commit
3. **CORS**: Configure appropriately for production
4. **Rate Limiting**: Consider implementing rate limits on API endpoints

## Troubleshooting

### Common Issues

1. **pgvector not enabled**: Run `create extension vector;` in Supabase SQL Editor
2. **Worker deployment fails**: Ensure you're logged in with `wrangler login`
3. **Chat widget not loading**: Check NEXT_PUBLIC_WORKERS_API_URL is set correctly
4. **Embedding errors**: Verify OpenAI API key has access to embeddings API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions, please open an issue on GitHub.

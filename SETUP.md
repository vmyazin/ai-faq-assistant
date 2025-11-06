# Setup Guide

This guide will walk you through setting up the AI FAQ Assistant from scratch.

## Step 1: Supabase Setup

### Create Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - Name: `ai-faq-assistant`
   - Database Password: (save this securely)
   - Region: Choose closest to your users

### Enable pgvector

1. Go to the SQL Editor in your Supabase dashboard
2. Click "New Query"
3. Run:
   ```sql
   create extension if not exists vector;
   ```

### Run Schema

1. Copy the contents of `supabase/schema.sql`
2. Paste into a new SQL query in Supabase
3. Execute the query

### Get API Credentials

1. Go to Settings > API
2. Copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` `public` key

## Step 2: OpenAI Setup

1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys
3. Click "Create new secret key"
4. Copy the key (you won't see it again)
5. Ensure you have credits/billing set up

## Step 3: Cloudflare Workers Setup

### Create Cloudflare Account

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Go to Workers & Pages
3. Note your account ID and subdomain

### Install Wrangler

```bash
pnpm install -g wrangler
```

### Login to Cloudflare

```bash
wrangler login
```

This will open a browser for authentication.

### Configure Worker

1. Edit `workers/wrangler.toml`
2. Update the `zone_name` or remove the routes section if not using a custom domain
3. For development, you can use the default `*.workers.dev` subdomain

### Set Worker Secrets

```bash
cd workers

# Set Supabase URL
wrangler secret put SUPABASE_URL
# Paste your Supabase URL when prompted

# Set Supabase Anon Key
wrangler secret put SUPABASE_ANON_KEY
# Paste your Supabase anon key when prompted

# Set OpenAI API Key
wrangler secret put OPENAI_API_KEY
# Paste your OpenAI key when prompted
```

### Deploy Worker

```bash
pnpm run workers:deploy
```

Copy the deployed URL (e.g., `https://ai-faq-workers.your-subdomain.workers.dev`)

## Step 4: Next.js Configuration

### Create Environment File

```bash
cp .env.example .env.local
```

### Fill in Variables

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_WORKERS_API_URL=https://ai-faq-workers.your-subdomain.workers.dev
```

### Install Dependencies

```bash
pnpm install
```

## Step 5: Test Locally

### Start Development Server

```bash
pnpm run dev
```

### Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. You should see the FAQ Assistant home page
3. Click the chat widget in the bottom-right corner

### Index Your First Page

```bash
curl -X POST http://localhost:3000/api/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://en.wikipedia.org/wiki/Artificial_intelligence"
  }'
```

### Test the Chat

1. Open the chat widget
2. Ask a question related to the content you just crawled
3. You should receive an AI-generated response with sources

## Step 6: Production Deployment

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   pnpm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts to configure your project

4. Add environment variables in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.local`

### Deploy Worker to Production

```bash
pnpm run workers:deploy
```

### Update Production URLs

Update your `.env.local` (or Vercel environment variables) with the production worker URL.

## Troubleshooting

### "Extension vector does not exist"

Run this in Supabase SQL Editor:
```sql
create extension vector;
```

### Worker Deployment Fails

- Ensure you're logged in: `wrangler whoami`
- Check your account has Workers enabled
- Verify `wrangler.toml` is configured correctly

### Chat Widget Not Responding

1. Check browser console for errors
2. Verify `NEXT_PUBLIC_WORKERS_API_URL` is set
3. Test the worker endpoint directly:
   ```bash
   curl https://your-worker.workers.dev/api/chat \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"message": "test"}'
   ```

### Embeddings Not Working

1. Verify OpenAI API key is valid
2. Check you have credits in your OpenAI account
3. Ensure the key has access to embeddings API

## Next Steps

- Crawl your documentation/FAQ pages
- Customize the chat widget appearance
- Set up authentication for admin features
- Configure custom domain for your worker
- Add rate limiting and monitoring

## Support

If you encounter issues:
1. Check the main README.md for additional info
2. Review error messages in browser console and server logs
3. Open an issue on GitHub with details

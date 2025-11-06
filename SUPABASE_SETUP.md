# Supabase Database Setup

## Your Supabase Credentials ✅

- **Project URL**: https://owtiyhumefjdiurgbgdu.supabase.co
- **API Key**: Already configured in `.env.local`
- **Connection Status**: ✅ Connected

## Setting Up the Database

### Step 1: Access SQL Editor

1. Visit: https://owtiyhumefjdiurgbgdu.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Schema

Copy and paste the entire contents of `supabase/schema.sql` into the editor and click **Run**.

This will create:

#### Tables
- `documents` - Stores crawled content with vector embeddings
- `crawl_jobs` - Tracks crawling task status
- `conversations` - Stores user chat conversations
- `messages` - Stores individual chat messages

#### Extensions
- `pgvector` - Enables vector similarity search

#### Functions
- `match_documents()` - Performs semantic similarity search

#### Security
- Row Level Security (RLS) enabled on all tables
- Policies for authenticated and anonymous access

### Step 3: Verify Setup

After running the SQL, you can verify the setup by running:

```bash
pnpm run setup:supabase
```

This will check that all tables exist and are accessible.

## What to Do Next

Once the database is set up:

1. **Add OpenAI API Key** to `.env.local` (required for embeddings)
2. **Start the dev server**: `pnpm run dev`
3. **Visit the admin page**: http://localhost:3000/admin
4. **Crawl your first page** to populate the knowledge base
5. **Test the chat widget** on the home page

## Database Structure

### documents table
Stores FAQ content with AI embeddings for semantic search.

```sql
- id (uuid)
- content (text)
- title (text)
- url (text)
- embedding (vector 1536)
- metadata (jsonb)
- created_at, updated_at
```

### crawl_jobs table
Tracks the status of web crawling tasks.

```sql
- id (uuid)
- url (text)
- status (pending/processing/completed/failed)
- pages_crawled (int)
- error (text)
- metadata (jsonb)
- created_at, updated_at
```

### conversations table
Stores user chat conversations.

```sql
- id (uuid)
- user_id (uuid)
- metadata (jsonb)
- created_at, updated_at
```

### messages table
Stores individual chat messages within conversations.

```sql
- id (uuid)
- conversation_id (uuid)
- role (user/assistant/system)
- content (text)
- metadata (jsonb)
- created_at
```

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the full schema SQL
- Check that all tables were created successfully

### "extension vector does not exist"
- Run: `CREATE EXTENSION IF NOT EXISTS vector;`
- May require admin privileges in Supabase

### Connection errors
- Verify your API key in `.env.local`
- Check that your Supabase project is active
- Ensure you're using the anon/public key (not service role key)

## Need Help?

- Check Supabase docs: https://supabase.com/docs
- Review the schema file: `supabase/schema.sql`
- Run the verification script: `pnpm run setup:supabase`

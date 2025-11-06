-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store FAQ documents and their embeddings
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  embedding vector(1536),
  url text,
  title text,
  -- Add indexes for better performance
  constraint documents_pkey primary key (id)
);

-- Create an index on the embedding column for faster similarity searches
create index if not exists documents_embedding_idx on documents
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Create a function to search for similar documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  url text,
  title text,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    documents.metadata,
    documents.url,
    documents.title,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;

-- Create a table to store crawl jobs
create table if not exists crawl_jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  url text not null,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  error text,
  pages_crawled int default 0,
  metadata jsonb default '{}'::jsonb
);

-- Create a table to store chat conversations
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  metadata jsonb default '{}'::jsonb
);

-- Create a table to store chat messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb default '{}'::jsonb
);

-- Create indexes for better query performance
create index if not exists crawl_jobs_status_idx on crawl_jobs(status);
create index if not exists messages_conversation_id_idx on messages(conversation_id);
create index if not exists conversations_user_id_idx on conversations(user_id);

-- Enable Row Level Security
alter table documents enable row level security;
alter table crawl_jobs enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- Create policies for documents (public read, authenticated write)
create policy "Documents are viewable by everyone"
  on documents for select
  using (true);

create policy "Documents are insertable by authenticated users"
  on documents for insert
  with check (auth.role() = 'authenticated');

create policy "Documents are updatable by authenticated users"
  on documents for update
  using (auth.role() = 'authenticated');

-- Create policies for crawl_jobs (authenticated users only)
create policy "Crawl jobs are viewable by authenticated users"
  on crawl_jobs for select
  using (auth.role() = 'authenticated');

create policy "Crawl jobs are insertable by authenticated users"
  on crawl_jobs for insert
  with check (auth.role() = 'authenticated');

create policy "Crawl jobs are updatable by authenticated users"
  on crawl_jobs for update
  using (auth.role() = 'authenticated');

-- Create policies for conversations (users can only see their own)
create policy "Users can view their own conversations"
  on conversations for select
  using (auth.uid() = user_id);

create policy "Users can create their own conversations"
  on conversations for insert
  with check (auth.uid() = user_id);

-- Create policies for messages (based on conversation ownership)
create policy "Users can view messages from their conversations"
  on messages for select
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can insert messages to their conversations"
  on messages for insert
  with check (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

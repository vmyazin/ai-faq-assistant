import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 1536,
  });

  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
    dimensions: 1536,
  });

  return response.data.map((item) => item.embedding);
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  url: string | null;
  title: string | null;
  similarity: number;
}

export async function searchSimilarDocuments(
  supabase: any,
  query: string,
  matchThreshold: number = 0.5,
  matchCount: number = 5
): Promise<SearchResult[]> {
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Search for similar documents using the Supabase function
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) {
    throw new Error(`Error searching documents: ${error.message}`);
  }

  return data as SearchResult[];
}

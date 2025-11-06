import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import type { Env } from '../index';

interface ChatRequest {
  message: string;
  conversationId?: string;
  userId?: string;
}

export async function handleChat(request: Request, env: Env) {
  if (request.method !== 'POST') {
    return {
      status: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body: ChatRequest = await request.json();
    const { message, conversationId, userId } = body;

    if (!message) {
      return {
        status: 400,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // Initialize clients
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    // Generate embedding for the user's message
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
      dimensions: 1536,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search for similar documents
    const { data: similarDocs, error: searchError } = await supabase.rpc(
      'match_documents',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 5,
      }
    );

    if (searchError) {
      throw new Error(`Failed to search documents: ${searchError.message}`);
    }

    // Build context from similar documents
    const context = similarDocs
      .map((doc: any) => {
        return `Title: ${doc.title}\nURL: ${doc.url}\nContent: ${doc.content.substring(0, 500)}...`;
      })
      .join('\n\n---\n\n');

    // Create system prompt with context
    const systemPrompt = `You are a helpful FAQ assistant. Use the following context from the knowledge base to answer the user's question. If the context doesn't contain relevant information, say so politely and try to be helpful anyway.

Context:
${context}

Instructions:
- Answer based on the provided context when possible
- Be concise and helpful
- If you reference information, mention which document it came from
- If the context doesn't contain the answer, acknowledge this and provide general guidance if appropriate`;

    // Get chat completion from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = completion.choices[0].message.content || 'I apologize, but I could not generate a response.';

    // If userId is provided, save the conversation
    if (userId) {
      let currentConversationId = conversationId;

      // Create new conversation if needed
      if (!currentConversationId) {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({ user_id: userId })
          .select()
          .single();

        if (!convError && newConversation) {
          currentConversationId = newConversation.id;
        }
      }

      // Save messages
      if (currentConversationId) {
        await supabase.from('messages').insert([
          {
            conversation_id: currentConversationId,
            role: 'user',
            content: message,
          },
          {
            conversation_id: currentConversationId,
            role: 'assistant',
            content: assistantMessage,
          },
        ]);
      }

      return {
        status: 200,
        body: JSON.stringify({
          message: assistantMessage,
          conversationId: currentConversationId,
          sources: similarDocs.map((doc: any) => ({
            title: doc.title,
            url: doc.url,
            similarity: doc.similarity,
          })),
        }),
      };
    }

    // Return response without saving conversation
    return {
      status: 200,
      body: JSON.stringify({
        message: assistantMessage,
        sources: similarDocs.map((doc: any) => ({
          title: doc.title,
          url: doc.url,
          similarity: doc.similarity,
        })),
      }),
    };
  } catch (error) {
    return {
      status: 500,
      body: JSON.stringify({
        error: 'Failed to process chat request',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

import { createClient } from '@supabase/supabase-js';
import { load } from 'cheerio';
import OpenAI from 'openai';
import type { Env } from '../index';

interface CrawlRequest {
  url: string;
  maxPages?: number;
  selector?: string;
}

export async function handleCrawl(request: Request, env: Env) {
  if (request.method !== 'POST') {
    return {
      status: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body: CrawlRequest = await request.json();
    const { url, maxPages = 10, selector } = body;

    if (!url) {
      return {
        status: 400,
        body: JSON.stringify({ error: 'URL is required' }),
      };
    }

    // Initialize clients
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    // Create a crawl job
    const { data: job, error: jobError } = await supabase
      .from('crawl_jobs')
      .insert({
        url,
        status: 'processing',
        metadata: { maxPages, selector },
      })
      .select()
      .single();

    if (jobError) {
      throw new Error(`Failed to create crawl job: ${jobError.message}`);
    }

    // Fetch and parse the page
    const response = await fetch(url);
    if (!response.ok) {
      await supabase
        .from('crawl_jobs')
        .update({
          status: 'failed',
          error: `Failed to fetch URL: ${response.statusText}`,
        })
        .eq('id', job.id);

      return {
        status: 400,
        body: JSON.stringify({ error: 'Failed to fetch URL' }),
      };
    }

    const html = await response.text();
    const $ = load(html);

    // Extract content
    let content: string;
    if (selector) {
      content = $(selector).text().trim();
    } else {
      // Remove script and style tags
      $('script, style, nav, footer, header').remove();
      content = $('body').text().trim();
    }

    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim();

    if (!content) {
      await supabase
        .from('crawl_jobs')
        .update({
          status: 'failed',
          error: 'No content extracted from page',
        })
        .eq('id', job.id);

      return {
        status: 400,
        body: JSON.stringify({ error: 'No content found' }),
      };
    }

    // Extract title
    const title = $('title').text() || url;

    // Generate embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content.substring(0, 8000), // Limit content size
      dimensions: 1536,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Store document with embedding
    const { error: docError } = await supabase.from('documents').insert({
      content,
      url,
      title,
      embedding,
      metadata: {
        crawled_at: new Date().toISOString(),
        content_length: content.length,
      },
    });

    if (docError) {
      await supabase
        .from('crawl_jobs')
        .update({
          status: 'failed',
          error: `Failed to store document: ${docError.message}`,
        })
        .eq('id', job.id);

      throw new Error(`Failed to store document: ${docError.message}`);
    }

    // Update job status
    await supabase
      .from('crawl_jobs')
      .update({
        status: 'completed',
        pages_crawled: 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    return {
      status: 200,
      body: JSON.stringify({
        success: true,
        jobId: job.id,
        pagesCrawled: 1,
        message: 'Page crawled successfully',
      }),
    };
  } catch (error) {
    return {
      status: 500,
      body: JSON.stringify({
        error: 'Failed to crawl page',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

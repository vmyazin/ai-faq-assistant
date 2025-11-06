import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // If using Cloudflare Workers, proxy to the worker
    const workersUrl = process.env.NEXT_PUBLIC_WORKERS_API_URL;

    if (workersUrl) {
      const response = await fetch(`${workersUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    // Fallback: return error if worker URL is not configured
    return NextResponse.json(
      { error: 'Workers API URL not configured' },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to process chat request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

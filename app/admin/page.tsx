'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [url, setUrl] = useState('');
  const [selector, setSelector] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCrawl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          selector: selector.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to crawl page');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mb-8">
            Crawl and index web pages to build your FAQ knowledge base.
          </p>

          <div className="space-y-6">
            {/* URL Input */}
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Page URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/faq"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                disabled={isLoading}
              />
            </div>

            {/* Selector Input */}
            <div>
              <label
                htmlFor="selector"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                CSS Selector (Optional)
              </label>
              <input
                type="text"
                id="selector"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                placeholder="main, .content, #faq-section"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Specify a CSS selector to extract specific content from the page.
              </p>
            </div>

            {/* Crawl Button */}
            <button
              onClick={handleCrawl}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading ? 'Crawling...' : 'Crawl Page'}
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {/* Success Result */}
            {result && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <p className="font-semibold mb-2">Success!</p>
                <p>{result.message}</p>
                {result.jobId && (
                  <p className="text-sm mt-1">Job ID: {result.jobId}</p>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-900">
              How to Use
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">1.</span>
                <span>Enter the URL of the page you want to crawl and index</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">2.</span>
                <span>
                  (Optional) Specify a CSS selector to extract only specific
                  content
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">3.</span>
                <span>
                  Click &ldquo;Crawl Page&rdquo; to index the content with AI embeddings
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">4.</span>
                <span>
                  The content will be available for semantic search in the chat
                  widget
                </span>
              </li>
            </ul>
          </div>

          {/* Examples */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Example Selectors:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><code className="bg-blue-100 px-2 py-1 rounded">main</code> - Main content area</li>
              <li><code className="bg-blue-100 px-2 py-1 rounded">.content</code> - Elements with &ldquo;content&rdquo; class</li>
              <li><code className="bg-blue-100 px-2 py-1 rounded">#faq</code> - Element with &ldquo;faq&rdquo; ID</li>
              <li><code className="bg-blue-100 px-2 py-1 rounded">article</code> - Article elements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

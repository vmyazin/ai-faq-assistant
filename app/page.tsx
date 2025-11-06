import ChatWidget from '@/components/ChatWidget';

export default function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
          <h1 className="text-4xl font-bold mb-8">AI FAQ Assistant</h1>
          <p className="text-lg mb-4">
            Welcome to the AI-powered FAQ assistant. This application helps you find answers to frequently asked questions using AI.
          </p>
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold">Features</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>AI-powered chat widget for instant FAQ answers</li>
              <li>Semantic search across your knowledge base</li>
              <li>Web page crawling and indexing</li>
              <li>Vector embeddings for accurate information retrieval</li>
            </ul>
          </div>
        </div>
      </main>
      <ChatWidget />
    </>
  );
}

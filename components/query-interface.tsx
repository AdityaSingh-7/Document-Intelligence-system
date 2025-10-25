'use client';

import { useState } from 'react';
import { Search, Loader2, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { queryDocuments } from '@/lib/api';
import { QueryResult } from '@/lib/supabase';
import { toast } from 'sonner';

export function QueryInterface() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<QueryResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }

    setIsSearching(true);

    try {
      const data = await queryDocuments(query);
      setResults(data);

      if (data.resultsCount === 0) {
        toast.info('No relevant information found');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search documents');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Ask a Question</h2>
            <p className="text-sm text-gray-600">
              Search across all your documents using natural language
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <Input
            placeholder="e.g., What are the key findings in the Q4 report?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSearching}
            className="flex-1"
          />
          <Button type="submit" disabled={isSearching}>
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </form>
      </Card>

      {results && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Answer</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {results.summary}
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Found {results.resultsCount} relevant sections
              </span>
              <Badge variant="outline">{results.chunks.length} sources</Badge>
            </div>
          </Card>

          {results.chunks.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Relevant Sources</h3>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {results.chunks.map((chunk, index) => (
                    <div
                      key={chunk.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-sm">
                            {chunk.document_title}
                          </span>
                        </div>
                        {chunk.similarity && (
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(chunk.similarity * 100)}% match
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {chunk.content}
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        Section {chunk.chunk_index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>
      )}

      {!results && (
        <Card className="p-12">
          <div className="text-center text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium mb-2">No search results yet</p>
            <p className="text-sm">
              Enter a question above to search your documents
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

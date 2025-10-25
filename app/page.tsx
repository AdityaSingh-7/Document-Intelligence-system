'use client';

import { useState } from 'react';
import { DocumentUpload } from '@/components/document-upload';
import { DocumentList } from '@/components/document-list';
import { QueryInterface } from '@/components/query-interface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Search, Brain } from 'lucide-react';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Document Intelligence Assistant
            </h1>
          </div>
          <p className="text-gray-600 ml-14">
            Upload documents and ask questions using AI-powered semantic search
          </p>
        </div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <QueryInterface />
          </TabsContent>

          <TabsContent value="upload">
            <DocumentUpload onUploadComplete={handleUploadComplete} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentList key={refreshKey} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

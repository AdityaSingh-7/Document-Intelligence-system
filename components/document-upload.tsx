'use client';

import { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { processDocument, generateEmbeddings } from '@/lib/api';
import { toast } from 'sonner';

interface DocumentUploadProps {
  onUploadComplete: () => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFiles(files);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      if (!file.type.includes('pdf') && !file.type.includes('text')) {
        toast.error(`${file.name} is not a supported file type`);
        continue;
      }

      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(`Uploading ${file.name}...`);

    try {
      const text = await extractText(file);

      const { data: document, error: insertError } = await supabase
        .from('documents')
        .insert({
          title: file.name,
          file_path: `/uploads/${file.name}`,
          file_type: file.type,
          file_size: file.size,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError || !document) {
        throw new Error('Failed to create document record');
      }

      setUploadProgress('Processing document...');
      await processDocument(document.id, text);

      setUploadProgress('Generating embeddings...');
      const { data: chunks } = await supabase
        .from('document_chunks')
        .select('id, document_id, chunk_index, content')
        .eq('document_id', document.id);

      if (chunks && chunks.length > 0) {
        const chunkData = chunks.map((chunk) => ({
          documentId: chunk.document_id,
          chunkIndex: chunk.chunk_index,
          content: chunk.content,
        }));

        await generateEmbeddings(chunkData);
      }

      toast.success(`${file.name} processed successfully!`);
      onUploadComplete();
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(`Failed to process ${file.name}`);
    } finally {
      setIsProcessing(false);
      setUploadProgress('');
    }
  };

  const extractText = async (file: File): Promise<string> => {
    if (file.type.includes('text')) {
      return await file.text();
    }

    if (file.type.includes('pdf')) {
      return `[PDF content from ${file.name}]\n\nThis is a sample document for demonstration. In production, you would use a PDF parsing library like pdf-parse or pdfjs-dist to extract actual text content from PDF files.`;
    }

    return '';
  };

  return (
    <Card className="p-8">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-all
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : 'hover:border-gray-400'}
        `}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-lg font-medium">{uploadProgress}</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Documents</h3>
            <p className="text-gray-600 mb-6">
              Drag and drop your files here, or click to browse
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept=".pdf,.txt"
              onChange={handleFileInput}
              disabled={isProcessing}
            />
            <label htmlFor="file-upload">
              <Button asChild disabled={isProcessing}>
                <span className="cursor-pointer">
                  <FileText className="w-4 h-4 mr-2" />
                  Select Files
                </span>
              </Button>
            </label>
            <p className="text-sm text-gray-500 mt-4">
              Supported formats: PDF, TXT
            </p>
          </>
        )}
      </div>
    </Card>
  );
}

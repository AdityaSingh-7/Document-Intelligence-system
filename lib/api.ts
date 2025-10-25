const EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/document-processor`;

export async function processDocument(documentId: string, text: string) {
  const response = await fetch(`${EDGE_FUNCTION_URL}/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ documentId, text }),
  });

  if (!response.ok) {
    throw new Error('Failed to process document');
  }

  return response.json();
}

export async function generateEmbeddings(chunks: Array<{
  documentId: string;
  chunkIndex: number;
  content: string;
}>) {
  const response = await fetch(`${EDGE_FUNCTION_URL}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ chunks }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate embeddings');
  }

  return response.json();
}

export async function queryDocuments(query: string) {
  const response = await fetch(`${EDGE_FUNCTION_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error('Failed to query documents');
  }

  return response.json();
}

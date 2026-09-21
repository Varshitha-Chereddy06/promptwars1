import pdfParse from 'pdf-parse';

export async function parseDocumentFile(fileBuffer: Buffer, fileName: string): Promise<string> {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') {
    try {
      const data = await pdfParse(fileBuffer);
      return data.text || fileBuffer.toString('utf-8');
    } catch (err) {
      console.warn('PDF parsing fallback to text string', err);
      return fileBuffer.toString('utf-8');
    }
  }

  // TXT, MD, DOCX (simple text extraction)
  return fileBuffer.toString('utf-8');
}

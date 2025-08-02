// api/quotes.js
import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(req, res) {
  try {
    // Determine the path to the JSON file.
    // The working directory for Vercel serverless functions is the project root.
    const jsonDirectory = path.join(process.cwd(), 'src', 'data');
    const filePath = path.join(jsonDirectory, 'quotes.json');

    // Read the JSON file
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    // Set CORS headers to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS pre-flight request for CORS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Return the quotes data
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load quote data' });
  }
}

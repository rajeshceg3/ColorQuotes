// api/gradients.js
import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(req, res) {
  try {
    const jsonDirectory = path.join(process.cwd(), 'src', 'data');
    const filePath = path.join(jsonDirectory, 'gradients.json');

    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load gradient data' });
  }
}

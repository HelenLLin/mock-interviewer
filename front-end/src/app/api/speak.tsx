import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Missing text' });
  }

  try {
    const elevenResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/lxYfHSkYm1EzQzGhdbfc', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8,
        },
      }),
    });

    const audioBuffer = await elevenResponse.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Error fetching from ElevenLabs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
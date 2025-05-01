'use client'

import React, { useState, useCallback } from 'react'
import { SpeechToText } from './speechToText'
import TextToSpeech from './textToSpeech'
import styles from './styles/speechToText.module.css'
import { buildInterviewPrompt } from '@/lib/llm_prompt'

interface InterviewerProps {
  problem: string
  currentCode: string
}

export function Interviewer({
  problem,
  currentCode
}: InterviewerProps) {
  const [reply, setReply] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranscription = useCallback(
    async (transcript: string) => {
      if (!transcript) return;

      setIsGenerating(true);
      setError(null);
      setReply('');

      try {
        const prompt = buildInterviewPrompt(problem, currentCode, transcript);

        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Failed to parse error response' }));
          throw new Error(errorData.error || `API request failed: ${res.statusText}`);
        }

        const { reply: generatedReply } = (await res.json()) as { reply: string };

        if (!generatedReply) {
            throw new Error("Received empty reply from assistant.");
        }

        setReply(generatedReply);

      } catch (err) {
        console.error("Failed to get reply:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        setReply('');
      } finally {
        setIsGenerating(false);
      }
    },
    [problem, currentCode]
  );

  return (
    <div className={styles.container}>
      <h4>Help</h4>

      <SpeechToText onTranscription={handleTranscription} disabled={isGenerating} />

      {isGenerating && <p>Assistant is thinking...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {reply && !isGenerating && !error && (
        <div className={styles.transcript}>
          <h3>Interviewer Reply:</h3>
          <TextToSpeech text={reply} />
        </div>
      )}
    </div>
  );
}
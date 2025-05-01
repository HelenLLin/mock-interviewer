'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './styles/textToSpeech.module.css';

interface TextToSpeechProps {
  text: string;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedForText, setGeneratedForText] = useState<string | null>(null);

  useEffect(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    if (audioRef.current) {
      audioRef.current.src = '';
    }
    setGeneratedForText(null);

    if (!text) {
      setError(null);
      setIsLoading(false);
      return;
    }

    if (text === generatedForText) {
        return;
    }

    let cancelled = false;
    setError(null);
    setIsLoading(true);

    async function fetchAudio() {
      try {
        const response = await fetch('/api/textToSpeech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch audio: ${response.status} ${errorText || response.statusText}`);
        }

        const audioBlob = await response.blob();
        if (cancelled) return;

        const newAudioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(newAudioUrl);
        setGeneratedForText(text);
        if (audioRef.current) {
           audioRef.current.src = newAudioUrl;
        }

      } catch (err) {
        console.error('TTS fetch error:', err);
        if (!cancelled) {
            setError(err instanceof Error ? err.message : 'Text-to-speech failed. Please try again.');
            setAudioUrl(null);
            setGeneratedForText(null);
        }
      } finally {
        if (!cancelled) {
            setIsLoading(false);
        }
      }
    }

    fetchAudio();

    return () => {
      cancelled = true;
      setIsLoading(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [text]);

  useEffect(() => {
      return () => {
          if (audioUrl) {
              URL.revokeObjectURL(audioUrl);
          }
      }
  }, [audioUrl]);


  const handlePlay = useCallback(() => {
    if (audioRef.current && audioRef.current.src && !isLoading) {
        audioRef.current.play().catch(err => {
            console.error("Audio play error:", err);
            setError("Could not play audio.");
        });
    }
  }, [isLoading]);

  return (
    <div className={styles.container}>
      <audio ref={audioRef} hidden />
      <button
        onClick={handlePlay}
        disabled={isLoading || !audioUrl || !!error}
        className={styles.playButton}
      >
        {isLoading ? 'Loading...' : 'Play Reply'}
      </button>
      {error && <p className={`${styles.error} text-red-500 text-sm`}>{error}</p>}
    </div>
  );
};

export default TextToSpeech;
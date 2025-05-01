'use client'

import React, { useState, useRef } from 'react';
import styles from './styles/speechToText.module.css';

import TextToSpeech from "./textToSpeech"

export interface ConversationProps {
  onTranscription?: (text: string) => void;
  className?: string;
}

export const SpeechToText: React.FC<ConversationProps> = ({ 
  onTranscription
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const audioChunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = handleAudioStop;

      mediaRecorder.start();
      setIsRecording(true);
      setStatus('recording');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('processing');
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleAudioStop = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

      if (audioRef.current) {
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
      }

      await processAudio(audioBlob);
    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Failed to process audio. Please try again.');
      setStatus('idle');
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/speechToText', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      if (data.text) {
        setTranscribedText(data.text);
        if (onTranscription) {
          onTranscription(data.text);
        }
      }
    } catch (err) {
      console.error('Speech to text error:', err);
      setError('Speech recognition failed. Please try again.');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className={styles.container}>
      <div className="flex gap-2">
        <button
          className={styles.convo_button}
          onClick={startRecording}
          disabled={isRecording || status === 'processing'}
        >
          Start
        </button>
        <button
          className={styles.convo_button}
          onClick={stopRecording}
          disabled={!isRecording || status === 'processing'}
        >
          Stop
        </button>
      </div>

      <div className={styles.convo_status}>
        <p>Status: {status}</p>
        {status === 'processing' && <p>Processing...</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>

      {transcribedText && (
        <div className={styles.transcript}>
          <h3>Transcribed Text:</h3>
          <p>{transcribedText}</p>
          <TextToSpeech text={transcribedText} />
        </div>
      )}
  
    </div>
  );
};

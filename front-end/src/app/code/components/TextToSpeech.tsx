'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import styles from './textToSpeech.module.css'

interface TextToSpeechProps {
  text: string;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [ttsError, setTtsError] = useState<string | null>(null)
  const [generatedForText, setGeneratedForText] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const currentAudioRef = audioRef.current;

    if (!text) {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
      if (currentAudioRef) currentAudioRef.src = ''
      setGeneratedForText(null)
      setTtsError(null)
      setIsLoading(false)
      return
    }

    if (text === generatedForText && audioUrl) {
      if (currentAudioRef && !currentAudioRef.src) {
        currentAudioRef.src = audioUrl
      }
      setIsLoading(false)
      return
    }

    if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
    }
    if (currentAudioRef) {
        currentAudioRef.pause()
        currentAudioRef.src = ''
    }

    setAudioUrl(null)
    setGeneratedForText(null)
    setTtsError(null)
    setIsLoading(true)

    async function fetchAudio() {
      try {
        const response = await fetch('/api/textToSpeech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`TTS API Failed: ${response.status} ${errorText || response.statusText}`)
        }

        const audioBlob = await response.blob()
        if (cancelled) {
          URL.revokeObjectURL(URL.createObjectURL(audioBlob));
          return
        }

        const newAudioUrl = URL.createObjectURL(audioBlob)
        setAudioUrl(newAudioUrl)
        setGeneratedForText(text)
        if (currentAudioRef) {
          currentAudioRef.src = newAudioUrl
        }
      } catch (err) {
        console.error('TTS fetch error:', err)
        if (!cancelled) {
          setTtsError(err instanceof Error ? err.message : 'Text-to-speech failed.')
          setAudioUrl(null)
          setGeneratedForText(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchAudio()

    return () => {
      cancelled = true
      if (currentAudioRef) {
        currentAudioRef.pause()
      }
      setIsLoading(false);
    }
  }, [text, audioUrl, generatedForText])

  useEffect(() => {
    const currentAudioUrl = audioUrl;
    return () => {
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl)
      }
    }
  }, [audioUrl])


  const handlePlay = useCallback(() => {
    if (audioRef.current && audioRef.current.src && !isLoading && !ttsError) {
      audioRef.current.play().catch(err => {
        console.error("Audio play error:", err)
        setTtsError("Could not play audio. Try again.")
      })
    }
  }, [isLoading, ttsError])

  return (
    <div className={styles.container}>
      <audio ref={audioRef} hidden />
      <button
        onClick={handlePlay}
        disabled={isLoading || !audioUrl || !!ttsError}
        className={styles.playButton}
      >
        {isLoading ? 'Loading Audio...' : 'Play Reply'}
      </button>
      {ttsError && <p className={`${styles.error} text-red-500 text-sm`}>{ttsError}</p>}
    </div>
  )
}

export default TextToSpeech

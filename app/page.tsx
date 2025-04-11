'use client';

import { useState } from 'react';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';

export default function HomePage() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrlResult, setShortUrlResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGenerateClick = async () => {
    if (!longUrl) {
      setShortUrlResult('Please enter a URL first.');
      return;
    }

    setIsLoading(true);
    setShortUrlResult(null);
    setCopySuccess(false);

    try {
      const response = await fetch('https://itsurl.com/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl: longUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to shorten URL. Please try again.');
      }

      const data = await response.json();
      setShortUrlResult(`itsurl.com/${data.shortUrl}`);
    } catch (error) {
      setShortUrlResult((error as Error).message || 'An error occurred while shortening the URL.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyClick = () => {
    if (shortUrlResult) {
      navigator.clipboard.writeText(shortUrlResult);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <HeroSection />
      <h2 className="text-3xl font-bold text-center mt-10">Shorten Your URL</h2>
      <Footer />
    </main>
  );
}

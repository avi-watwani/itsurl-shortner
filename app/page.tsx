'use client'; // Required for using hooks like useState

import { useState, useEffect } from 'react';
import { FiCopy } from 'react-icons/fi'; // Import the copy icon from React Icons
import HeroSection from './components/HeroSection'; // Import the HeroSection component

export default function HomePage() {
  // State to hold the long URL entered by the user
  const [longUrl, setLongUrl] = useState<string | null>('');
  // State to hold the generated short URL (or error messages)
  const [shortUrlResult, setShortUrlResult] = useState<string | null>(null);
  const [longUrlCached, setLongUrlCached] = useState('');
  // State to manage loading status during API call
  const [isLoading, setIsLoading] = useState(false);
  // State to show a copy success message
  const [copyMessageforShortUrlResult, setCopyMessageforShortUrlResult] = useState<string | null>(null);
  const [copyMessageforLongUrlCached, setCopyMessageforLongUrlCached] = useState<string | null>(null);

  const handleGenerateClick = async () => {
    if (!longUrl) {
      setShortUrlResult('Please enter a URL first.');
      return;
    }

    setIsLoading(true);
    setShortUrlResult(null);

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
      setShortUrlResult(data.shortUrl); // Directly store the shortened URL
      setLongUrlCached(longUrl); // Store the original URL for display
      setLongUrl(''); // Clear the input field
    } catch (error) {
      setShortUrlResult((error as Error).message || 'An error occurred while shortening the URL.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyShortUrlResultToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyMessageforShortUrlResult('Copied to clipboard!');
      setTimeout(() => setCopyMessageforShortUrlResult(null), 3000); // Clear message after 3 seconds
    });
  };

  const copyLongUrlCachedToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyMessageforLongUrlCached('Copied to clipboard!');
      setTimeout(() => setCopyMessageforLongUrlCached(null), 3000); // Clear message after 3 seconds
    });
  };

  useEffect(() => {
    if (shortUrlResult) {
      const resultSection = document.getElementById('result-section');
      if (resultSection) {
        resultSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [shortUrlResult]);

  return (
    <main className="mx-auto">
      <HeroSection /> {/* Add the HeroSection component here */}
      <div id="shorten-form" className="border border-gray-300 rounded-md p-16 w-[70%] mx-auto mt-12">
        <h1 className="text-2xl font-bold mb-8">Shorten Your URL</h1>
        <form className="space-y-4">
          <div>
            <label htmlFor="longUrl" className="block text-mb font-medium text-gray-900 mb-1">
              Enter a long URL
            </label>
            <input
              type="url"
              id="longUrl"
              value={longUrl || ''}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com/very/long/url/that/needs/shortening"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleGenerateClick}
            disabled={isLoading}
            className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
          >
            {isLoading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>
        <div id="result-section">
          {shortUrlResult && (
            <div className="mt-4 p-4 bg-green-100 rounded-md">
              <p className="text-green-700 font-bold">Your shortened URL is ready!</p>
              <div className="flex items-center mt-2">
                <div className="flex items-center space-x-2">
                  <a
                    href={shortUrlResult}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {shortUrlResult}
                  </a>
                  <button
                    onClick={() => copyShortUrlResultToClipboard(shortUrlResult)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiCopy size={16} /> {/* Use the standard copy icon */}
                  </button>
                </div>
              </div>
            </div>
          )}
          {copyMessageforShortUrlResult && (
            <p className="mt-2 text-sm text-green-600">{copyMessageforShortUrlResult}</p>
          )}
          {longUrlCached && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <p className="text-gray-600 font-bold">Original URL</p>
              <div className="flex items-center mt-2">
                <div className="flex items-center space-x-2">
                  <a
                    href={longUrlCached}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {longUrlCached}
                  </a>
                  <button
                    onClick={() => copyLongUrlCachedToClipboard(longUrlCached)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiCopy size={16} /> {/* Use the standard copy icon */}
                  </button>
                </div>
              </div>
            </div>
          )}
          {copyMessageforLongUrlCached && (
            <p className="mt-2 text-sm text-green-600">{copyMessageforLongUrlCached}</p>
          )}
        </div>
      </div>
      <footer className="mt-12 bg-gray-800 text-white py-4 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} itsURL Pvt. Ltd. All rights reserved.
        </p>
      </footer>
    </main>
  );
}

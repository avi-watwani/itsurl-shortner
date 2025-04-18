'use client'; // Required for using hooks like useState

import { useState, useEffect } from 'react';
import { FiCopy } from 'react-icons/fi'; // Import the copy icon from React Icons
import HeroSection from './components/HeroSection'; // Import the HeroSection component
import UrlShortenerInfo from './components/UrlShortenerInfo'; // Import the new component

export default function HomePage() {
  // State to hold the long URL entered by the user
  const [longUrl, setLongUrl] = useState<string | null>('');
  const [customShortCode, setCustomShortCode] = useState<string | null>('');
  // State to hold the generated short URL (or error messages)
  const [shortUrlResult, setShortUrlResult] = useState<string | null>(null);
  const [longUrlCached, setLongUrlCached] = useState('');
  // State to manage loading status during API call
  const [isLoading, setIsLoading] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // State to show a copy success message
  const [copyMessageforShortUrlResult, setCopyMessageforShortUrlResult] = useState<string | null>(null);
  const [copyMessageforLongUrlCached, setCopyMessageforLongUrlCached] = useState<string | null>(null);

  const handleGenerateClick = async () => {
    if (!longUrl) {
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
        body: JSON.stringify({ originalUrl: longUrl, customShortCode: customShortCode }),
      });

      if (!response.ok) {
        throw new Error('Failed to shorten URL. Please try again.');
      }

      const data = await response.json();
      setShortUrlResult(data.shortUrl); // Directly store the shortened URL
      setLongUrlCached(longUrl); // Store the original URL for display

      setLongUrl(''); // Clear the input field
      setCustomShortCode(''); // Clear the input field
    } catch (error) {
      setErrorMessage('An error occurred while shortening the URL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, setMessage: (message: string | null) => void) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setMessage('Copied to clipboard!');
        setTimeout(() => setMessage(null), 3000); // Clear message after 3 seconds
      }).catch(() => {
        fallbackCopyToClipboard(text, setMessage);
      });
    } else {
      fallbackCopyToClipboard(text, setMessage);
    }
  };

  const fallbackCopyToClipboard = (text: string, setMessage: (message: string | null) => void) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed'; // Prevent scrolling to the bottom
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setMessage('Copied to clipboard!');
      setTimeout(() => setMessage(null), 3000); // Clear message after 3 seconds
    } catch (err) {
      setMessage('Failed to copy!');
    }
    document.body.removeChild(textArea);
  };

  const copyShortUrlResultToClipboard = (text: string) => {
    copyToClipboard(text, setCopyMessageforShortUrlResult);
  };

  const copyLongUrlCachedToClipboard = (text: string) => {
    copyToClipboard(text, setCopyMessageforLongUrlCached);
  };

  useEffect(() => {
    if (shortUrlResult) {
      const formElement = document.getElementById('shorten-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [shortUrlResult]);

  return (
    <>
      <header>
        <nav
          style={{
            background: 'var(--background)',
            color: 'var(--foreground)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
          }}
        >
          <div className="logo">
            <img src="/path/to/logo.png" alt="Logo" />
            itsURL Shortner
          </div>
          <button
            className="toggle-button"
            onClick={() => {
              const root = document.documentElement;
              const currentTheme =
                root.style.getPropertyValue('--background') === '#ffffff'
                  ? 'light'
                  : 'dark';
              if (currentTheme === 'light') {
                root.style.setProperty('--background', '#0a0a0a');
                root.style.setProperty('--foreground', '#ededed');
              } else {
                root.style.setProperty('--background', '#ffffff');
                root.style.setProperty('--foreground', '#171717');
              }
            }}
          >
            Toggle Theme
          </button>
        </nav>
      </header>
      <main className="mx-auto">
        <HeroSection /> {/* Add the HeroSection component here */}
        <div id="shorten-form" className="border border-gray-300 rounded-md p-8 sm:p-16 w-[90%] sm:w-[70%] mx-auto mt-12">
          <h1 className="text-xl sm:text-2xl font-bold mb-8">Shorten Your URL</h1>
          <form className="space-y-4">
            <div>
              <label htmlFor="longUrl" className="block text-sm sm:text-base font-medium mb-1">
                Enter a long URL
              </label>
              <input
                type="url"
                id="longUrl"
                value={longUrl || ''}
                onChange={(e) => setLongUrl(e.target.value)}
                placeholder="https://example.com/very/long/url/that/needs/shortening"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-1.5 sm:p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-base" // Set font size to at least 16px
              />
              <br />
              <label htmlFor="customShortUrl" className="block text-sm sm:text-base font-medium mb-1">
                Set Custom Short URL (optional)
              </label>
              <div className="flex items-center space-x-2 mt-2 w-full">
                <label htmlFor="customShortUrl" className="text-sm sm:text-base font-medium flex-shrink-0">
                  https://itsurl.com/
                </label>
                <input
                  type="text"
                  id="customShortUrl"
                  value={customShortCode || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Validate max length, no spaces, and allowed characters
                    const isValid = /^[a-zA-Z0-9!@#$%&*-_?]{0,10}$/.test(value);
                    if (isValid) {
                      setCustomShortCode(value);
                    } else {
                      setInvalidMessage(true);
                      setTimeout(() => setInvalidMessage(false), 3000); // Clear message after 3 seconds
                    }
                  }}
                  placeholder="Custom alias (optional)"
                  className="flex-grow min-w-0 max-w-full rounded-lg border border-gray-300 bg-gray-50 p-1.5 sm:p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              {invalidMessage && <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-4">
                <p className="text-xs text-red-400">
                  Max 10 characters. Allowed: a-z, A-Z, 0-9, -, _, !, @, #, $, %, &, *, -, _, ?, no spaces.
                </p>
              </div>}
            </div>
            <button
              type="button"
              onClick={handleGenerateClick}
              disabled={isLoading}
              className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 disabled:bg-gray-300 text-sm sm:text-base"
            >
              {isLoading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </form>
          <div id="result-section">
            {errorMessage && (
              <div className="mt-4 p-3 sm:p-4 bg-red-100 rounded-md">
                <p className="text-red-700 font-bold text-sm sm:text-base">{errorMessage}</p>
              </div>
            )}
            {shortUrlResult && (
              <div className="mt-4 p-3 sm:p-4 bg-green-100 rounded-md">
                <p className="text-green-700 font-bold text-sm sm:text-base">Your shortened URL is ready!</p>
                <div className="flex items-center mt-2">
            <div className="flex items-center space-x-2">
              <a
                href={shortUrlResult}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm sm:text-base"
              >
                {shortUrlResult}
              </a>
              <button
                onClick={() => copyShortUrlResultToClipboard(shortUrlResult)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiCopy size={14} className="sm:w-4 sm:h-4" /> {/* Adjust icon size */}
              </button>
            </div>
                </div>
              </div>
            )}
            {copyMessageforShortUrlResult && (
              <p className="mt-2 text-xs sm:text-sm text-green-600">{copyMessageforShortUrlResult}</p>
            )}
            {longUrlCached && (
              <div className="mt-4 p-3 sm:p-4 bg-gray-100 rounded-md">
                <p className="text-gray-600 font-bold text-sm sm:text-base">Original URL</p>
                <div className="flex items-center mt-2">
                  <div className="flex items-center space-x-2 w-full">
                    <div className="max-w-[95%] overflow-hidden whitespace-nowrap text-ellipsis flex items-center">
                      <a
                      href={longUrlCached}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm sm:text-base flex-shrink-0"
                      >
                      {longUrlCached}
                      </a>
                      <button
                      onClick={() => copyLongUrlCachedToClipboard(longUrlCached)}
                      className="ml-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                      >
                      <FiCopy size={14} className="sm:w-4 sm:h-4" /> {/* Adjust icon size */}
                      </button>
                    </div>
                    <button
                      onClick={() => copyLongUrlCachedToClipboard(longUrlCached)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiCopy size={14} className="sm:w-4 sm:h-4" /> {/* Adjust icon size */}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {copyMessageforLongUrlCached && (
              <p className="mt-2 text-xs sm:text-sm text-green-600">{copyMessageforLongUrlCached}</p>
            )}
          </div>
        </div>
        <UrlShortenerInfo /> {/* Add the new component here */}
        <footer className="mt-12 bg-gray-800 text-white py-4 text-center">
          <p className="text-xs sm:text-sm">
            © {new Date().getFullYear()} itsURL Pvt. Ltd. All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
}

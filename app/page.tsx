'use client'; // Required for using hooks like useState

import { useState } from 'react';

export default function HomePage() {
  // State to hold the long URL entered by the user
  const [longUrl, setLongUrl] = useState('');
  // State to hold the generated short URL (or error messages)
  const [shortUrlResult, setShortUrlResult] = useState<string | null>(null);
  // State to manage loading status during API call
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateClick = async () => {
    // Check if the input is empty
    if (!longUrl) {
      setShortUrlResult('Please enter a URL first.');
      return;
    }

    // Set loading state and clear previous results
    setIsLoading(true);
    setShortUrlResult(null);

    try {
      // Make a POST request to the API Gateway endpoint
      const response = await fetch('https://itsurl.com/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl: longUrl }), // Send the long URL as "originalUrl"
      });

      // Check if the response is successful
      if (!response.ok) {
        throw new Error('Failed to shorten URL. Please try again.');
      }

      // Parse the JSON response and extract the shortened URL
      const data = await response.json();
      setShortUrlResult(`Generated: ${data.shortUrl}`); // Display the shortened URL
    } catch (error) {
      // Handle any errors (network issues, invalid URL, etc.)
      setShortUrlResult((error as Error).message || 'An error occurred while shortening the URL.');
    } finally {
      // Reset loading state and clear the input field
      setIsLoading(false);
      setLongUrl(''); // Clear the input after success or failure
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">
          Simple URL Shortener
        </h1>

        <div className="mb-4">
          <label htmlFor="longUrl" className="block text-sm font-medium text-gray-600 mb-1">
            Enter Long URL:
          </label>
          <input
            type="url" // Browser validation for URL format
            id="longUrl"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://www.example.com/very/long/url/path"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-700"
            disabled={isLoading} // Disable input during API call
          />
        </div>

        <button
          onClick={handleGenerateClick}
          disabled={isLoading} // Disable button during API call
          className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors duration-200 ease-in-out ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? 'Generating...' : 'Generate Short URL'}
        </button>

        {/* Display the result or error message */}
        {shortUrlResult && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
            <p className="text-sm text-gray-800 break-all">{shortUrlResult}</p>
            {/* Optional: Add a copy button here later */}
          </div>
        )}
      </div>
    </main>
  );
}

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
    <main className="container mx-auto p-4">
      <div className="border border-gray-300 rounded-md p-4 w-[70%] mx-auto">
        <h1 className="text-2xl font-bold mb-4">Shorten Your URL</h1>
        <form className="space-y-4">
          <div>
            <label htmlFor="longUrl" className="block text-sm font-medium text-gray-700">
              Enter a long URL
            </label>
            <input
              type="url"
              id="longUrl"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com/very/long/url/that/needs/shortening"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
        {shortUrlResult && (
          <div className="mt-4 p-4 bg-green-100 rounded-md">
            <p className="text-green-700">{shortUrlResult}</p>
          </div>
        )}
      </div>
    </main>
  );
}

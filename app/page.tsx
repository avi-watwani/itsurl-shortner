// app/page.tsx
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
    if (!longUrl) {
      setShortUrlResult('Please enter a URL first.');
      return;
    }

    setIsLoading(true);
    setShortUrlResult(null); // Clear previous results

    // --- Placeholder for API Call ---
    // In future steps, we will replace this timeout with
    // an actual fetch() call to our API Gateway endpoint.
    console.log('Simulating API call for:', longUrl);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    // --- Mocked Success Response ---
    // Replace this with the actual response later
    const mockShortCode = Math.random().toString(36).substring(2, 8);
    // Assuming your final short URL will be served from your custom domain
    const generatedUrl = `https://mydomain.com/${mockShortCode}`;
    setShortUrlResult(`Generated: ${generatedUrl}`);
    // --- Mocked End ---

    // --- Example Error Handling (uncomment to test) ---
    // setShortUrlResult('Error: Could not shorten URL.');
    // ---

    setIsLoading(false);
    setLongUrl(''); // Optionally clear the input field after success
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
            type="url" // Use type="url" for basic browser validation
            id="longUrl"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://www.example.com/very/long/url/path"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-700"
            disabled={isLoading} // Disable input while loading
          />
        </div>

        <button
          onClick={handleGenerateClick}
          disabled={isLoading} // Disable button while loading
          className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors duration-200 ease-in-out ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? 'Generating...' : 'Generate Short URL'}
        </button>

        {/* Display Area for Result or Error */}
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

export default function HeroSection() {
  return (
    <section
      className="flex flex-col items-center justify-center text-center min-h-screen bg-[#2563EB] text-white px-6"
      style={{ backgroundImage: 'url("/path-to-your-image.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <h1 className="text-5xl font-bold mb-4">Make your links shorter and smarter</h1>
      <p className="text-lg mb-8 max-w-2xl">
        Transform long, unwieldy links into short, memorable URLs that drive more clicks and track better.
      </p>
      <div className="flex space-x-4">
        <button className="px-6 py-3 bg-white text-[#2563EB] font-semibold rounded-md hover:bg-gray-100 transition-colors">
          Start Shortening
        </button>
        <button className="px-6 py-3 border border-white text-white font-semibold rounded-md hover:bg-white hover:text-[#2563EB] transition-colors">
          Learn More
        </button>
      </div>
    </section>
  );
}

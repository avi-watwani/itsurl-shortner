export default function HeroSection() {
  return (
    <section
      className="w-full h-[100vh] bg-cover bg-center text-white flex flex-col items-center justify-center text-center"
      style={{ backgroundImage: "url('/images/background.jpeg')" }}
    >
      <h1 className="text-5xl font-bold mb-4">Make your links shorter and smarter</h1>
      <p className="text-lg mb-8">
        Transform long, unwieldy links into short, memorable URLs that drive more clicks and track better
      </p>
      <div className="space-x-4">
        <button className="bg-white text-blue-500 py-2 px-4 rounded-md font-medium hover:bg-gray-100">
          Start Shortening
        </button>
        <button className="border border-white py-2 px-4 rounded-md font-medium hover:bg-blue-600">
          Learn More
        </button>
      </div>
    </section>
  );
}

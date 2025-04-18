export default function HeroSection() {
  const scrollToForm = () => {
    const formElement = document.getElementById('shorten-form');
    if (formElement) {
      const offset = window.innerWidth < 640 ? -100 : 0; // Add offset for mobile devices
      const yPosition = formElement.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: yPosition, behavior: 'smooth' });

      // Focus the input not on small screens
      if (window.innerWidth > 640) {
        formElement.querySelector('input')?.focus();
      }
    }
  };

  const scrollToUrlShortnerInfo = () => {
    const infoElement = document.getElementById('what-is-url-shortener');
    if (infoElement) {
      infoElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="w-full h-[92vh] bg-cover bg-center text-white flex flex-col items-center justify-center text-center px-4"
      style={{ backgroundImage: "url('/images/background.png')" }}
    >
      <h1 className="text-3xl sm:text-5xl font-bold mb-4">Make your links shorter and smarter</h1>
      <p className="text-sm sm:text-lg mb-8">
        Transform long, unwieldy links into short, memorable URLs that drive more clicks and track better
      </p>
      <div className="space-y-2 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
        <button
          onClick={scrollToForm}
          className="bg-white text-blue-500 py-2 px-4 rounded-md font-medium hover:bg-gray-100 text-sm sm:text-base"
        >
          Start Shortening!
        </button>
        <button
          onClick={scrollToUrlShortnerInfo}
          className="border border-white py-2 px-4 rounded-md font-medium hover:bg-blue-600 text-sm sm:text-base"
        >
          Learn More
        </button>
      </div>
    </section>
  );
}

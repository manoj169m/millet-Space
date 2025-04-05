import Image from 'next/image';

const Choose = () => {
  return (
    <section className="bg-green-100 py-12 px-4">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0">
        {/* Left side (Image) */}
        <div className="flex-1 ">
          <Image
            src="/millets.webp" // Replace with your image path
            alt="Millet Space"
            width={500}
            height={500}
            className="rounded-lg shadow-lg object-cover"
          />
        </div>

        {/* Right side (Text) */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold text-green-800 mb-4">Why Choose Millet Space?</h2>
          <ul className="list-disc list-inside text-lg text-gray-700 space-y-4">
            <li><span className="font-semibold text-green-800">100% Organic:</span> All our products are certified organic, free from pesticides and harmful chemicals.</li>
            <li><span className="font-semibold text-green-800">Sustainable and Eco-Friendly:</span> We care about the planet, and so should you. Our products are sourced sustainably and packaged with care.</li>
            <li><span className="font-semibold text-green-800 ">Fresh and Natural:</span> Delivered straight to your door, our organic items retain their natural freshness and nutritional value.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Choose;

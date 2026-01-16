'use client';

export function StatsSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            The top-rated destination for selfcare
          </h2>

          {/* Sub-heading */}
          <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-3xl mx-auto">
            One solution, one software. Trusted by the best in the selfcare industry
          </p>

          {/* Prominent Statistic - 1 billion+ */}
          <div className="mb-16">
            <div className="text-6xl md:text-7xl lg:text-8xl font-bold text-pink-500 mb-3">
              1 billion+
            </div>
            <p className="text-lg md:text-xl text-gray-700">
              appointments booked on Fresha
            </p>
          </div>

          {/* Three-Column Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
            {/* Left Column */}
            <div>
              <div 
                className="mb-2"
                style={{
                  fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  color: 'rgb(20, 20, 20)',
                  fontSize: '40px',
                  lineHeight: '44px',
                }}
              >
                130,000+
              </div>
              <p className="text-base md:text-lg text-gray-700">
                partner businesses
              </p>
            </div>

            {/* Middle Column */}
            <div>
              <div 
                className="mb-2"
                style={{
                  fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  color: 'rgb(20, 20, 20)',
                  fontSize: '40px',
                  lineHeight: '44px',
                }}
              >
                120+ countries
              </div>
              <p className="text-base md:text-lg text-gray-700">
                using Fresha
              </p>
            </div>

            {/* Right Column */}
            <div>
              <div 
                className="mb-2"
                style={{
                  fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  color: 'rgb(20, 20, 20)',
                  fontSize: '40px',
                  lineHeight: '44px',
                }}
              >
                450,000+
              </div>
              <p className="text-base md:text-lg text-gray-700">
                stylists and professionals
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

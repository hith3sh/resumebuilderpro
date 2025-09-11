import React from 'react';
import { motion } from 'framer-motion';

const TrustedBy = () => {
  const logos = [
    { src: 'https://horizons-cdn.hostinger.com/b5cc3c7a-6a81-4cf7-b6ba-b5b728631238/5c34b5de213c540a1fac4b0209c325fe.png', alt: 'Google logo' },
    { src: 'https://horizons-cdn.hostinger.com/b5cc3c7a-6a81-4cf7-b6ba-b5b728631238/8bc1037677c6dc0bf5dae7e479a07406.png', alt: 'Microsoft logo' },
    { src: 'https://horizons-cdn.hostinger.com/b5cc3c7a-6a81-4cf7-b6ba-b5b728631238/c51e9433fba69721779479ca581a7ab0.png', alt: 'Netflix logo' },
    { src: 'https://horizons-cdn.hostinger.com/b5cc3c7a-6a81-4cf7-b6ba-b5b728631238/3917340b51da1d7dbbb1ca0acffa7dd8.png', alt: 'Facebook logo' },
    { src: 'https://horizons-cdn.hostinger.com/b5cc3c7a-6a81-4cf7-b6ba-b5b728631238/59ddc420d0d5b700691297ab630170cc.png', alt: 'Samsung logo' },
    { src: 'https://horizons-cdn.hostinger.com/b5cc3c7a-6a81-4cf7-b6ba-b5b728631238/682315471343195eb1cf6952b5b074a1.png', alt: 'Lowe\'s logo' },
    { src: 'https://horizons-cdn.hostinger.com/b5cc3c7a-6a81-4cf7-b6ba-b5b728631238/5fcfa51ce55ed066962d3ee1d566cf12.png', alt: 'Adobe logo' },
    { src: 'https://horizons-cdn.hostinger.com/b5cc3c7a-6a81-4cf7-b6ba-b5b728631238/3b11c7316defa3925fa94c393d5cbb40.png', alt: 'Delta logo' },
  ];

  const duplicatedLogos = [...logos, ...logos];

  return (
    <section id="trusted-by" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-lg font-semibold text-gray-600 mb-8">
            Trusted by Professionals at
          </p>
        </motion.div>
      </div>
      <div className="w-full overflow-hidden bg-blue-50 py-8">
        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {duplicatedLogos.map((logo, index) => (
            <div key={index} className="flex-shrink-0 mx-8">
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-8 md:h-10 object-contain grayscale hover:grayscale-0 transition-all duration-300 rounded-2xl"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
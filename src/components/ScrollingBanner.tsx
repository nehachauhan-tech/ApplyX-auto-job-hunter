"use client";

import { motion } from "framer-motion";

const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "Spotify",
  "Uber",
  "Airbnb",
  "Stripe",
  "Shopify",
  "Slack",
  "Zoom",
  "Adobe",
  "Salesforce",
];

export default function ScrollingBanner() {
  return (
    <section className="py-12 bg-cream-200 overflow-hidden">
      <div className="text-center mb-8">
        <p className="text-sm font-medium text-charcoal-600 uppercase tracking-wider">
          Our users have landed jobs at
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-cream-200 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-cream-200 to-transparent z-10" />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            },
          }}
          className="flex gap-12 whitespace-nowrap"
        >
          {[...companies, ...companies].map((company, index) => (
            <div
              key={index}
              className="flex items-center justify-center min-w-[150px]"
            >
              <span className="text-xl font-semibold text-charcoal-400 hover:text-charcoal-700 transition-colors">
                {company}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

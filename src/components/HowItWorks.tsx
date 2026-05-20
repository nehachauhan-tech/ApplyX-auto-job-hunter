"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Upload, Settings, Rocket, Trophy } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Resume",
    description:
      "Upload your existing resume or create one from scratch. Our AI will analyze and enhance it.",
  },
  {
    icon: Settings,
    step: "02",
    title: "Set Preferences",
    description:
      "Tell us your dream role, salary expectations, location preferences, and target companies.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Auto-Apply",
    description:
      "Sit back as ApplyX applies to matching jobs across LinkedIn, Indeed, Naukri, and more.",
  },
  {
    icon: Trophy,
    step: "04",
    title: "Land Interviews",
    description:
      "Track responses, prepare with AI-powered interview tips, and land your dream job.",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      className="section-padding bg-cream-100"
      ref={ref}
    >
      <div className="container-max mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-700 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-dark-200 max-w-2xl mx-auto">
            Get started in minutes. Our streamlined process makes job hunting
            effortless.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-primary-200 -translate-y-1/2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-6 lg:p-8 border border-primary-100 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center mb-6 relative">
                      <step.icon className="w-8 h-8 text-cream-100" />
                      <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                        {step.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-dark-700 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-dark-200 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

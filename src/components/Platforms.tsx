"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, Check } from "lucide-react";

const platforms = [
  {
    name: "LinkedIn",
    description: "World's largest professional network",
    jobs: "20M+ jobs",
    color: "#0A66C2",
  },
  {
    name: "Indeed",
    description: "Global job search engine",
    jobs: "350M+ job seekers",
    color: "#2164F3",
  },
  {
    name: "Naukri",
    description: "India's #1 job portal",
    jobs: "500K+ jobs",
    color: "#4285F4",
  },
  {
    name: "Unstop",
    description: "Competitions & opportunities",
    jobs: "50K+ opportunities",
    color: "#6366F1",
  },
  {
    name: "Internshala",
    description: "Internships & fresher jobs",
    jobs: "200K+ internships",
    color: "#00AEEF",
  },
  {
    name: "YC Jobs",
    description: "Y Combinator startups",
    jobs: "10K+ startup jobs",
    color: "#FF6600",
  },
  {
    name: "Glassdoor",
    description: "Jobs with company reviews",
    jobs: "2M+ jobs",
    color: "#0CAA41",
  },
  {
    name: "AngelList",
    description: "Startup jobs & equity",
    jobs: "130K+ startups",
    color: "#000000",
  },
];

export default function Platforms() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="platforms"
      className="section-padding bg-gradient-to-b from-cream-100 to-cream-200"
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
            One Platform,{" "}
            <span className="text-primary-500">Endless Opportunities</span>
          </h2>
          <p className="text-lg text-dark-200 max-w-2xl mx-auto">
            Connect all your favorite job platforms and manage everything from a
            single dashboard.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
          {platforms.map((platform, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group"
            >
              <div className="bg-white rounded-xl p-5 border border-primary-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.name[0]}
                  </div>
                  <ExternalLink className="w-4 h-4 text-dark-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-dark-700 mb-1">
                  {platform.name}
                </h3>
                <p className="text-sm text-dark-200 mb-2">
                  {platform.description}
                </p>
                <span className="text-xs font-medium text-primary-600">
                  {platform.jobs}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-primary-100"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-dark-700 mb-4">
                Seamless Integration
              </h3>
              <p className="text-dark-200 mb-6">
                Connect your accounts securely and let ApplyX handle the rest.
                Your credentials are encrypted and never stored.
              </p>
              <ul className="space-y-3">
                {[
                  "One-click OAuth connection",
                  "Real-time job sync",
                  "Automatic profile updates",
                  "Cross-platform tracking",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-600" />
                    </div>
                    <span className="text-dark-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-cream-100 rounded-xl p-6">
                <div className="space-y-3">
                  {["LinkedIn", "Indeed", "Naukri"].map((name, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white rounded-lg p-4 border border-primary-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-600" />
                        </div>
                        <span className="font-medium text-dark-700">
                          {name}
                        </span>
                      </div>
                      <span className="text-sm text-accent-green font-medium">
                        Connected
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-white/50 rounded-lg p-4 border border-dashed border-primary-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                        <span className="text-dark-200 text-lg">+</span>
                      </div>
                      <span className="text-dark-200">
                        Connect more platforms
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

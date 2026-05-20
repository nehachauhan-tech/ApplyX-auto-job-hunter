"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How does the auto-apply feature work?",
    answer:
      "Once you set your job preferences (role, location, salary, etc.), our AI scans connected platforms for matching jobs and automatically submits applications using your optimized resume. You can set daily limits and approve applications before they're sent.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use bank-level encryption (AES-256) for all data. Your login credentials for job platforms are never stored - we use secure OAuth connections. We're GDPR compliant and you can delete your data anytime.",
  },
  {
    question: "Which job platforms do you support?",
    answer:
      "We currently support LinkedIn, Indeed, Naukri, Unstop, Internshala, YC Jobs, Glassdoor, and AngelList. We're constantly adding more platforms based on user requests.",
  },
  {
    question: "How does ATS optimization work?",
    answer:
      "Our AI analyzes job descriptions to identify key skills, keywords, and requirements. It then suggests modifications to your resume to improve ATS compatibility while maintaining readability for human recruiters.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes! You can cancel your subscription at any time from your account settings. You'll continue to have access to premium features until the end of your billing period.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "Yes! All paid plans come with a 14-day free trial. No credit card required to start. You can experience all Pro features before deciding to subscribe.",
  },
];

export default function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-padding bg-cream-100" ref={ref}>
      <div className="container-max mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-beige-200 mb-4">
            <HelpCircle className="w-4 h-4 text-accent-teal" />
            <span className="text-sm font-medium text-charcoal-700">FAQs</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
            Got questions? We&apos;ve got answers. If you can&apos;t find what you&apos;re
            looking for, reach out to our support team.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="mb-4"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full bg-white rounded-xl p-5 border border-beige-200 hover:border-beige-300 transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-charcoal-900">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-charcoal-500 transition-transform duration-300 flex-shrink-0 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-charcoal-600 mt-4 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding bg-cream-100" ref={ref}>
      <div className="container-max mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-br from-dark-700 via-dark-600 to-dark-700 rounded-3xl p-8 sm:p-12 lg:p-16"
        >
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-olive-400/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-2xl mb-6"
            >
              <Sparkles className="w-8 h-8 text-primary-400" />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cream-100 mb-6">
              Ready to Transform Your
              <br />
              <span className="text-primary-400">Job Search?</span>
            </h2>

            <p className="text-lg text-cream-300 mb-8 max-w-xl mx-auto">
              Join thousands of professionals who&apos;ve landed their dream jobs
              with ApplyX. Start your 14-day free trial today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group px-8 py-4 bg-primary-500 text-white rounded-full font-medium transition-all duration-300 hover:bg-primary-600 flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#"
                className="px-8 py-4 border-2 border-cream-100/30 text-cream-100 rounded-full font-medium transition-all duration-300 hover:bg-cream-100/10"
              >
                Schedule Demo
              </Link>
            </div>

            <p className="text-sm text-cream-400 mt-6">
              No credit card required • Cancel anytime • 14-day free trial
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

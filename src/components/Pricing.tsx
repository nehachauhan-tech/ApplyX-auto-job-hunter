"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for getting started",
    features: [
      "5 auto-applications/day",
      "Basic resume optimization",
      "2 platform connections",
      "Email notifications",
      "Basic dashboard",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: { monthly: 29, yearly: 24 },
    description: "For serious job seekers",
    features: [
      "Unlimited auto-applications",
      "Advanced ATS optimization",
      "All platform connections",
      "Recruiter email finder",
      "Priority notifications",
      "Interview prep AI",
      "Application analytics",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: { monthly: 99, yearly: 79 },
    description: "For teams and agencies",
    features: [
      "Everything in Pro",
      "Multiple user seats",
      "Team dashboard",
      "API access",
      "Custom integrations",
      "Dedicated support",
      "White-label options",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="section-padding bg-beige-100" ref={ref}>
      <div className="container-max mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-charcoal-600 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your job search needs. All plans include a
            14-day free trial.
          </p>

          <div className="inline-flex items-center gap-3 bg-white rounded-full p-1.5 border border-beige-200">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !isYearly
                  ? "bg-charcoal-900 text-cream-100"
                  : "text-charcoal-600 hover:text-charcoal-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isYearly
                  ? "bg-charcoal-900 text-cream-100"
                  : "text-charcoal-600 hover:text-charcoal-900"
              }`}
            >
              Yearly
              <span className="text-xs bg-accent-teal text-white px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-accent-orange text-white text-sm font-medium px-4 py-1 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}
              <div
                className={`h-full rounded-2xl p-6 lg:p-8 border transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? "bg-charcoal-900 border-charcoal-700"
                    : "bg-white border-beige-200"
                }`}
              >
                <div className="mb-6">
                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      plan.popular ? "text-cream-100" : "text-charcoal-900"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      plan.popular ? "text-beige-300" : "text-charcoal-600"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-bold ${
                        plan.popular ? "text-cream-100" : "text-charcoal-900"
                      }`}
                    >
                      ${isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span
                        className={
                          plan.popular ? "text-beige-400" : "text-charcoal-500"
                        }
                      >
                        /month
                      </span>
                    )}
                  </div>
                  {isYearly && plan.price.yearly > 0 && (
                    <p
                      className={`text-sm mt-1 ${
                        plan.popular ? "text-accent-teal" : "text-accent-teal"
                      }`}
                    >
                      Billed annually (${plan.price.yearly * 12}/year)
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.popular
                            ? "bg-accent-teal/20"
                            : "bg-accent-teal/10"
                        }`}
                      >
                        <Check className="w-3 h-3 text-accent-teal" />
                      </div>
                      <span
                        className={`text-sm ${
                          plan.popular ? "text-beige-200" : "text-charcoal-600"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-full font-medium transition-all duration-300 ${
                    plan.popular
                      ? "bg-cream-100 text-charcoal-900 hover:bg-white"
                      : "bg-charcoal-900 text-cream-100 hover:bg-charcoal-700"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

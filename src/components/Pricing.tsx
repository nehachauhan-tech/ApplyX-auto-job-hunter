"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    price: "₹0",
    period: "Forever Free",
    description: "Perfect for exploring the platform",
    features: [
      "50 auto-applications/month",
      "1 resume template",
      "Basic ATS optimization",
      "Email support",
      "Job alerts (weekly)",
    ],
    buttonText: "Get Started",
    buttonStyle: "btn-secondary",
    popular: false,
  },
  {
    name: "Professional",
    icon: Sparkles,
    price: "₹499",
    period: "/month",
    description: "Most popular for active job seekers",
    features: [
      "Unlimited auto-applications",
      "10 resume templates",
      "Advanced ATS optimization",
      "Priority support",
      "Real-time job alerts",
      "LinkedIn integration",
      "Application tracking",
      "Interview preparation tips",
    ],
    buttonText: "Start 14-Day Trial",
    buttonStyle: "btn-primary",
    popular: true,
  },
  {
    name: "Enterprise",
    icon: Crown,
    price: "₹1,499",
    period: "/month",
    description: "For serious career advancement",
    features: [
      "Everything in Professional",
      "Unlimited resume templates",
      "Recruiter outreach automation",
      "Dedicated account manager",
      "Custom integrations",
      "Team collaboration",
      "Analytics dashboard",
      "API access",
    ],
    buttonText: "Contact Sales",
    buttonStyle: "btn-secondary",
    popular: false,
  },
];

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="pricing"
      className="section-padding bg-gradient-to-b from-cream-100 to-sand-100"
      ref={ref}
    >
      <div className="container-max mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-sand-300 mb-4">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-dark-300">
              Simple Pricing
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-700 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-dark-200 max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include a 14-day money-back guarantee.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative group ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-dark-700 text-cream-100 text-xs font-semibold px-4 py-1.5 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div
                className={`h-full rounded-3xl p-6 lg:p-8 transition-all duration-300 ${
                  plan.popular
                    ? "bg-dark-700 text-cream-100 shadow-2xl shadow-dark-700/20"
                    : "bg-white border border-sand-200 hover:shadow-xl hover:shadow-primary-500/5"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      plan.popular
                        ? "bg-primary-500/20"
                        : "bg-sand-100"
                    }`}
                  >
                    <plan.icon
                      className={`w-6 h-6 ${
                        plan.popular ? "text-primary-400" : "text-primary-500"
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-xl font-semibold ${
                      plan.popular ? "text-cream-100" : "text-dark-700"
                    }`}
                  >
                    {plan.name}
                  </h3>
                </div>

                <div className="mb-4">
                  <span
                    className={`text-4xl lg:text-5xl font-bold ${
                      plan.popular ? "text-cream-100" : "text-dark-700"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.popular ? "text-cream-400" : "text-dark-200"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>

                <p
                  className={`text-sm mb-6 ${
                    plan.popular ? "text-cream-300" : "text-dark-200"
                  }`}
                >
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          plan.popular ? "text-primary-400" : "text-olive-500"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          plan.popular ? "text-cream-200" : "text-dark-300"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`block w-full text-center py-3 rounded-full font-medium transition-all duration-300 ${
                    plan.popular
                      ? "bg-cream-100 text-dark-700 hover:bg-white"
                      : "bg-dark-700 text-cream-100 hover:bg-dark-600"
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-dark-200">
            All prices are in Indian Rupees (INR). GST applicable as per government regulations.
          </p>
          <p className="text-sm text-dark-200 mt-1">
            Need a custom plan for your team?{" "}
            <Link href="#" className="text-primary-500 hover:text-primary-600 font-medium">
              Contact us
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  FileText,
  Send,
  BarChart3,
  Mail,
  Bell,
  Briefcase,
  Sparkles,
  Users,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "ATS-Optimized Resumes",
    description:
      "AI analyzes job descriptions and tailors your resume with the right keywords to pass ATS filters.",
    color: "bg-accent-teal/10",
    iconColor: "text-accent-teal",
  },
  {
    icon: Send,
    title: "Auto-Apply Engine",
    description:
      "Set your preferences once and let our AI apply to hundreds of matching jobs across all platforms.",
    color: "bg-accent-orange/10",
    iconColor: "text-accent-orange",
  },
  {
    icon: BarChart3,
    title: "Smart Dashboard",
    description:
      "Track all applications, responses, and interview invites in one beautiful, unified dashboard.",
    color: "bg-accent-sand/20",
    iconColor: "text-charcoal-700",
  },
  {
    icon: Mail,
    title: "Recruiter Outreach",
    description:
      "Find recruiter emails and send personalized outreach messages to get noticed faster.",
    color: "bg-accent-teal/10",
    iconColor: "text-accent-teal",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description:
      "Get instant notifications for new matching jobs, application updates, and interview requests.",
    color: "bg-accent-orange/10",
    iconColor: "text-accent-orange",
  },
  {
    icon: Briefcase,
    title: "Multi-Platform Sync",
    description:
      "Connect LinkedIn, Indeed, Naukri, Unstop, Internshala, and more in one unified workflow.",
    color: "bg-accent-sand/20",
    iconColor: "text-charcoal-700",
  },
];

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="features"
      className="section-padding bg-gradient-to-b from-beige-100 to-cream-200"
      ref={ref}
    >
      <div className="container-max mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-beige-200 mb-4">
            <Sparkles className="w-4 h-4 text-accent-orange" />
            <span className="text-sm font-medium text-charcoal-700">
              Powerful Features
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 mb-4">
            Everything You Need to
            <br />
            <span className="text-accent-orange">Land Your Dream Job</span>
          </h2>
          <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
            From resume optimization to automated applications, we handle the
            tedious parts so you can focus on preparing for interviews.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-white/70 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-beige-200 transition-all duration-300 hover:shadow-xl hover:shadow-charcoal-900/5 hover:-translate-y-1">
                <div
                  className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}
                >
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-charcoal-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-charcoal-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 bg-charcoal-900 rounded-2xl sm:rounded-3xl p-8 sm:p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-teal rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-orange rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold text-cream-100 mb-3">
                Ready to Supercharge Your Job Search?
              </h3>
              <p className="text-beige-300 max-w-xl">
                Join thousands of job seekers who landed their dream roles using
                ApplyX.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-beige-300 border-2 border-charcoal-900 flex items-center justify-center"
                  >
                    <Users className="w-5 h-5 text-charcoal-700" />
                  </div>
                ))}
              </div>
              <span className="text-cream-100 text-sm">
                <span className="font-bold">10,000+</span> active users
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

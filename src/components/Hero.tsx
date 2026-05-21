"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Zap, Target, TrendingUp } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "50K+", label: "Jobs Applied" },
  { value: "10K+", label: "Users" },
  { value: "85%", label: "Interview Rate" },
];

const floatingIcons = [
  { Icon: Zap, delay: 0, x: "10%", y: "20%" },
  { Icon: Target, delay: 0.2, x: "85%", y: "15%" },
  { Icon: TrendingUp, delay: 0.4, x: "75%", y: "70%" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-olive-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sand-200/50 rounded-full blur-3xl" />
      </div>

      {floatingIcons.map(({ Icon, delay, x, y }, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.8, duration: 0.5 }}
          className="absolute hidden lg:block"
          style={{ left: x, top: y }}
        >
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: delay }}
            className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sand-200"
          >
            <Icon className="w-6 h-6 text-primary-600" />
          </motion.div>
        </motion.div>
      ))}

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-sand-300 mb-6"
          >
            <span className="w-2 h-2 bg-olive-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-dark-300">
              AI-Powered Job Hunting Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-dark-700 leading-tight mb-6"
          >
            Land Your Dream Job
            <br />
            <span className="relative">
              <span className="relative z-10 text-primary-500">Automatically</span>
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="absolute -bottom-2 left-0 w-full h-4"
                viewBox="0 0 300 12"
                fill="none"
              >
                <motion.path
                  d="M2 10C50 2 100 2 150 6C200 10 250 6 298 2"
                  stroke="#C08552"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-dark-200 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Connect with LinkedIn, Indeed, Naukri, Unstop & more. Let AI craft
            ATS-optimized resumes and auto-apply to hundreds of jobs while you
            focus on what matters.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link
              href="/signup"
              className="btn-primary flex items-center gap-2 text-base px-8 py-4"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-12"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-dark-700">
                  {stat.value}
                </div>
                <div className="text-sm text-dark-200">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 relative"
        >
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-cream-100 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-sand-200 overflow-hidden">
              <div className="bg-dark-700 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-coral" />
                  <div className="w-3 h-3 rounded-full bg-accent-peach" />
                  <div className="w-3 h-3 rounded-full bg-accent-sage" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-sm text-cream-200">
                    ApplyX Dashboard
                  </span>
                </div>
              </div>
              <div className="p-4 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <DashboardCard
                    title="Applications Today"
                    value="47"
                    change="+12%"
                    color="blue"
                  />
                  <DashboardCard
                    title="Interview Invites"
                    value="8"
                    change="+3"
                    color="orange"
                  />
                  <DashboardCard
                    title="Profile Views"
                    value="234"
                    change="+28%"
                    color="green"
                  />
                </div>
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-sand-100 rounded-xl p-4 sm:p-6">
                    <h3 className="font-semibold text-dark-700 mb-4">
                      Recent Applications
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          company: "Google",
                          role: "Senior Developer",
                          status: "Applied",
                        },
                        {
                          company: "Microsoft",
                          role: "Full Stack Engineer",
                          status: "In Review",
                        },
                        {
                          company: "Amazon",
                          role: "Software Engineer",
                          status: "Interview",
                        },
                      ].map((job, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-white/80 rounded-lg p-3 border border-sand-200"
                        >
                          <div>
                            <div className="font-medium text-dark-700 text-sm">
                              {job.role}
                            </div>
                            <div className="text-xs text-dark-200">
                              {job.company}
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              job.status === "Interview"
                                ? "bg-olive-200 text-olive-500"
                                : job.status === "In Review"
                                ? "bg-primary-100 text-primary-600"
                                : "bg-sand-200 text-primary-500"
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-sand-100 rounded-xl p-4 sm:p-6">
                    <h3 className="font-semibold text-dark-700 mb-4">
                      AI Resume Score
                    </h3>
                    <div className="flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <svg
                          className="w-full h-full -rotate-90"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#F3DCC8"
                            strokeWidth="12"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#C08552"
                            strokeWidth="12"
                            strokeDasharray="251.2"
                            strokeDashoffset="37.68"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-dark-700">
                            85%
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-sm text-dark-200 mt-4">
                      Your resume is ATS-optimized
                    </p>
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

function DashboardCard({
  title,
  value,
  change,
  color,
}: {
  title: string;
  value: string;
  change: string;
  color: "blue" | "orange" | "green";
}) {
  const colorClasses = {
    blue: "bg-sand-100 border-sand-300",
    orange: "bg-primary-100 border-primary-200",
    green: "bg-olive-100 border-olive-200",
  };

  return (
    <div
      className={`rounded-xl p-4 sm:p-6 border ${colorClasses[color]} transition-transform hover:scale-105`}
    >
      <div className="text-sm text-dark-200 mb-2">{title}</div>
      <div className="flex items-end justify-between">
        <span className="text-2xl sm:text-3xl font-bold text-dark-700">
          {value}
        </span>
        <span className="text-sm text-olive-500 font-medium">{change}</span>
      </div>
    </div>
  );
}

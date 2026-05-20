"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer at Google",
    image: "/testimonials/priya.jpg",
    content:
      "ApplyX changed my job search completely. I went from applying to 5 jobs a day manually to over 50 with their auto-apply feature. Landed my dream job at Google in just 3 weeks!",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "Product Manager at Microsoft",
    image: "/testimonials/rahul.jpg",
    content:
      "The ATS optimization feature is incredible. My interview callback rate went from 5% to over 40%. The recruiter outreach tool helped me connect with the right people.",
    rating: 5,
  },
  {
    name: "Ananya Patel",
    role: "Data Scientist at Amazon",
    image: "/testimonials/ananya.jpg",
    content:
      "As a fresher, I was overwhelmed by the job market. ApplyX made it so easy to apply to multiple platforms. The dashboard tracking feature kept me organized throughout.",
    rating: 5,
  },
  {
    name: "Vikram Singh",
    role: "Full Stack Developer at Flipkart",
    image: "/testimonials/vikram.jpg",
    content:
      "The multi-platform integration is seamless. I connected LinkedIn, Naukri, and Internshala in minutes. ApplyX handled everything while I focused on interview prep.",
    rating: 5,
  },
  {
    name: "Sneha Reddy",
    role: "UX Designer at Swiggy",
    image: "/testimonials/sneha.jpg",
    content:
      "I love how ApplyX customizes my resume for each application. The AI suggestions for keywords helped my resume stand out. Got 3 offers within a month!",
    rating: 5,
  },
  {
    name: "Arjun Nair",
    role: "Backend Engineer at Razorpay",
    image: "/testimonials/arjun.jpg",
    content:
      "The notification system is fantastic. I never missed an interview invite or important update. ApplyX is a game-changer for serious job seekers.",
    rating: 5,
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="testimonials"
      className="section-padding bg-charcoal-900 relative overflow-hidden"
      ref={ref}
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-teal rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-orange rounded-full blur-3xl" />
      </div>

      <div className="container-max mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cream-100 mb-4">
            Loved by <span className="text-accent-sand">10,000+</span> Job
            Seekers
          </h2>
          <p className="text-lg text-beige-300 max-w-2xl mx-auto">
            See how ApplyX has transformed the job search journey for thousands
            of professionals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-charcoal-800/50 backdrop-blur-sm rounded-2xl p-6 border border-charcoal-700 hover:border-accent-teal/30 transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-accent-sand text-accent-sand"
                    />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-accent-teal/30 mb-3" />
                <p className="text-beige-200 leading-relaxed mb-6">
                  {testimonial.content}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-teal to-accent-orange flex items-center justify-center text-white font-semibold">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-cream-100">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-beige-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

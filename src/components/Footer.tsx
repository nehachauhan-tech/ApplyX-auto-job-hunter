"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

const footerLinks = {
  Product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Integrations", href: "#platforms" },
    { name: "Changelog", href: "#" },
    { name: "Roadmap", href: "#" },
  ],
  Company: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
    { name: "Contact", href: "#" },
  ],
  Resources: [
    { name: "Help Center", href: "#" },
    { name: "Documentation", href: "#" },
    { name: "API Reference", href: "#" },
    { name: "Community", href: "#" },
    { name: "Status", href: "#" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
    { name: "GDPR", href: "#" },
  ],
};

const socialLinks = [
  { icon: "X", href: "#", label: "Twitter" },
  { icon: "in", href: "#", label: "LinkedIn" },
  { icon: "GH", href: "#", label: "GitHub" },
  { icon: "IG", href: "#", label: "Instagram" },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal-900 text-beige-200">
      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-charcoal-900" />
              </div>
              <span className="text-xl font-bold text-cream-100">ApplyX</span>
            </Link>
            <p className="text-beige-400 mb-6 max-w-xs">
              AI-powered job hunting platform. Auto-apply to your dream jobs
              across multiple platforms.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-charcoal-800 flex items-center justify-center text-beige-400 hover:text-cream-100 hover:bg-charcoal-700 transition-colors text-sm font-bold"
                >
                  {icon}
                </Link>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-cream-100 mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-beige-400 hover:text-cream-100 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-charcoal-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-beige-500">
            © {new Date().getFullYear()} ApplyX. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-sm text-beige-500 hover:text-cream-100 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-beige-500 hover:text-cream-100 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-beige-500 hover:text-cream-100 transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

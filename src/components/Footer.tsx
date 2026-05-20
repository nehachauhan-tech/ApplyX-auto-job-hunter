"use client";

import Link from "next/link";
import Logo from "./Logo";

const footerLinks = {
  Product: [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Integrations", href: "#platforms" },
  ],
  Company: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Contact", href: "#" },
  ],
  Legal: [
    { name: "Privacy", href: "#" },
    { name: "Terms", href: "#" },
  ],
};

const socialLinks = [
  { icon: "X", href: "#", label: "Twitter" },
  { icon: "in", href: "#", label: "LinkedIn" },
  { icon: "GH", href: "#", label: "GitHub" },
];

export default function Footer() {
  return (
    <footer className="bg-dark-700 text-cream-200">
      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="col-span-2">
            <Logo size="sm" />
            <p className="text-cream-400 mt-3 text-sm max-w-xs">
              AI-powered job hunting. Auto-apply to your dream jobs across multiple platforms.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.map(({ icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-dark-500 flex items-center justify-center text-cream-400 hover:text-cream-100 hover:bg-dark-400 transition-colors text-xs font-bold"
                >
                  {icon}
                </Link>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-cream-100 mb-3 text-sm">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-cream-400 hover:text-cream-100 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-dark-500 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-cream-500">
            © {new Date().getFullYear()} ApplyX. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-cream-500 hover:text-cream-100 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-xs text-cream-500 hover:text-cream-100 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

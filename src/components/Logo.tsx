"use client";

import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: "w-8 h-8", text: "text-lg" },
    md: { icon: "w-10 h-10", text: "text-xl" },
    lg: { icon: "w-14 h-14", text: "text-2xl" },
  };

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={sizes[size].icon}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Magnifying glass circle */}
        <circle
          cx="42"
          cy="42"
          r="28"
          stroke="#2D7DD2"
          strokeWidth="6"
          fill="none"
        />
        {/* Magnifying glass handle */}
        <line
          x1="62"
          y1="62"
          x2="88"
          y2="88"
          stroke="#2D7DD2"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Left person (blue) */}
        <circle cx="28" cy="35" r="6" fill="#2D7DD2" />
        <path
          d="M20 52 C20 45 28 42 28 42 C28 42 36 45 36 52"
          stroke="#2D7DD2"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        {/* Center person (orange/golden - highlighted) */}
        <circle cx="42" cy="32" r="7" fill="#F5A623" />
        <path
          d="M32 52 C32 43 42 40 42 40 C42 40 52 43 52 52"
          stroke="#F5A623"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        {/* Tie on center person */}
        <path
          d="M42 47 L40 55 L42 58 L44 55 Z"
          fill="#F5A623"
        />
        {/* Right person (blue) */}
        <circle cx="56" cy="35" r="6" fill="#2D7DD2" />
        <path
          d="M48 52 C48 45 56 42 56 42 C56 42 64 45 64 52"
          stroke="#2D7DD2"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span className={`${sizes[size].text} font-bold text-dark-700`}>
          Apply<span className="text-primary-500">X</span>
        </span>
      )}
    </Link>
  );
}

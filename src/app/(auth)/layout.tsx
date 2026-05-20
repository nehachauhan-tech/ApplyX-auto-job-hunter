import Logo from "@/components/Logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream-100 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/">
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 100 100"
                className="w-12 h-12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="42" cy="42" r="28" stroke="#2D7DD2" strokeWidth="6" fill="none" />
                <line x1="62" y1="62" x2="88" y2="88" stroke="#2D7DD2" strokeWidth="8" strokeLinecap="round" />
                <circle cx="28" cy="35" r="6" fill="#2D7DD2" />
                <path d="M20 52 C20 45 28 42 28 42 C28 42 36 45 36 52" stroke="#2D7DD2" strokeWidth="4" fill="none" strokeLinecap="round" />
                <circle cx="42" cy="32" r="7" fill="#F5A623" />
                <path d="M32 52 C32 43 42 40 42 40 C42 40 52 43 52 52" stroke="#F5A623" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M42 47 L40 55 L42 58 L44 55 Z" fill="#F5A623" />
                <circle cx="56" cy="35" r="6" fill="#2D7DD2" />
                <path d="M48 52 C48 45 56 42 56 42 C56 42 64 45 64 52" stroke="#2D7DD2" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
              <span className="text-2xl font-bold text-cream-100">
                Apply<span className="text-primary-400">X</span>
              </span>
            </div>
          </Link>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-cream-100 leading-tight">
              Land Your Dream Job
              <br />
              <span className="text-primary-400">Automatically</span>
            </h1>
            <p className="text-cream-300 text-lg max-w-md">
              Connect with LinkedIn, Indeed, Naukri & more. Let AI handle the applications while you prepare for interviews.
            </p>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-cream-100">50K+</div>
                <div className="text-sm text-cream-400">Jobs Applied</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cream-100">10K+</div>
                <div className="text-sm text-cream-400">Happy Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cream-100">85%</div>
                <div className="text-sm text-cream-400">Success Rate</div>
              </div>
            </div>
          </div>

          <p className="text-cream-500 text-sm">
            © {new Date().getFullYear()} ApplyX. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo size="lg" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

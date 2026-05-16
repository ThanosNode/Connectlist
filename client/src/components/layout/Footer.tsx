import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-300 mt-10">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-3 border-b border-gray-300 pb-1">about connectlist</h3>
            <p className="text-sm text-gray-600 mb-4">
              A Web3-focused platform inspired by Craigslist, enabling personal
              connections, job opportunities, and business services.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Twitter" 
                className="text-gray-600 hover:text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
              <a 
                href="https://discord.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Discord" 
                className="text-gray-600 hover:text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
                </svg>
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="GitHub" 
                className="text-gray-600 hover:text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                  <path d="M9 18c-4.51 2-5-2-7-2"/>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-3 border-b border-gray-300 pb-1">categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/personal" className="text-blue-700 hover:underline">
                  personal
                </Link>
              </li>
              <li>
                <Link href="/category/jobs" className="text-blue-700 hover:underline">
                  jobs
                </Link>
              </li>
              <li>
                <Link href="/category/business" className="text-blue-700 hover:underline">
                  business
                </Link>
              </li>
              <li>
                <Link href="/category/housing" className="text-blue-700 hover:underline">
                  housing
                </Link>
              </li>
              <li>
                <Link href="/category/services" className="text-blue-700 hover:underline">
                  services
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-3 border-b border-gray-300 pb-1">information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-blue-700 hover:underline">
                  about
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-blue-700 hover:underline">
                  terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-blue-700 hover:underline">
                  privacy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-blue-700 hover:underline">
                  contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-blue-700 hover:underline">
                  faq
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-3 border-b border-gray-300 pb-1">payments</h3>
            <p className="text-sm text-gray-600 mb-4">
              We accept cryptocurrency payments via Coinbase Commerce.
            </p>
            <div className="flex space-x-2 items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bitcoin text-[#F7931A]">
                <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-badge text-[#627EEA]">
                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
              </svg>
              <span className="text-sm font-medium">USDC</span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-300 mt-6 pt-4 text-center text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} connectlist</p>
        </div>
      </div>
    </footer>
  );
}

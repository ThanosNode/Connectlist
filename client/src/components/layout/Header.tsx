import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { useLanguage, Language } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const { openLoginModal, openRegisterModal } = useModal();
  const { currentLanguage, languages, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
    // This now uses the LanguageContext to manage the language state
    console.log(`Language changed to: ${language.name}`);
  };

  return (
    <header className="bg-gray-100 border-b border-gray-300">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-semibold text-blue-700">
            ConnectList
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 items-center">
            <Link href="/post" className="text-sm text-blue-700 hover:underline">
              Post a Listing
            </Link>
            <Link href="/browse" className="text-sm text-blue-700 hover:underline">
              Browse Categories
            </Link>
            <Link href="/about" className="text-sm text-blue-700 hover:underline">
              About
            </Link>
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-blue-700 text-sm hover:underline flex items-center">
                    my account <ChevronDown className="ml-1 h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-gray-300 shadow-sm">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-listings" className="w-full">
                      My Listings
                    </Link>
                  </DropdownMenuItem>
                  {(user?.role === 'super_admin' || user?.role === 'sub_admin') && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard" className="w-full">
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={openLoginModal}
                className="text-blue-700 text-sm hover:underline"
              >
                sign in
              </button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-blue-700 text-sm hover:underline flex items-center">
                  {currentLanguage.name.toLowerCase()} <ChevronDown className="ml-1 h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border border-gray-300 shadow-sm">
                {languages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang)}
                    className={lang.code === currentLanguage.code ? "font-medium" : ""}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-blue-700 text-sm" 
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            menu
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden flex flex-col space-y-3 py-4">
            <Link href="/post" className="text-blue-700 hover:underline">
              Post a Listing
            </Link>
            <Link href="/browse" className="text-blue-700 hover:underline">
              Browse Categories
            </Link>
            <Link href="/about" className="text-blue-700 hover:underline">
              About
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link href="/profile" className="text-blue-700 hover:underline">
                  Profile
                </Link>
                <Link href="/my-listings" className="text-blue-700 hover:underline">
                  My Listings
                </Link>
                {(user?.role === 'super_admin' || user?.role === 'sub_admin') && (
                  <Link href="/admin/dashboard" className="text-blue-700 hover:underline">
                    Admin Dashboard
                  </Link>
                )}
                <Button 
                  onClick={logout}
                  variant="destructive"
                  className="w-full"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button 
                onClick={openLoginModal}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded w-full text-center"
              >
                Sign In
              </Button>
            )}
            
            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm text-gray-600 mb-2">Language:</p>
              <div className="flex space-x-4">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang)}
                    className={`text-sm ${lang.code === currentLanguage.code ? "font-medium" : ""}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

// src/components/Header.tsx

import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { LayoutDashboard, Home as HomeIcon, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/signin");
  };

  // Determine center title and link
  let centerTitle = null;
  if (user && location.pathname === "/") {
    centerTitle = (
      <Link to="/dashboard" className="flex items-center text-2xl font-bold">
        <span className="text-blue-600 mr-2 flex items-center"><LayoutDashboard className="w-7 h-7" /></span>
        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Dashboard</span>
      </Link>
    );
  } else if (user && location.pathname === "/dashboard") {
    centerTitle = (
      <Link to="/" className="flex items-center text-2xl font-bold">
        <span className="text-blue-600 mr-2 flex items-center"><HomeIcon className="w-7 h-7" /></span>
        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Home</span>
      </Link>
    );
  }

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-2 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        {/* Mobile: Centered logo/title and icons below */}
        <div className="flex flex-col w-full sm:w-auto sm:flex-row sm:justify-between sm:items-center">
          <div className="flex flex-col items-center w-full sm:flex-row sm:items-center sm:justify-start">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2 justify-center">
              <img src="/linksnap_icon.svg" alt="LinkSnap Icon" className="w-8 h-8" />
              LinkSnap
            </div>

            {/* Only show icon+label below on mobile if user is signed in */}
            {user && (
              <div className="flex gap-2 mt-2 sm:hidden items-center justify-center">
                {location.pathname === "/" && (
                  <Link
                    to="/dashboard"
                    className="flex items-center text-blue-600 hover:text-blue-800 transition"
                  >
                    <LayoutDashboard className="w-7 h-7 mr-1" />
                    <span className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Dashboard
                    </span>
                  </Link>
                )}
                {location.pathname === "/dashboard" && (
                  <Link
                    to="/"
                    className="flex items-center text-blue-600 hover:text-blue-800 transition"
                  >
                    <HomeIcon className="w-7 h-7 mr-1" />
                    <span className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Home
                    </span>
                  </Link>
                )}
              </div>
            )}
            
            {/* Show Sign In/Get Started below title if not signed in */}
            {!user && (
              <div className="flex flex-row gap-3 mt-6 w-full justify-center">
                <Link to="/signin">
                  <Button variant="ghost" className="w-28 hover:shadow-[0_0_16px_4px_rgba(139,92,246,0.5)] hover:bg-white/80 transition-all duration-300">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-32 hover:shadow-[0_0_24px_6px_rgba(59,130,246,0.6)] transition-all duration-300">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        {/* Centered clickable title for authenticated users on / or /dashboard (desktop only) */}
        <div className="flex-1 justify-center min-w-0 hidden sm:flex">
          {centerTitle}
        </div>
        {/* Authenticated user menu (desktop) */}
        {user && (
          <div className="flex justify-end items-center w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="font-medium flex items-center w-full max-w-full truncate"
                  style={{ minWidth: 0 }}
                >
                  <span className="truncate">Welcome, {user.displayName || user.email}</span>
                  <ChevronDown className="ml-1 w-4 h-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-full min-w-[10rem]">
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

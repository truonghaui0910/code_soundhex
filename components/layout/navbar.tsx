"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
import { supabase } from "@/lib/supabase/client";
import { Search } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
      }
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="border-b fixed top-0 left-0 right-0 bg-white z-50">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center">
        <Link href="/" className="flex items-center font-bold text-xl text-rose-600 mr-2 sm:mr-6">
            <Image
              src="/images/soundhex.png"
              alt="SoundHex Logo"
              width={32}
              height={32}
              className="mr-2"
            />
            SoundHex
          </Link>
        </div>
        
        <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
          {/* Desktop Search */}
          <div className="relative hidden sm:block w-full max-w-sm">
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 rounded-md"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          {/* Mobile Search Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="sm:hidden"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          {!loading && (
            <>
              {user ? (
                <UserNav user={user} />
              ) : (
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/register">Register</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Mobile Search Bar - Expandable */}
      {showSearch && (
        <div className="px-4 pb-3 sm:hidden">
          <Input
            type="search"
            placeholder="Search..."
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
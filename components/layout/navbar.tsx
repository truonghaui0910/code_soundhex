"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
import { SoundHexLogo } from "@/components/ui/soundhex-logo";
import { supabase } from "@/lib/supabase/client";

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      (event: string, session: any) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="border-b fixed top-0 left-0 right-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm z-50">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center mr-2 sm:mr-6">
            <SoundHexLogo size={50} showText={true} animated={true} />
          </Link>
        </div>

        <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
          {/* Upload Button */}
          <Button
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
            onClick={() => router.push("/music?tab=upload")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload
          </Button>

          {!loading && <UserNav user={user} />}
        </div>
      </div>
    </div>
  );
}

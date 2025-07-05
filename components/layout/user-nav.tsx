"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { User } from "@/hooks/use-current-user";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/hooks/use-user-role";

interface UserNavProps {
  user: User | null;
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { userRole } = useUserRole();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/login")}
          className="text-foreground hover:text-primary"
        >
          Login
        </Button>
        <Button
          size="sm"
          onClick={() => router.push("/register")}
          className="bg-primary hover:bg-primary/90"
        >
          Register
        </Button>
      </div>
    );
  }

  const userInitials = user.user_metadata?.name
    ? user.user_metadata.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.charAt(0).toUpperCase() || "U";

  const menuItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Music", href: "/music" },
    { label: "Agreements", href: "/agreements" },
    { label: "Sign out", action: handleSignOut, isSignOut: true },
  ].filter(item => {
    // Hide Dashboard for user role
    if (item.href === "/dashboard" && userRole === "user") {
      return false;
    }
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        className="relative h-8 w-8 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-md border bg-white dark:bg-gray-800 shadow-lg z-[9999]">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">
                  {user.user_metadata?.name || "User"}
                </p>
                <Badge variant={
                  userRole === 'admin' ? 'default' : 
                  userRole === 'music_provider' ? 'secondary' : 
                  'outline'
                } className="text-xs">
                  {userRole === 'admin' ? 'Admin' : 
                   userRole === 'music_provider' ? 'Provider' : 
                   'User'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          </div>

          <div className="py-1">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.isSignOut && index > 0 && (
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                )}
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.href) {
                      router.push(item.href);
                    }
                    setIsOpen(false);
                  }}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
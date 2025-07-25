"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Upload } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: "Music",
    href: "/music",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    title: "Your Library",
    href: "/library",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m16 6 4 14" />
        <path d="M12 6v14" />
        <path d="M8 8v12" />
        <path d="M4 4v16" />
      </svg>
    ),
  },
  {
    title: "Agreements",
    href: "/agreements",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
    ),
  },
  {
    title: "Upload Music",
    href: "/upload",
    icon: <Upload className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(64); // Default h-16 = 64px

  // Detect if mobile search is expanded and adjust sidebar position
  useEffect(() => {
    const updateNavbarHeight = () => {
      const navbar = document.querySelector(".border-b.fixed");
      if (navbar) {
        setNavbarHeight(navbar.clientHeight);
      }
    };

    // Initial check
    updateNavbarHeight();

    // Observer to detect height changes in navbar (for mobile search)
    if (typeof MutationObserver !== "undefined") {
      const navbar = document.querySelector(".border-b.fixed");
      if (navbar) {
        const observer = new MutationObserver(updateNavbarHeight);
        observer.observe(navbar, {
          attributes: true,
          childList: true,
          subtree: true,
        });
        return () => observer.disconnect();
      }
    }

    // Fallback for browsers without MutationObserver
    window.addEventListener("resize", updateNavbarHeight);
    return () => window.removeEventListener("resize", updateNavbarHeight);
  }, []);

  const { userRole } = useUser();

  const SidebarContent = () => {
    // Filter items based on user role
    const filteredItems = items.filter((item) => {
      // Hide protected routes for user role
      if (userRole === "user") {
        const protectedRoutes = ["/dashboard", "/agreements", "/upload"];
        if (protectedRoutes.some(route => item.href === route)) {
          return false;
        }
      }
      return true;
    });

    return (
      <div className="flex flex-col gap-2 p-4">
        <div className="font-semibold py-2 text-rose-600">Menu</div>
        {filteredItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-rose-600",
              pathname === item.href
                ? "bg-muted font-medium text-rose-600"
                : "text-muted-foreground",
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
      </div>
    );
  };

  // Mobile sidebar (drawer/sheet)
  const MobileSidebar = () => (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden ml-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-64 p-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
      >
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );

  // Desktop sidebar - Fixed position with dynamic top position
  const DesktopSidebar = () => (
    <div
      className="hidden md:block w-64 border-r bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm fixed left-0 overflow-y-auto"
      style={{
        top: `${navbarHeight}px`,
        height: `calc(100vh - ${navbarHeight}px)`,
      }}
    >
      <SidebarContent />
    </div>
  );

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  );
}

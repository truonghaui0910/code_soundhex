"use client";

import { useState, useEffect } from "react";
import { Music, Play, Users, TrendingUp, Headphones, Menu, X } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { UserNav } from "@/components/layout/user-nav";
import { SoundHexLogo } from "@/components/ui/soundhex-logo";

export default function Home() {
  const [visible, setVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    setVisible(true);
    console.log("Home page - User:", user, "Loading:", loading);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen) {
        const target = event.target as HTMLElement;
        const nav = document.querySelector('nav');
        if (nav && !nav.contains(target)) {
          setMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <SoundHexLogo size={50} showText={true} animated={true} />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4">
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center space-x-4">
                      <a
                        href="/dashboard"
                        className="px-4 py-2 text-foreground hover:text-primary transition-colors"
                      >
                        Dashboard
                      </a>
                      <UserNav user={user} />
                    </div>
                  ) : (
                    <>
                      <a
                        href="/login"
                        className="px-4 py-2 text-foreground hover:text-primary transition-colors"
                      >
                        Sign In
                      </a>
                      <a
                        href="/register"
                        className="btn-primary px-6 py-2 rounded-lg text-white font-medium"
                      >
                        Get Started
                      </a>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-foreground hover:text-primary transition-colors p-2"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/20 shadow-lg z-[100]">
            <div className="px-4 py-6 space-y-4">
              {!loading && (
                <>
                  {user ? (
                    <div className="space-y-4">
                      <a
                        href="/dashboard"
                        className="block px-4 py-3 text-foreground hover:text-primary hover:bg-card/50 rounded-lg transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </a>
                      <a
                        href="/music"
                        className="block px-4 py-3 text-foreground hover:text-primary hover:bg-card/50 rounded-lg transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Explore Music
                      </a>
                      <div className="pt-4 border-t border-border/20">
                        <UserNav user={user} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <a
                        href="/music"
                        className="block px-4 py-3 text-foreground hover:text-primary hover:bg-card/50 rounded-lg transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Explore Music
                      </a>
                      <a
                        href="#features"
                        className="block px-4 py-3 text-foreground hover:text-primary hover:bg-card/50 rounded-lg transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Features
                      </a>
                      <div className="pt-4 border-t border-border/20 space-y-3">
                        <a
                          href="/login"
                          className="block w-full px-4 py-3 text-center text-foreground hover:text-primary hover:bg-card/50 rounded-lg transition-all"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign In
                        </a>
                        <a
                          href="/register"
                          className="block w-full btn-primary px-4 py-3 rounded-lg text-white font-medium text-center"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Get Started
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div
              className={`transform transition-all duration-1000 ${visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Distribute Your <span className="gradient-text">Music</span>
                <br />
                <span className="gradient-text">Worldwide</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Professional music distribution platform for artists and
                creators. Upload once, distribute everywhere. Keep 100% of your
                royalties.
              </p>
            </div>

            <div
              className={`transform transition-all duration-1000 delay-300 ${visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <a
                  href="/register"
                  className="btn-primary px-8 py-4 rounded-lg text-white font-semibold text-lg animate-pulse-glow text-center"
                >
                  Start Distributing
                </a>
                <a
                  href="/music"
                  className="px-8 py-4 rounded-lg border border-border text-foreground hover:bg-card transition-all text-center"
                >
                  Explore Music
                </a>
              </div>
            </div>

            {/* Equalizer Animation */}
            <div
              className={`flex justify-center items-center space-x-2 mb-12 h-16 transform transition-all duration-1000 delay-500 ${visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              {[1, 2, 3, 4, 1, 2, 3, 4].map((num, idx) => (
                <div
                  key={idx}
                  className={`w-1 h-12 bg-music-gradient rounded-full animate-equalize-${num}`}
                  style={{
                    animationDelay: `${idx * 0.1}s`,
                    transformOrigin: "center",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Everything You <span className="gradient-text">Need</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional tools and services designed for modern music creators
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "100% Royalties",
                description:
                  "Keep everything you earn. No commission, no hidden fees.",
              },
              {
                icon: <Music className="w-8 h-8" />,
                title: "Unlimited Releases",
                description: "Upload as many songs and albums as you want.",
              },
              {
                icon: <Headphones className="w-8 h-8" />,
                title: "Fast Distribution",
                description:
                  "Get your music on all platforms in just a few days.",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Split Payments",
                description: "Share earnings with collaborators automatically.",
              },
              {
                icon: <Play className="w-8 h-8" />,
                title: "Real-time Analytics",
                description: "Track your performance across all platforms.",
              },
              {
                icon: <Music className="w-8 h-8" />,
                title: "Global Reach",
                description:
                  "Distribute to 150+ stores and streaming platforms.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="music-card p-8 rounded-xl group animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="music-card p-12 rounded-2xl">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Share Your <span className="gradient-text">Music</span>{" "}
              with the World?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join thousands of artists who trust SoundHex with their music
              distribution
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="btn-primary px-8 py-4 rounded-lg text-white font-semibold text-lg text-center"
              >
                Sign Up Now
              </a>
              <a
                href="/music"
                className="px-8 py-4 rounded-lg border border-border text-foreground hover:bg-card transition-all text-center"
              >
                Explore Music
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <SoundHexLogo size={32} showText={true} animated={false} />
            </div>
            <div className="flex space-x-8">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; 2024 SoundHex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { Music, Play, Users, TrendingUp, Headphones } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { UserNav } from '@/components/layout/user-nav';
import { SoundHexLogo } from '@/components/ui/soundhex-logo';

export default function Home() {
  const [visible, setVisible] = useState(false);
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    setVisible(true);
    console.log('Home page - User:', user, 'Loading:', loading);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <SoundHexLogo size={40} showText={true} animated={true} />
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a>
              <a href="#pricing" className="text-foreground hover:text-primary transition-colors">Pricing</a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
            </div>
            <div className="flex space-x-4">
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center space-x-4">
                      <a href="/dashboard" className="px-4 py-2 text-foreground hover:text-primary transition-colors">
                        Dashboard
                      </a>
                      <UserNav user={user} />
                    </div>
                  ) : (
                    <>
                      <a href="/login" className="px-4 py-2 text-foreground hover:text-primary transition-colors">
                        Sign In
                      </a>
                      <a href="/register" className="btn-primary px-6 py-2 rounded-lg text-white font-medium">
                        Get Started
                      </a>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className={`transform transition-all duration-1000 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Distribute Your <span className="gradient-text">Music</span>
                <br />
                <span className="gradient-text">Worldwide</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Professional music distribution platform for artists and creators. 
                Upload once, distribute everywhere. Keep 100% of your royalties.
              </p>
            </div>

            <div className={`transform transition-all duration-1000 delay-300 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <a href="/register" className="btn-primary px-8 py-4 rounded-lg text-white font-semibold text-lg animate-pulse-glow text-center">
                  Start Distributing
                </a>
                <button className="px-8 py-4 rounded-lg border border-border text-foreground hover:bg-card transition-all">
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Equalizer Animation */}
            <div className={`flex justify-center items-center space-x-2 mb-12 h-16 transform transition-all duration-1000 delay-500 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              {[1, 2, 3, 4, 1, 2, 3, 4].map((num, idx) => (
                <div
                  key={idx}
                  className={`w-1 h-12 bg-music-gradient rounded-full animate-equalize-${num}`}
                  style={{ 
                    animationDelay: `${idx * 0.1}s`,
                    transformOrigin: 'center'
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
                description: "Keep everything you earn. No commission, no hidden fees."
              },
              {
                icon: <Music className="w-8 h-8" />,
                title: "Unlimited Releases",
                description: "Upload as many songs and albums as you want."
              },
              {
                icon: <Headphones className="w-8 h-8" />,
                title: "Fast Distribution",
                description: "Get your music on all platforms in just a few days."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Split Payments",
                description: "Share earnings with collaborators automatically."
              },
              {
                icon: <Play className="w-8 h-8" />,
                title: "Real-time Analytics",
                description: "Track your performance across all platforms."
              },
              {
                icon: <Music className="w-8 h-8" />,
                title: "Global Reach",
                description: "Distribute to 150+ stores and streaming platforms."
              }
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
              Ready to Share Your <span className="gradient-text">Music</span> with the World?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join thousands of artists who trust SoundHex with their music distribution
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/register" className="btn-primary px-8 py-4 rounded-lg text-white font-semibold text-lg text-center">
                Sign Up Now
              </a>
              <button className="px-8 py-4 rounded-lg border border-border text-foreground hover:bg-card transition-all">
                Learn More
              </button>
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
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</a>
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
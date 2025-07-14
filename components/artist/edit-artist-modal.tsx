"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, X, ExternalLink, Check, AlertCircle, Instagram, Twitter, Facebook, Youtube, Music, Globe } from "lucide-react";

interface Artist {
  id: number;
  name: string;
  profile_image_url: string | null;
  bio: string | null;
  created_at: string | null;
  custom_url: string | null;
  social: string[] | null;
  user_id: string | null;
}

interface EditArtistModalProps {
  artist: Artist;
  onUpdate: (updatedArtist: Artist) => void;
}

const SOCIAL_PLATFORMS = [
  { 
    name: "Instagram", 
    icon: <div className="text-pink-500"><Instagram className="w-4 h-4" /></div>, 
    placeholder: "https://instagram.com/username",
    color: "hover:bg-pink-50 hover:border-pink-200 dark:hover:bg-pink-900/20 dark:hover:border-pink-600"
  },
  { 
    name: "Twitter", 
    icon: <div className="text-blue-400"><Twitter className="w-4 h-4" /></div>, 
    placeholder: "https://twitter.com/username",
    color: "hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-600"
  },
  { 
    name: "Facebook", 
    icon: <div className="text-blue-600"><Facebook className="w-4 h-4" /></div>, 
    placeholder: "https://facebook.com/username",
    color: "hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-600"
  },
  { 
    name: "YouTube", 
    icon: <div className="text-red-500"><Youtube className="w-4 h-4" /></div>, 
    placeholder: "https://youtube.com/c/username",
    color: "hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-600"
  },
  { 
    name: "TikTok", 
    icon: <div className="text-black dark:text-white">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    </div>, 
    placeholder: "https://tiktok.com/@username",
    color: "hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-600"
  },
  { 
    name: "Spotify", 
    icon: <div className="text-green-500">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.301 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    </div>, 
    placeholder: "https://open.spotify.com/artist/...",
    color: "hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:border-green-600"
  },
  { 
    name: "SoundCloud", 
    icon: <div className="text-orange-500">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.104.101.104.05 0 .093-.046.1-.104l.255-2.105-.255-2.154c-.007-.058-.05-.1-.1-.1zm1.73.027c-.058 0-.106.053-.113.12l-.193 2.128.193 2.042c.007.067.055.12.113.12.057 0 .105-.053.112-.12l.213-2.042-.213-2.128c-.007-.067-.055-.12-.112-.12zm1.73.013c-.067 0-.121.061-.129.136l-.172 2.115.172 2.019c.008.075.062.136.129.136.066 0 .12-.061.128-.136l.19-2.019-.19-2.115c-.008-.075-.062-.136-.128-.136zm1.73.026c-.075 0-.135.069-.143.154l-.152 2.089.152 1.999c.008.085.068.154.143.154.074 0 .135-.069.142-.154l.168-1.999-.168-2.089c-.007-.085-.068-.154-.142-.154zm1.73.022c-.083 0-.151.076-.16.17l-.133 2.067.133 1.977c.009.094.077.17.16.17.082 0 .15-.076.159-.17l.147-1.977-.147-2.067c-.009-.094-.077-.17-.159-.17zm1.73.018c-.091 0-.165.084-.175.188l-.114 2.049.114 1.955c.01.104.084.188.175.188.09 0 .164-.084.174-.188l.126-1.955-.126-2.049c-.01-.104-.084-.188-.174-.188zm1.73.014c-.1 0-.18.092-.191.206l-.095 2.035.095 1.934c.011.114.091.206.191.206.099 0 .179-.092.19-.206l.105-1.934-.105-2.035c-.011-.114-.091-.206-.19-.206zm1.73.01c-.108 0-.195.1-.207.223l-.075 2.021.075 1.913c.012.123.099.223.207.223.107 0 .194-.1.206-.223l.084-1.913-.084-2.021c-.012-.123-.099-.223-.206-.223zm1.73.007c-.116 0-.21.108-.223.24l-.056 2.007.056 1.892c.013.132.107.24.223.24.115 0 .209-.108.222-.24l.063-1.892-.063-2.007c-.013-.132-.107-.24-.222-.24zm1.73.004c-.124 0-.224.116-.238.258l-.037 1.993.037 1.87c.014.142.114.258.238.258.123 0 .223-.116.237-.258l.042-1.87-.042-1.993c-.014-.142-.114-.258-.237-.258zM18.01 9.188c-.381 0-.747.1-1.061.277a6.685 6.685 0 0 0-11.912 4.337l.016 4.026c.014.143.131.258.274.258h12.683c.694 0 1.26-.563 1.26-1.258v-6.382c0-.695-.566-1.258-1.26-1.258z"/>
      </svg>
    </div>, 
    placeholder: "https://soundcloud.com/username",
    color: "hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20 dark:hover:border-orange-600"
  },
  { 
    name: "Website", 
    icon: <div className="text-gray-600 dark:text-gray-400"><Globe className="w-4 h-4" /></div>, 
    placeholder: "https://yourwebsite.com",
    color: "hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-600"
  },
];

export function EditArtistModal({ artist, onUpdate }: EditArtistModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState(artist.custom_url || "");
  const [customUrlStatus, setCustomUrlStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [bio, setBio] = useState(artist.bio || "");
  const [socialLinks, setSocialLinks] = useState<string[]>(() => {
    if (Array.isArray(artist.social)) {
      return artist.social;
    }
    if (typeof artist.social === 'string') {
      try {
        const parsed = JSON.parse(artist.social);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [newSocialLink, setNewSocialLink] = useState("");

  const checkCustomUrl = async (url: string) => {
    if (!url) {
      setCustomUrlStatus("idle");
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(url)) {
      setCustomUrlStatus("invalid");
      return;
    }

    setCustomUrlStatus("checking");
    try {
      const response = await fetch("/api/artists/check-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ custom_url: url, exclude_id: artist.id }),
      });
      const data = await response.json();
      setCustomUrlStatus(data.available ? "available" : "taken");
    } catch (error) {
      console.error("Error checking URL:", error);
      setCustomUrlStatus("invalid");
    }
  };

  const handleCustomUrlChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9-_]/g, "");
    setCustomUrl(cleanValue);

    // Debounce URL checking
    const timeoutId = setTimeout(() => {
      checkCustomUrl(cleanValue);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const addSocialLink = () => {
    if (newSocialLink.trim() && !socialLinks.includes(newSocialLink.trim())) {
      setSocialLinks([...socialLinks, newSocialLink.trim()]);
      setNewSocialLink("");
    }
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (customUrlStatus === "taken" || customUrlStatus === "invalid") {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/artists/${artist.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custom_url: customUrl || null,
          social: socialLinks,
          bio: bio || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update artist");
      }

      const updatedArtistFromAPI = await response.json();

      // Parse social from JSON string if needed
      const updatedArtist = {
        ...updatedArtistFromAPI,
        social: typeof updatedArtistFromAPI.social === 'string' 
          ? JSON.parse(updatedArtistFromAPI.social || '[]')
          : updatedArtistFromAPI.social || []
      };

      onUpdate(updatedArtist);
      setOpen(false);

      // Redirect to custom URL if it was updated
      if (customUrl && customUrl !== artist.custom_url) {
        router.push(`/artist/${customUrl}`);
        return; // Don't reload, let Next.js handle the navigation
      }
    } catch (error) {
      console.error("Error updating artist:", error);
      alert(error instanceof Error ? error.message : "Failed to update artist");
    } finally {
      setLoading(false);
    }
  };

  const getUrlStatusIcon = () => {
    switch (customUrlStatus) {
      case "checking": return <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
      case "available": return <Check className="w-4 h-4 text-green-500" />;
      case "taken": return <X className="w-4 h-4 text-red-500" />;
      case "invalid": return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 border-0" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit Artist
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Artist Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Custom URL */}
          <div className="space-y-2">
            <Label htmlFor="custom-url">Custom URL</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">soundhex.com/artist/</span>
              <div className="flex-1 relative">
                <Input
                  id="custom-url"
                  value={customUrl}
                  onChange={(e) => handleCustomUrlChange(e.target.value)}
                  placeholder="your-artist-name"
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getUrlStatusIcon()}
                </div>
              </div>
            </div>
            {customUrl && (
              <div className="text-xs">
                {customUrlStatus === "available" && (
                  <span className="text-green-600">✓ URL is available</span>
                )}
                {customUrlStatus === "taken" && (
                  <span className="text-red-600">✗ URL is already taken</span>
                )}
                {customUrlStatus === "invalid" && (
                  <span className="text-red-600">✗ Only lowercase letters, numbers, hyphens, and underscores allowed</span>
                )}
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about this artist..."
              rows={4}
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <Label>Social Links</Label>

            {/* Quick Add Buttons */}
            <div className="flex flex-wrap gap-2">
              {SOCIAL_PLATFORMS.map((platform) => (
                <Button
                  key={platform.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewSocialLink(platform.placeholder)}
                  className={`justify-start whitespace-nowrap min-w-fit transition-colors ${platform.color}`}
                >
                  <span className="mr-2">{platform.icon}</span>
                  <span className="truncate">{platform.name}</span>
                </Button>
              ))}
            </div>

            {/* Add New Link */}
            <div className="flex space-x-2">
              <Input
                value={newSocialLink}
                onChange={(e) => setNewSocialLink(e.target.value)}
                placeholder="https://..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSocialLink();
                  }
                }}
                className="h-10"
              />
              <Button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  addSocialLink();
                }} 
                size="sm"
                className="h-10 w-10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Current Links */}
            {Array.isArray(socialLinks) && socialLinks.length > 0 && (
              <div className="space-y-2">
                {socialLinks.map((link, index) => {
                  // Find matching platform for icon
                  const matchedPlatform = SOCIAL_PLATFORMS.find(platform => {
                    if (link.includes('instagram.com')) return platform.name === 'Instagram';
                    if (link.includes('twitter.com') || link.includes('x.com')) return platform.name === 'Twitter';
                    if (link.includes('facebook.com')) return platform.name === 'Facebook';
                    if (link.includes('youtube.com')) return platform.name === 'YouTube';
                    if (link.includes('tiktok.com')) return platform.name === 'TikTok';
                    if (link.includes('spotify.com')) return platform.name === 'Spotify';
                    if (link.includes('soundcloud.com')) return platform.name === 'SoundCloud';
                    return platform.name === 'Website';
                  });

                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {matchedPlatform ? matchedPlatform.icon : <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                        <span className="text-sm truncate">{link}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSocialLink(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || customUrlStatus === "taken" || customUrlStatus === "invalid"}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, X, ExternalLink, Check, AlertCircle } from "lucide-react";

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
  { name: "Instagram", icon: "📷", placeholder: "https://instagram.com/username" },
  { name: "Twitter", icon: "🐦", placeholder: "https://twitter.com/username" },
  { name: "Facebook", icon: "📘", placeholder: "https://facebook.com/username" },
  { name: "YouTube", icon: "📺", placeholder: "https://youtube.com/c/username" },
  { name: "TikTok", icon: "🎵", placeholder: "https://tiktok.com/@username" },
  { name: "Spotify", icon: "🟢", placeholder: "https://open.spotify.com/artist/..." },
  { name: "SoundCloud", icon: "🟠", placeholder: "https://soundcloud.com/username" },
  { name: "Website", icon: "🌐", placeholder: "https://yourwebsite.com" },
];

export function EditArtistModal({ artist, onUpdate }: EditArtistModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState(artist.custom_url || "");
  const [customUrlStatus, setCustomUrlStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [bio, setBio] = useState(artist.bio || "");
  const [socialLinks, setSocialLinks] = useState<string[]>(artist.social || []);
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
        const error = await response.json();
        throw new Error(error.error || "Failed to update artist");
      }

      const updatedArtist = await response.json();
      onUpdate(updatedArtist);
      setOpen(false);
      
      // Redirect to custom URL if it was updated
      if (customUrl && customUrl !== artist.custom_url) {
        router.push(`/artist/${customUrl}`);
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
        <Button variant="outline" size="sm">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SOCIAL_PLATFORMS.map((platform) => (
                <Button
                  key={platform.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewSocialLink(platform.placeholder)}
                  className="justify-start"
                >
                  <span className="mr-2">{platform.icon}</span>
                  {platform.name}
                </Button>
              ))}
            </div>

            {/* Add New Link */}
            <div className="flex space-x-2">
              <Input
                value={newSocialLink}
                onChange={(e) => setNewSocialLink(e.target.value)}
                placeholder="https://..."
                onKeyPress={(e) => e.key === "Enter" && addSocialLink()}
              />
              <Button type="button" onClick={addSocialLink} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Current Links */}
            {socialLinks.length > 0 && (
              <div className="space-y-2">
                {socialLinks.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm truncate">{link}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSocialLink(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
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

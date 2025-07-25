
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

interface CreatePlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlaylistCreated?: (playlist: any) => void;
}

interface PlaylistFormData {
  name: string;
  isPublic: boolean;
  shuffleEnabled: boolean;
}

export function CreatePlaylistModal({
  open,
  onOpenChange,
  onPlaylistCreated,
}: CreatePlaylistModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<PlaylistFormData>({
    name: "",
    isPublic: true,
    shuffleEnabled: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Playlist name is required");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          private: !formData.isPublic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          toast.error("A playlist with this name already exists");
          return;
        }
        throw new Error(errorData.error || "Failed to create playlist");
      }

      const newPlaylist = await response.json();
      onOpenChange(false);
      setFormData({ name: "", isPublic: true, shuffleEnabled: true });
      toast.success("Playlist created successfully!");
      
      if (onPlaylistCreated) {
        onPlaylistCreated(newPlaylist);
      }
    } catch (error: any) {
      console.error("Error creating playlist:", error);
      toast.error(error.message || "Failed to create playlist");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFormData({ name: "", isPublic: true, shuffleEnabled: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 border-purple-500 text-white">
        <DialogHeader className="relative">
          <button 
            onClick={handleCancel}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
          <DialogTitle className="text-center text-xl font-bold text-white">
            Create New Playlist
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Playlist Name Input */}
          <div className="space-y-2">
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              placeholder="Enter playlist name"
              className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:border-white/50 focus:ring-white/30"
              required
            />
          </div>

          {/* Public Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Public</h3>
                <p className="text-sm text-white/80">Anyone can see this playlist</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isPublic ? 'bg-pink-500' : 'bg-white/30'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Create Button */}
          <Button 
            type="submit" 
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 rounded-full transition-all duration-200 transform hover:scale-105"
          >
            {isCreating ? (
              <>
                <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              "CREATE"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

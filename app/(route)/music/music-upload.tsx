
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowLeft, Music, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/hooks/use-current-user";

export function MusicUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent('/music/upload')}`);
    }
  }, [user, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Here you would implement actual file upload logic
      console.log("File uploaded:", file.name);
      
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Upload Music
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
                Share your music with the world
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-white/20 dark:border-gray-700/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-6 w-6" />
                Track Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="audio-file">Audio File</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors">
                  <input
                    id="audio-file"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label htmlFor="audio-file" className="cursor-pointer">
                    <div className="flex flex-col items-center space-y-2">
                      {isUploading ? (
                        <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
                      ) : (
                        <Upload className="h-12 w-12 text-gray-400" />
                      )}
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {isUploading ? (
                          <div>
                            <p>Uploading... {uploadProgress}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">Click to upload audio file</p>
                            <p>MP3, WAV, FLAC up to 100MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Track Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Track Title</Label>
                  <Input id="title" placeholder="Enter track title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist Name</Label>
                  <Input id="artist" placeholder="Enter artist name" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="album">Album</Label>
                  <Input id="album" placeholder="Enter album name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input id="genre" placeholder="Enter genre" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Tell us about your track..."
                  rows={4}
                />
              </div>

              {/* Cover Art Upload */}
              <div className="space-y-2">
                <Label htmlFor="cover">Cover Art</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors">
                  <input
                    id="cover"
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                  <label htmlFor="cover" className="cursor-pointer">
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium">Upload cover art</p>
                        <p>JPG, PNG up to 10MB</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Track
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

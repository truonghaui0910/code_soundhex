"use client";

import { useState, useEffect } from "react";
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
import { Track } from "@/lib/definitions/Track";
import { MoodGrid } from "./mood-grid";
import { showSuccess, showError } from "@/lib/services/notification-service";

interface EditTrackModalProps {
    track: Track;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedTrack: Track) => void;
}

export function EditTrackModal({
    track,
    isOpen,
    onClose,
    onUpdate,
}: EditTrackModalProps) {
    const [customUrl, setCustomUrl] = useState(track.custom_url || "");
    const [selectedMoods, setSelectedMoods] = useState<Set<string>>(
        new Set(track.mood || []),
    );
    const [isLoading, setIsLoading] = useState(false);
    const [urlError, setUrlError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setCustomUrl(track.custom_url || "");
            setSelectedMoods(new Set(track.mood || []));
            setUrlError("");
        }
    }, [isOpen, track]);

    const validateCustomUrl = async (url: string) => {
        if (!url) return true;

        // Check format
        const urlRegex = /^[a-z0-9-]+$/;
        if (!urlRegex.test(url)) {
            setUrlError(
                "URL can only contain lowercase letters, numbers, and hyphens",
            );
            return false;
        }

        // Check if URL is already taken (excluding current track)
        try {
            const response = await fetch(
                `/api/tracks/check-url?custom_url=${encodeURIComponent(url)}&exclude_id=${track.id}`,
            );
            const data = await response.json();

            if (!data.available) {
                setUrlError("This URL is already taken");
                return false;
            }
        } catch (error) {
            console.error("Error checking URL:", error);
        }

        setUrlError("");
        return true;
    };

    const handleCustomUrlChange = (value: string) => {
        setCustomUrl(value);
        if (value) {
            validateCustomUrl(value);
        } else {
            setUrlError("");
        }
    };

    const handleMoodToggle = (moodId: string) => {
        const newSelected = new Set(selectedMoods);
        if (newSelected.has(moodId)) {
            newSelected.delete(moodId);
        } else {
            newSelected.add(moodId);
        }
        setSelectedMoods(newSelected);
    };

    const handleSave = async () => {
        if (urlError) return;

        if (customUrl && !(await validateCustomUrl(customUrl))) {
            return;
        }

        setIsLoading(true);
        try {
            const updateData = {
                custom_url: customUrl || null,
                mood: Array.from(selectedMoods),
            };
            
            console.log("Updating track with data:", updateData);
            
            const response = await fetch(`/api/tracks/${track.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update track");
            }

            const updatedTrack = await response.json();

            showSuccess({
                title: "Success!",
                message: "Track updated successfully",
            });

            onUpdate(updatedTrack);
            onClose();
        } catch (error: any) {
            console.error("Error updating track:", error);
            showError({
                title: "Error",
                message: error.message || "Failed to update track",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-purple-900 border border-purple-700">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Edit Track: {track.title}
                    </DialogTitle>
                    <DialogDescription>
                        Update your track's custom URL and mood tags.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Custom URL Section */}
                    <div className="space-y-2">
                        <Label htmlFor="custom_url">Custom URL</Label>
                        <div className="text-sm text-gray-500 mb-2">
                            Choose a custom URL for your track (optional)
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                                soundhex.com/track/
                            </span>
                            <Input
                                id="custom_url"
                                value={customUrl}
                                onChange={(e) =>
                                    handleCustomUrlChange(e.target.value)
                                }
                                placeholder="my-awesome-track"
                                className="flex-1"
                            />
                        </div>
                        {urlError && (
                            <p className="text-sm text-red-500">{urlError}</p>
                        )}
                    </div>

                    {/* Mood Selection */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-lg font-semibold">
                                Mood Tags
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                                Select moods that best describe your track
                            </p>
                        </div>

                        <MoodGrid
                            selectedMoods={selectedMoods}
                            onMoodToggle={handleMoodToggle}
                            isModal={true}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                        />

                        {selectedMoods.size > 0 && (
                            <div className="text-sm text-gray-600">
                                Selected: {Array.from(selectedMoods).join(", ")}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading || !!urlError}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

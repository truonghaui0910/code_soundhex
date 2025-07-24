
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { MoodGrid } from "./mood-grid";
import { X } from "lucide-react";

interface MoodFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedMoods: Set<string>;
    onApply: (moods: Set<string>) => void;
}

export function MoodFilterModal({ 
    isOpen, 
    onClose, 
    selectedMoods, 
    onApply 
}: MoodFilterModalProps) {
    const [tempSelectedMoods, setTempSelectedMoods] = useState<Set<string>>(new Set(selectedMoods));

    const handleMoodToggle = (moodId: string) => {
        const newSelected = new Set(tempSelectedMoods);
        if (newSelected.has(moodId)) {
            newSelected.delete(moodId);
        } else {
            newSelected.add(moodId);
        }
        setTempSelectedMoods(newSelected);
    };

    const handleApply = () => {
        onApply(tempSelectedMoods);
        onClose();
    };

    const handleClear = () => {
        setTempSelectedMoods(new Set());
    };

    const handleClose = () => {
        setTempSelectedMoods(new Set(selectedMoods)); // Reset to original selection
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-purple-900 border border-purple-700">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Select Moods
                            </DialogTitle>
                            <DialogDescription className="mt-2">
                                Choose multiple moods to filter your music. Selected moods will be highlighted.
                            </DialogDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="py-6">
                    <MoodGrid
                        selectedMoods={tempSelectedMoods}
                        onMoodToggle={handleMoodToggle}
                        isModal={true}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                    />
                </div>

                <DialogFooter className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {tempSelectedMoods.size} mood(s) selected
                        </span>
                        {tempSelectedMoods.size > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClear}
                            >
                                Clear All
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApply}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

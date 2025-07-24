
"use client";

import { useState, memo } from "react";
import { 
    Smile, 
    Cloud, 
    Zap, 
    Coffee, 
    Sparkles, 
    Bot, 
    Shield, 
    Activity, 
    Umbrella, 
    Eye, 
    Camera, 
    Frown 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Mood {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    textColor: string;
}

interface MoodGridProps {
    onMoodSelect?: (mood: Mood) => void;
    className?: string;
}

const moods: Mood[] = [
    {
        id: "happy",
        name: "Happy",
        icon: Smile,
        bgColor: "bg-gradient-to-br from-green-400 to-green-500",
        textColor: "text-green-700"
    },
    {
        id: "dreamy",
        name: "Dreamy",
        icon: Cloud,
        bgColor: "bg-gradient-to-br from-pink-400 to-pink-500",
        textColor: "text-pink-700"
    },
    {
        id: "epic",
        name: "Epic",
        icon: Zap,
        bgColor: "bg-gradient-to-br from-orange-400 to-orange-500",
        textColor: "text-orange-700"
    },
    {
        id: "laid-back",
        name: "Laid Back",
        icon: Coffee,
        bgColor: "bg-gradient-to-br from-yellow-400 to-yellow-500",
        textColor: "text-yellow-700"
    },
    {
        id: "euphoric",
        name: "Euphoric",
        icon: Sparkles,
        bgColor: "bg-gradient-to-br from-purple-400 to-purple-500",
        textColor: "text-purple-700"
    },
    {
        id: "quirky",
        name: "Quirky",
        icon: Bot,
        bgColor: "bg-gradient-to-br from-indigo-400 to-indigo-500",
        textColor: "text-indigo-700"
    },
    {
        id: "suspense",
        name: "Suspense",
        icon: Shield,
        bgColor: "bg-gradient-to-br from-gray-500 to-gray-600",
        textColor: "text-gray-700"
    },
    {
        id: "running",
        name: "Running",
        icon: Activity,
        bgColor: "bg-gradient-to-br from-lime-400 to-lime-500",
        textColor: "text-lime-700"
    },
    {
        id: "relaxing",
        name: "Relaxing",
        icon: Umbrella,
        bgColor: "bg-gradient-to-br from-teal-400 to-teal-500",
        textColor: "text-teal-700"
    },
    {
        id: "mysterious",
        name: "Mysterious",
        icon: Eye,
        bgColor: "bg-gradient-to-br from-violet-400 to-violet-500",
        textColor: "text-violet-700"
    },
    {
        id: "sentimental",
        name: "Sentimental",
        icon: Camera,
        bgColor: "bg-gradient-to-br from-cyan-400 to-cyan-500",
        textColor: "text-cyan-700"
    },
    {
        id: "sad",
        name: "Sad",
        icon: Frown,
        bgColor: "bg-gradient-to-br from-red-400 to-red-500",
        textColor: "text-red-700"
    }
];

const MoodGrid = memo(function MoodGrid({ 
    onMoodSelect,
    className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
}: MoodGridProps) {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

    const handleMoodClick = (mood: Mood) => {
        setSelectedMood(mood.id);
        onMoodSelect?.(mood);
        console.log(`Selected mood: ${mood.name}`);
    };

    return (
        <div className={className}>
            {moods.map((mood) => {
                const IconComponent = mood.icon;
                return (
                    <div 
                        key={mood.id} 
                        className="group text-center cursor-pointer transition-all duration-300 rounded-2xl p-4 hover:bg-white/20"
                        onClick={() => handleMoodClick(mood)}
                    >
                        <div className="relative mb-4 flex justify-center">
                            <div
                                className={`
                                    relative shadow-lg transition-all duration-300 transform 
                                    group-hover:scale-105 
                                    ${mood.bgColor}
                                    ${selectedMood === mood.id ? 'ring-4 ring-purple-500 ring-offset-2' : ''}
                                `}
                                style={{
                                    width: '160px',
                                    height: '160px',
                                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
                                }}
                            >
                                {/* Icon */}
                                <div className="flex items-center justify-center h-full">
                                    <IconComponent className="h-20 w-20 text-white drop-shadow-lg" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <h3 className={`
                                font-bold text-sm sm:text-base transition-colors truncate
                                ${selectedMood === mood.id 
                                    ? 'text-purple-600 dark:text-purple-400' 
                                    : `${mood.textColor} dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400`
                                }
                            `}>
                                {mood.name}
                            </h3>
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

MoodGrid.displayName = 'MoodGrid';

export { MoodGrid };


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
        bgColor: "bg-green-400",
        textColor: "text-green-900"
    },
    {
        id: "dreamy",
        name: "Dreamy",
        icon: Cloud,
        bgColor: "bg-pink-400",
        textColor: "text-pink-900"
    },
    {
        id: "epic",
        name: "Epic",
        icon: Zap,
        bgColor: "bg-orange-400",
        textColor: "text-orange-900"
    },
    {
        id: "laid-back",
        name: "Laid Back",
        icon: Coffee,
        bgColor: "bg-yellow-400",
        textColor: "text-yellow-900"
    },
    {
        id: "euphoric",
        name: "Euphoric",
        icon: Sparkles,
        bgColor: "bg-pink-400",
        textColor: "text-pink-900"
    },
    {
        id: "quirky",
        name: "Quirky",
        icon: Bot,
        bgColor: "bg-orange-400",
        textColor: "text-orange-900"
    },
    {
        id: "suspense",
        name: "Suspense",
        icon: Shield,
        bgColor: "bg-gray-400",
        textColor: "text-gray-900"
    },
    {
        id: "running",
        name: "Running",
        icon: Activity,
        bgColor: "bg-lime-400",
        textColor: "text-lime-900"
    },
    {
        id: "relaxing",
        name: "Relaxing",
        icon: Umbrella,
        bgColor: "bg-teal-300",
        textColor: "text-teal-900"
    },
    {
        id: "mysterious",
        name: "Mysterious",
        icon: Eye,
        bgColor: "bg-purple-400",
        textColor: "text-purple-900"
    },
    {
        id: "sentimental",
        name: "Sentimental",
        icon: Camera,
        bgColor: "bg-cyan-400",
        textColor: "text-cyan-900"
    },
    {
        id: "sad",
        name: "Sad",
        icon: Frown,
        bgColor: "bg-red-400",
        textColor: "text-red-900"
    }
];

const MoodGrid = memo(function MoodGrid({ 
    onMoodSelect,
    className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
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
                    <div key={mood.id} className="group text-center">
                        <div className="relative mb-3">
                            <Button
                                onClick={() => handleMoodClick(mood)}
                                className={`
                                    relative w-full aspect-square p-0 border-none shadow-lg 
                                    hover:shadow-xl transition-all duration-300 transform 
                                    hover:-translate-y-1 hover:scale-105 
                                    ${mood.bgColor} hover:brightness-110
                                    ${selectedMood === mood.id ? 'ring-4 ring-purple-500 ring-offset-2' : ''}
                                `}
                                style={{
                                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                                    minHeight: '80px'
                                }}
                            >
                                {/* Hexagonal background overlay for better icon visibility */}
                                <div 
                                    className="absolute inset-0 bg-white/20 backdrop-blur-sm"
                                    style={{
                                        clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
                                    }}
                                />
                                
                                {/* Icon */}
                                <div className="relative z-10 flex items-center justify-center h-full">
                                    <IconComponent className="h-8 w-8 sm:h-10 sm:w-10 text-white drop-shadow-lg" />
                                </div>

                                {/* Hover effect overlay */}
                                <div 
                                    className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
                                    }}
                                />
                            </Button>
                        </div>
                        
                        <div className="space-y-1">
                            <h3 className={`
                                font-semibold text-sm sm:text-base transition-colors truncate
                                ${selectedMood === mood.id 
                                    ? 'text-purple-600 dark:text-purple-400' 
                                    : 'text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400'
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

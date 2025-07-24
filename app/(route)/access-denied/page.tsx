
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Lock, Home } from "lucide-react";
import { SoundHexLogo } from "@/components/ui/soundhex-logo";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    // Update countdown every second
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/music");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center p-4">
      {/* Main Content */}
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <SoundHexLogo size={100} showText={false} animated={true} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            SoundHex
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Access Restricted Area
          </p>
        </div>

        {/* Access Denied Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8">
          {/* Icon and Main Title */}
          <div className="text-center mb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access this page
            </p>
          </div>

          {/* Error Message */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                🎵 <strong>Sorry!</strong> This page is restricted to users with special permissions. 
                To access features like music upload, dashboard management, or view contracts, 
                you need <span className="font-semibold text-red-600 dark:text-red-400">Music Provider</span> role or higher.
              </p>
              
              <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mt-4">
                💡 <strong>Tip:</strong> Contact the administrator to get access permissions if you need to use these features.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              onClick={() => router.push("/music")} 
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Music
            </Button>

            <Button 
              onClick={() => router.push("/")} 
              className="w-full h-11 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all duration-300 shadow-lg border border-gray-200 dark:border-gray-600"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </div>

          {/* Auto Redirect Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              🕒 Automatically redirecting to music page in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

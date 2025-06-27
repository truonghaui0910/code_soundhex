
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MusicUpload } from "./music-upload";
import { toast } from "sonner";

interface Agreement {
  id: number;
  status: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [isValidated, setIsValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    
    const validateAgreements = async () => {
      try {
        const response = await fetch("/api/agreements/list");
        
        if (!response.ok) {
          throw new Error("Failed to fetch agreements");
        }

        const data = await response.json();
        const agreements: Agreement[] = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        
        // Check if there's at least one completed agreement
        const hasCompletedAgreement = agreements.some(
          agreement => agreement.status.toLowerCase() === 'completed'
        );

        if (isCancelled) return; // Prevent state updates if component unmounted

        if (!hasCompletedAgreement) {
          toast.error("You need at least one completed agreement before uploading music");
          router.push("/agreements");
          return;
        }

        setIsValidated(true);
      } catch (error) {
        if (isCancelled) return;
        
        console.error("Error validating agreements:", error);
        toast.error("Failed to validate agreements");
        router.push("/agreements");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    validateAgreements();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isValidated) {
    return null; // Will redirect to agreements page
  }

  return <MusicUpload />;
}

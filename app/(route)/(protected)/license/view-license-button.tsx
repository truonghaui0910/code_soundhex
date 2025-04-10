"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
import { toast } from "sonner";

interface ViewLicenseButtonProps {
  licenseId: number;
}

export function ViewLicenseButton({ licenseId }: ViewLicenseButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleViewLicense = async () => {
    try {
      setLoading(true);
      
      // Gọi API từ server để lấy URL tài liệu
      const response = await fetch(`/api/license/${licenseId}/document`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.documentUrl) {
        throw new Error("Document not available");
      }
      
      // Mở tab mới với URL tài liệu
      window.open(data.documentUrl, '_blank');
    } catch (error) {
      console.error("Failed to get document URL:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get document URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleViewLicense}
      disabled={loading}
      title="View License"
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <EyeIcon className="h-4 w-4" />
      )}
    </Button>
  );
}
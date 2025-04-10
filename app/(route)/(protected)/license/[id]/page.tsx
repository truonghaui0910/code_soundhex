"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReloadIcon, ChevronLeftIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface LicenseDetail {
  id: number;
  slug: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  audit_log_url: string | null;
  submitters: Array<{
    id: number;
    name: string | null;
    email: string;
    status: string;
    completed_at: string | null;
    role: string;
  }>;
  template: {
    name: string;
  };
  created_by_user: {
    email: string;
    first_name: string;
    last_name: string;
  }
}

export default function LicenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [license, setLicense] = useState<LicenseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLicenseDetails = async () => {
      try {
        setLoading(true);
        setError("");
        
        console.log(`Fetching license details for ID: ${id}`);
        const response = await fetch(`/api/license/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.error || `Error: ${response.status}`;
          console.error(`Error response: ${errorMessage}`);
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log("License data received:", result);
        
        // Xử lý dữ liệu linh hoạt (có thể nằm trong result hoặc result.data)
        const licenseData = result.data || result;
        
        if (!licenseData) {
          throw new Error("Invalid data structure returned from API");
        }
        
        setLicense(licenseData);
      } catch (err) {
        console.error("Failed to fetch license details:", err);
        setError(`Failed to load license details: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLicenseDetails();
    }
  }, [id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Button 
        variant="outline" 
        className="mb-6" 
        onClick={() => router.back()}
      >
        <ChevronLeftIcon className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">License Details</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <ReloadIcon className="mr-2 h-6 w-6 animate-spin" />
          <span>Loading license details...</span>
        </div>
      ) : license ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>License Information</CardTitle>
              <CardDescription>
                License #{license.id} - {license.template.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(license.status)}>
                      {license.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created By</Label>
                  <div className="mt-1 text-sm">
                    {license.created_by_user.first_name} {license.created_by_user.last_name} ({license.created_by_user.email})
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created At</Label>
                  <div className="mt-1 text-sm">{formatDate(license.created_at)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Completed At</Label>
                  <div className="mt-1 text-sm">{formatDate(license.completed_at)}</div>
                </div>
                {license.audit_log_url && license.status.toLowerCase() === "completed" && (
                  <div className="col-span-1 md:col-span-2">
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(license.audit_log_url, '_blank')}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                        <path d="M16 13H8" />
                        <path d="M16 17H8" />
                        <path d="M10 9H8" />
                      </svg>
                      View Audit Log
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submitters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {license.submitters.map((submitter) => (
                  <div key={submitter.id} className="p-4 border rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <div className="mt-1 text-sm">{submitter.name || "N/A"}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <div className="mt-1 text-sm">{submitter.email}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Role</Label>
                        <div className="mt-1 text-sm">{submitter.role}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="mt-1">
                          <Badge className={getStatusColor(submitter.status)}>
                            {submitter.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Completed At</Label>
                        <div className="mt-1 text-sm">{formatDate(submitter.completed_at)}</div>
                      </div>
                      {submitter.status.toLowerCase() === "pending" && (
                        <div className="md:text-right md:self-end">
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={() => window.open(`https://docs.360digital.fm/s/${submitter.slug || license.slug}`, '_blank')}
                          >
                            Sign Now
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Alert>
          <AlertTitle>No data found</AlertTitle>
          <AlertDescription>Could not find license details for this ID.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
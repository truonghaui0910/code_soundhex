"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  showError,
  showSuccess,
  showAgreementSuccess,
} from "@/lib/services/notification-service";
import {
  FileText,
  Plus,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Types for API response
interface Submitter {
  id: number;
  slug: string;
  uuid: string;
  name: string | null;
  email: string;
  status: string;
  completed_at: string | null;
  role: string;
}

interface Agreement {
  id: number;
  slug: string;
  created_at: string;
  updated_at: string;
  status: string;
  completed_at: string | null;
  audit_log_url: string | null;
  combined_document_url: string | null;
  submitters: Submitter[];
  template: {
    id: number;
    name: string;
  };
  created_by_user: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export default function AgreementsList() {
  const router = useRouter();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch agreements from our backend API
  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/agreements/list");

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Agreements data:", data);

      // Check if data has the expected structure
      if (Array.isArray(data.data)) {
        setAgreements(data.data);
      } else if (Array.isArray(data)) {
        setAgreements(data);
      } else {
        console.error("Unexpected data structure:", data);
        setAgreements([]);
        setError("Received invalid data format from API");
      }
    } catch (err) {
      console.error("Failed to fetch agreements:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date string
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Get status badge color and icon
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return {
          color:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
          icon: CheckCircle,
        };
      case "pending":
        return {
          color:
            "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
          icon: Clock,
        };
      case "declined":
        return {
          color:
            "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
          icon: XCircle,
        };
      default:
        return {
          color:
            "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
          icon: Clock,
        };
    }
  };

  // View agreement details
  const viewAgreementDetails = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setDialogOpen(true);
  };

  // Navigate to sign page
  const goToSignPage = (slug: string) => {
    window.open(`https://docs.360digital.fm/s/${slug}`, "_blank");
  };

  // Download document
  const downloadDocument = async (agreementId: number) => {
    try {
      const response = await fetch(`/api/agreements?id=${agreementId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch document info: ${response.status}`);
      }
      const data = await response.json();

      // Get document URL from documents array
      if (
        data &&
        data.documents &&
        data.documents.length > 0 &&
        data.documents[0].url
      ) {
        window.open(data.documents[0].url, "_blank");
      } else if (data && data.audit_log_url) {
        // Fallback to audit_log_url if documents array doesn't have URL
        window.open(data.audit_log_url, "_blank");
      } else {
        showError("Document not available");
      }
    } catch (error: any) {
      console.error("Error downloading document:", error);
      showError({
        title: "❌ Document Download Error",
        message:
          error.message || "Failed to download document. Please try again.",
      });
    }
  };

  // Create new agreement
  const createNewAgreement = () => {
    router.push("/agreements/create");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-10 w-10 text-purple-300" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Agreements
              </h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              Manage and track your legal agreements • Digital signatures •
              Document control
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={createNewAgreement}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Agreement
              </Button>
              <Button
                variant="outline"
                onClick={fetchAgreements}
                disabled={isLoading}
                className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Agreements
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {agreements.length}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Completed
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {
                        agreements.filter(
                          (a) => a.status.toLowerCase() === "completed",
                        ).length
                      }
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Pending
                    </p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {
                        agreements.filter(
                          (a) => a.status.toLowerCase() === "pending",
                        ).length
                      }
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agreements Table */}
          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Your Agreements
              </CardTitle>
              <CardDescription>
                View and manage all your agreements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
                  <p className="font-medium">Error loading agreements</p>
                  <p className="text-sm mt-2">{error}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={fetchAgreements}
                  >
                    Try Again
                  </Button>
                </div>
              ) : agreements.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No agreements found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Create your first agreement to get started.
                  </p>
                  <Button onClick={createNewAgreement}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Agreement
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agreements.map((agreement) => {
                        const statusInfo = getStatusInfo(agreement.status);
                        const StatusIcon = statusInfo.icon;
                        return (
                          <TableRow
                            key={agreement.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <TableCell className="font-medium">
                              {agreement.id}
                            </TableCell>
                            <TableCell>
                              {agreement.submitters[0]?.email || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusInfo.color}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {agreement.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDate(agreement.created_at)}
                            </TableCell>
                            <TableCell>
                              {formatDate(agreement.completed_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                {agreement.status.toLowerCase() ===
                                  "pending" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const submitterSlug =
                                        agreement.submitters[0]?.slug;
                                      if (submitterSlug) {
                                        goToSignPage(submitterSlug);
                                      } else {
                                        showError("submiter is not found");
                                      }
                                    }}
                                  >
                                    <Edit className="mr-1 h-3 w-3" />
                                    Sign
                                  </Button>
                                )}

                                {agreement.status.toLowerCase() ===
                                  "completed" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      downloadDocument(agreement.id)
                                    }
                                  >
                                    <Download className="mr-1 h-3 w-3" />
                                    Document
                                  </Button>
                                )}

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    viewAgreementDetails(agreement)
                                  }
                                >
                                  <Eye className="mr-1 h-3 w-3" />
                                  Details
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agreement Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedAgreement && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Agreement Details
                </DialogTitle>
                <DialogDescription>
                  ID: {selectedAgreement.id} - Created on{" "}
                  {formatDate(selectedAgreement.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Template
                    </h3>
                    <p className="text-lg font-semibold">
                      {selectedAgreement.template.name}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </h3>
                    <Badge
                      className={getStatusInfo(selectedAgreement.status).color}
                    >
                      {selectedAgreement.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Created By
                  </h3>
                  <p>
                    {selectedAgreement.created_by_user.first_name}{" "}
                    {selectedAgreement.created_by_user.last_name} (
                    {selectedAgreement.created_by_user.email})
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Submitters
                  </h3>
                  <div className="space-y-3">
                    {selectedAgreement.submitters.map((submitter) => {
                      const statusInfo = getStatusInfo(submitter.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <div
                          key={submitter.id}
                          className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">
                              {submitter.email}
                            </span>
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {submitter.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                            <div>Role: {submitter.role || "N/A"}</div>
                            {submitter.completed_at && (
                              <div>
                                Completed: {formatDate(submitter.completed_at)}
                              </div>
                            )}
                          </div>
                          {submitter.status.toLowerCase() === "pending" && (
                            <Button
                              size="sm"
                              className="mt-3"
                              onClick={() => goToSignPage(submitter.slug)}
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Sign Now
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Documents
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => downloadDocument(selectedAgreement.id)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Document
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

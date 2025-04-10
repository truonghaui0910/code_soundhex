"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileIcon, ExternalLinkIcon, EyeIcon } from "lucide-react";
import { format } from 'date-fns';
import { ViewLicenseButton } from "./view-license-button";
import { toast } from "sonner";
import { License } from "@/lib/services/license-service";

type LicenseTableProps = {
  licenses: License[];
};

export const LicenseTable = ({ licenses }: LicenseTableProps) => {
  if (licenses.length === 0) {
    return <p className="text-center py-4">No licenses found.</p>;
  }

  const formatDate = (dateString: string) => {
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
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Completed At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {licenses.map((license) => (
            <TableRow key={license.id}>
              <TableCell>{license.id}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={license.template.name}>
                {license.template.name}
              </TableCell>
              <TableCell>
                {license.submitters[0]?.email || 'N/A'}
              </TableCell>
              <TableCell>
                {license.submitters[0]?.role || 'N/A'}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(license.status)}>
                  {license.status}
                </Badge>
              </TableCell>
              <TableCell>{license.created_at ? formatDate(license.created_at) : 'N/A'}</TableCell>
              <TableCell>{license.completed_at ? formatDate(license.completed_at) : 'N/A'}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {license.status.toLowerCase() === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Lấy slug từ submitter đầu tiên
                        const submitterSlug = license.submitters[0]?.slug;
                        if (submitterSlug) {
                          window.open(`https://docs.360digital.fm/s/${submitterSlug}`, '_blank');
                        } else {
                          toast.error("No slug found for this license");
                        }
                      }}
                      title="Sign License"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                    </Button>
                  )}
                  {license.status.toLowerCase() !== "pending" && (
                    <ViewLicenseButton licenseId={license.id} />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
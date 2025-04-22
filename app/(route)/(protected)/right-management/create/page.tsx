"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dữ liệu mẫu cho quyền
const sampleRights = [
  {
    id: 1,
    email: "user1@example.com",
    role: "Admin",
    resource: "All Tracks",
    permissions: ["view", "edit", "delete", "share"],
    grantedDate: "2023-04-15",
  },
  {
    id: 2,
    email: "user2@example.com",
    role: "Editor",
    resource: "Album 1",
    permissions: ["view", "edit"],
    grantedDate: "2023-05-20",
  },
  {
    id: 3,
    email: "user3@example.com",
    role: "Viewer",
    resource: "Track Collection",
    permissions: ["view"],
    grantedDate: "2023-06-10",
  },
];

export default function RightManagementPage() {
  const [rights, setRights] = useState(sampleRights);
  const [searchQuery, setSearchQuery] = useState("");

  // Lọc quyền dựa trên từ khóa tìm kiếm
  const filteredRights = rights.filter((right) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      right.email.toLowerCase().includes(query) ||
      right.role.toLowerCase().includes(query) ||
      right.resource.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Right Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Right
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, role or resource..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Rights table */}
      <Card>
        <CardHeader>
          <CardTitle>User Rights</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Granted Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRights.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {searchQuery ? "No rights matching your search." : "No rights available."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRights.map((right) => (
                  <TableRow key={right.id}>
                    <TableCell>{right.email}</TableCell>
                    <TableCell>
                      <Badge className={
                        right.role === "Admin" 
                          ? "bg-rose-100 text-rose-800 border-rose-200" 
                          : right.role === "Editor"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }>
                        {right.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{right.resource}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {right.permissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{right.grantedDate}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Revoke</DropdownMenuItem>
                          <DropdownMenuItem>View History</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
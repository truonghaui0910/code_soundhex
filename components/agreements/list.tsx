// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { 
//   Dialog, 
//   DialogContent, 
//   DialogDescription, 
//   DialogHeader, 
//   DialogTitle, 
//   DialogFooter 
// } from "@/components/ui/dialog";

// // Types
// interface Agreement {
//   id: string;
//   clientName: string;
//   dateCreated: string;
//   selectedRights: { id: string; title: string }[];
//   notes?: string;
// }

// // Example data (in a real app, this would come from an API/database)
// const SAMPLE_AGREEMENTS: Agreement[] = [
//   {
//     id: "agr-001",
//     clientName: "SoundWave Records",
//     dateCreated: "2025-03-15T10:30:00Z",
//     selectedRights: [
//       { id: "digital-distribution", title: "Digital Distribution" },
//       { id: "marketing-promotion", title: "Marketing and Promotion" },
//       { id: "licensing-services", title: "Licensing Services" }
//     ],
//     notes: "Initial agreement for Q2 2025 releases."
//   },
//   {
//     id: "agr-002",
//     clientName: "BeatBox Productions",
//     dateCreated: "2025-03-20T14:45:00Z",
//     selectedRights: [
//       { id: "digital-distribution", title: "Digital Distribution" },
//       { id: "user-content-monetization", title: "User Generated Content Monetization" }
//     ],
//     notes: "Focus on social media monetization."
//   },
//   {
//     id: "agr-003",
//     clientName: "Melody Studios",
//     dateCreated: "2025-04-01T09:15:00Z",
//     selectedRights: [
//       { id: "licensing-services", title: "Licensing Services" },
//       { id: "magazine-blog-pr", title: "Magazine/Blog PR" }
//     ],
//     notes: "PR campaign for summer releases."
//   }
// ];

// export default function AgreementsList() {
//   const router = useRouter();
//   const [agreements, setAgreements] = useState<Agreement[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
//   const [showDialog, setShowDialog] = useState(false);
  
//   // Load agreements (simulating API call)
//   useEffect(() => {
//     const fetchAgreements = async () => {
//       try {
//         // In a real app, this would be an API call
//         await new Promise(resolve => setTimeout(resolve, 800));
//         setAgreements(SAMPLE_AGREEMENTS);
//       } catch (error) {
//         console.error("Error loading agreements:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     fetchAgreements();
//   }, []);
  
//   // Format date string
//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };
  
//   // View agreement details
//   const viewAgreementDetails = (agreement: Agreement) => {
//     setSelectedAgreement(agreement);
//     setShowDialog(true);
//   };
  
//   // Create new agreement
//   const createNewAgreement = () => {
//     router.push("/agreements/create");
//   };
  
//   return (
//     <div className="container mx-auto py-6 max-w-5xl">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Agreements</h1>
//         <Button onClick={createNewAgreement}>
//           Create New Agreement
//         </Button>
//       </div>
      
//       <Card>
//         <CardHeader>
//           <CardTitle>All Agreements</CardTitle>
//           <CardDescription>View and manage all agreements</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {isLoading ? (
//             <div className="flex justify-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
//             </div>
//           ) : agreements.length === 0 ? (
//             <div className="text-center py-8 text-gray-500">
//               <p>No agreements found. Create your first agreement.</p>
//             </div>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Client</TableHead>
//                   <TableHead>Date Created</TableHead>
//                   <TableHead>Rights</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {agreements.map((agreement) => (
//                   <TableRow key={agreement.id}>
//                     <TableCell className="font-medium">{agreement.clientName}</TableCell>
//                     <TableCell>{formatDate(agreement.dateCreated)}</TableCell>
//                     <TableCell>
//                       <div className="flex flex-wrap gap-1">
//                         {agreement.selectedRights.slice(0, 2).map((right) => (
//                           <Badge key={right.id} variant="outline" className="text-xs">
//                             {right.title}
//                           </Badge>
//                         ))}
//                         {agreement.selectedRights.length > 2 && (
//                           <Badge variant="outline" className="text-xs">
//                             +{agreement.selectedRights.length - 2} more
//                           </Badge>
//                         )}
//                       </div>
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <Button 
//                         variant="ghost" 
//                         size="sm"
//                         onClick={() => viewAgreementDetails(agreement)}
//                       >
//                         View Details
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           )}
//         </CardContent>
//       </Card>
      
//       {/* Agreement Details Dialog */}
//       <Dialog open={showDialog} onOpenChange={setShowDialog}>
//         <DialogContent className="max-w-2xl">
//           {selectedAgreement && (
//             <>
//               <DialogHeader>
//                 <DialogTitle>Agreement Details</DialogTitle>
//                 <DialogDescription>
//                   Created on {formatDate(selectedAgreement.dateCreated)}
//                 </DialogDescription>
//               </DialogHeader>
              
//               <div className="space-y-4 py-4">
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Client</h3>
//                   <p className="text-lg font-semibold">{selectedAgreement.clientName}</p>
//                 </div>
                
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500 mb-2">Selected Rights</h3>
//                   <div className="space-y-2">
//                     {selectedAgreement.selectedRights.map((right) => (
//                       <div key={right.id} className="flex items-center">
//                         <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
//                         <span>{right.title}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
                
//                 {selectedAgreement.notes && (
//                   <div>
//                     <h3 className="text-sm font-medium text-gray-500">Notes</h3>
//                     <p className="text-gray-700 mt-1">{selectedAgreement.notes}</p>
//                   </div>
//                 )}
//               </div>
              
//               <DialogFooter>
//                 <Button variant="outline" onClick={() => setShowDialog(false)}>
//                   Close
//                 </Button>
//                 <Button 
//                   variant="default"
//                   onClick={() => {
//                     // In a real app, this would navigate to an edit page
//                     setShowDialog(false);
//                   }}
//                 >
//                   Edit Agreement
//                 </Button>
//               </DialogFooter>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { toast } from "sonner";

// // Types for API response
// interface Submitter {
//   id: number;
//   slug: string;
//   uuid: string;
//   name: string | null;
//   email: string;
//   status: string;
//   completed_at: string | null;
//   role: string;
// }

// interface Agreement {
//   id: number;
//   slug: string;
//   created_at: string;
//   updated_at: string;
//   status: string;
//   completed_at: string | null;
//   audit_log_url: string | null;
//   combined_document_url: string | null;
//   submitters: Submitter[];
//   template: {
//     id: number;
//     name: string;
//   };
//   created_by_user: {
//     email: string;
//     first_name: string;
//     last_name: string;
//   };
// }

// export default function AgreementsList() {
//   const router = useRouter();
//   const [agreements, setAgreements] = useState<Agreement[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  
//   // Fetch agreements from our backend API
//   useEffect(() => {
//     fetchAgreements();
//   }, []);
  
//   const fetchAgreements = async () => {
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const response = await fetch("/api/agreements/list");
      
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => null);
//         throw new Error(errorData?.error || `API error: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log("Agreements data:", data);
      
//       // Check if data has the expected structure
//       if (Array.isArray(data.data)) {
//         setAgreements(data.data);
//       } else if (Array.isArray(data)) {
//         setAgreements(data);
//       } else {
//         console.error("Unexpected data structure:", data);
//         setAgreements([]);
//         setError("Received invalid data format from API");
//       }
//     } catch (err) {
//       console.error("Failed to fetch agreements:", err);
//       setError(err instanceof Error ? err.message : "Unknown error");
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // Format date string
//   const formatDate = (dateString?: string | null) => {
//     if (!dateString) return "N/A";
//     try {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch (error) {
//       return 'Invalid date';
//     }
//   };
  
//   // Get status badge color
//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case 'completed':
//         return 'bg-green-100 text-green-800 border-green-200';
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//       case 'declined':
//         return 'bg-red-100 text-red-800 border-red-200';
//       default:
//         return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };
  
//   // View agreement details
//   const viewAgreementDetails = (agreement: Agreement) => {
//     setSelectedAgreement(agreement);
//   };
  
//   // Navigate to sign page
//   const goToSignPage = (slug: string) => {
//     window.open(`https://docs.360digital.fm/s/${slug}`, '_blank');
//   };
  
//   // Download document
//   const downloadDocument = (url: string) => {
//     window.open(url, '_blank');
//   };
  
//   // Create new agreement
//   const createNewAgreement = () => {
//     router.push("/agreements/create");
//   };
  
//   return (
//     <div className="container mx-auto py-6 max-w-5xl">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Agreements</h1>
//         <div className="space-x-2">
//           <Button
//             variant="outline"
//             onClick={fetchAgreements}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-rose-600"></div>
//                 Loading...
//               </>
//             ) : (
//               "Refresh"
//             )}
//           </Button>
//           <Button onClick={createNewAgreement}>
//             Create New Agreement
//           </Button>
//         </div>
//       </div>
      
//       <Card>
//         <CardHeader>
//           <CardTitle>Your Agreements</CardTitle>
//           <CardDescription>View and manage all your agreements</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {isLoading ? (
//             <div className="flex justify-center items-center h-20">
//               <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-rose-600"></div>
//             </div>
//           ) : error ? (
//             <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
//               <p className="font-medium">Error loading agreements</p>
//               <p className="text-sm mt-2">{error}</p>
//               <Button 
//                 variant="outline" 
//                 className="mt-4" 
//                 onClick={fetchAgreements}
//               >
//                 Try Again
//               </Button>
//             </div>
//           ) : agreements.length === 0 ? (
//             <div className="text-center py-8 text-gray-500">
//               <p>No agreements found. Create your first agreement.</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>ID</TableHead>
//                     <TableHead>Email</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Created</TableHead>
//                     <TableHead>Completed</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {agreements.map((agreement) => (
//                     <TableRow key={agreement.id}>
//                       <TableCell>{agreement.id}</TableCell>
//                       <TableCell>
//                         {agreement.submitters[0]?.email || 'N/A'}
//                       </TableCell>
//                       <TableCell>
//                         <Badge className={getStatusColor(agreement.status)}>
//                           {agreement.status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>{formatDate(agreement.created_at)}</TableCell>
//                       <TableCell>{formatDate(agreement.completed_at)}</TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex justify-end space-x-2">
//                           {agreement.status.toLowerCase() === "pending" && (
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => {
//                                 const submitterSlug = agreement.submitters[0]?.slug;
//                                 if (submitterSlug) {
//                                   goToSignPage(submitterSlug);
//                                 } else {
//                                   toast.error("No signing link found");
//                                 }
//                               }}
//                             >
//                               Sign
//                             </Button>
//                           )}
                          
//                           {agreement.status.toLowerCase() === "completed" && agreement.audit_log_url && (
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => downloadDocument(agreement.audit_log_url!)}
//                             >
//                               View Document
//                             </Button>
//                           )}
                          
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => viewAgreementDetails(agreement)}
//                           >
//                             Details
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           )}
//         </CardContent>
//       </Card>
      
//       {/* Agreement Details Card */}
//       {selectedAgreement && (
//         <Card className="mt-6">
//           <CardHeader>
//             <CardTitle>Agreement Details</CardTitle>
//             <CardDescription>
//               ID: {selectedAgreement.id} - Created on {formatDate(selectedAgreement.created_at)}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div>
//                 <h3 className="text-sm font-medium text-gray-500">Template</h3>
//                 <p className="text-lg font-semibold">{selectedAgreement.template.name}</p>
//               </div>
              
//               <div>
//                 <h3 className="text-sm font-medium text-gray-500">Status</h3>
//                 <Badge className={getStatusColor(selectedAgreement.status)}>
//                   {selectedAgreement.status}
//                 </Badge>
//               </div>
              
//               <div>
//                 <h3 className="text-sm font-medium text-gray-500">Created By</h3>
//                 <p>
//                   {selectedAgreement.created_by_user.first_name} {selectedAgreement.created_by_user.last_name} ({selectedAgreement.created_by_user.email})
//                 </p>
//               </div>
              
//               <div>
//                 <h3 className="text-sm font-medium text-gray-500 mb-2">Submitters</h3>
//                 <div className="space-y-2">
//                   {selectedAgreement.submitters.map((submitter) => (
//                     <div key={submitter.id} className="border rounded-md p-3">
//                       <div className="flex justify-between">
//                         <span className="font-medium">{submitter.email}</span>
//                         <Badge className={getStatusColor(submitter.status)}>
//                           {submitter.status}
//                         </Badge>
//                       </div>
//                       <div className="text-sm text-gray-500 mt-1">
//                         Role: {submitter.role || 'N/A'}
//                       </div>
//                       {submitter.completed_at && (
//                         <div className="text-sm text-gray-500">
//                           Completed: {formatDate(submitter.completed_at)}
//                         </div>
//                       )}
//                       {submitter.status.toLowerCase() === "pending" && (
//                         <Button 
//                           size="sm" 
//                           className="mt-2"
//                           onClick={() => goToSignPage(submitter.slug)}
//                         >
//                           Sign Now
//                         </Button>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
              
//               {selectedAgreement.audit_log_url && (
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Documents</h3>
//                   <div className="mt-2">
//                     <Button 
//                       variant="outline"
//                       onClick={() => downloadDocument(selectedAgreement.audit_log_url!)}
//                     >
//                       Download Audit Log
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//           <CardFooter className="flex justify-end">
//             <Button 
//               variant="outline"
//               onClick={() => setSelectedAgreement(null)}
//             >
//               Close
//             </Button>
//           </CardFooter>
//         </Card>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

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
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
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
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Get status badge color
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
  
  // View agreement details
  const viewAgreementDetails = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setDialogOpen(true);
  };
  
  // Navigate to sign page
  const goToSignPage = (slug: string) => {
    window.open(`https://docs.360digital.fm/s/${slug}`, '_blank');
  };
  
  // Download document
  const downloadDocument = (url: string) => {
    window.open(url, '_blank');
  };
  
  // Create new agreement
  const createNewAgreement = () => {
    router.push("/agreements/create");
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agreements</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={fetchAgreements}
            disabled={isLoading}
            className="min-w-[112px]"
          >
            {isLoading ? (
              <>
                <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-rose-600"></div>
                Loading...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
          <Button onClick={createNewAgreement}>
            Create New Agreement
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Agreements</CardTitle>
          <CardDescription>View and manage all your agreements</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-rose-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
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
            <div className="text-center py-8 text-gray-500">
              <p>No agreements found. Create your first agreement.</p>
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
                  {agreements.map((agreement) => (
                    <TableRow key={agreement.id}>
                      <TableCell>{agreement.id}</TableCell>
                      <TableCell>
                        {agreement.submitters[0]?.email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(agreement.status)}>
                          {agreement.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(agreement.created_at)}</TableCell>
                      <TableCell>{formatDate(agreement.completed_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {agreement.status.toLowerCase() === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const submitterSlug = agreement.submitters[0]?.slug;
                                if (submitterSlug) {
                                  goToSignPage(submitterSlug);
                                } else {
                                  toast.error("No signing link found");
                                }
                              }}
                            >
                              Sign
                            </Button>
                          )}
                          
                          {agreement.status.toLowerCase() === "completed" && agreement.audit_log_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadDocument(agreement.audit_log_url!)}
                            >
                              View Document
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewAgreementDetails(agreement)}
                          >
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Agreement Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedAgreement && (
            <>
              <DialogHeader>
                <DialogTitle>Agreement Details</DialogTitle>
                <DialogDescription>
                  ID: {selectedAgreement.id} - Created on {formatDate(selectedAgreement.created_at)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Template</h3>
                  <p className="text-lg font-semibold">{selectedAgreement.template.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <Badge className={getStatusColor(selectedAgreement.status)}>
                    {selectedAgreement.status}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created By</h3>
                  <p>
                    {selectedAgreement.created_by_user.first_name} {selectedAgreement.created_by_user.last_name} ({selectedAgreement.created_by_user.email})
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Submitters</h3>
                  <div className="space-y-2">
                    {selectedAgreement.submitters.map((submitter) => (
                      <div key={submitter.id} className="border rounded-md p-3">
                        <div className="flex justify-between">
                          <span className="font-medium">{submitter.email}</span>
                          <Badge className={getStatusColor(submitter.status)}>
                            {submitter.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Role: {submitter.role || 'N/A'}
                        </div>
                        {submitter.completed_at && (
                          <div className="text-sm text-gray-500">
                            Completed: {formatDate(submitter.completed_at)}
                          </div>
                        )}
                        {submitter.status.toLowerCase() === "pending" && (
                          <Button 
                            size="sm" 
                            className="mt-2"
                            onClick={() => goToSignPage(submitter.slug)}
                          >
                            Sign Now
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedAgreement.audit_log_url && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Documents</h3>
                    <div className="mt-2">
                      <Button 
                        variant="outline"
                        onClick={() => downloadDocument(selectedAgreement.audit_log_url!)}
                      >
                        Download Audit Log
                      </Button>
                    </div>
                  </div>
                )}
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
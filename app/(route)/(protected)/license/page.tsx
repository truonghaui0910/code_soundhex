// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Spinner } from "@/components/ui/spinner";
// import { LicenseTable } from "@/app/(route)/(protected)/license/table";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { ReloadIcon } from "@radix-ui/react-icons";
// import { fetchLicenses, License } from "@/lib/services/license-service";
// import { useCurrentUser } from "@/hooks/use-current-user";

// export default function LicensePage() {
//   const { user, loading: userLoading } = useCurrentUser();
//   const [licenses, setLicenses] = useState<License[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const loadLicenses = async () => {
//     try {
//       if (!user?.email) {
//         setError("User email not available. Please log in again.");
//         return;
//       }
      
//       setLoading(true);
//       setError("");
      
//       const data = await fetchLicenses(user.email, 2);
//       setLicenses(data);
//     } catch (err) {
//       console.error("Failed to fetch licenses:", err);
//       setError("Failed to load license data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Lấy danh sách license khi đã có thông tin người dùng
//   useEffect(() => {
//     if (user?.email && !userLoading) {
//       loadLicenses();
//     }
//   }, [user, userLoading]);

//   return (
//     <div className="container mx-auto py-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">License Management</h1>
//         <Button onClick={loadLicenses} disabled={loading || userLoading || !user?.email}>
//           {loading ? (
//             <>
//               <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
//               Loading...
//             </>
//           ) : (
//             "Refresh"
//           )}
//         </Button>
//       </div>

//       {error && (
//         <Alert variant="destructive" className="mb-6">
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}

//       <Card>
//         <CardHeader>
//           <CardTitle>Licenses</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {userLoading ? (
//             <div className="flex justify-center items-center p-8">
//               <ReloadIcon className="mr-2 h-6 w-6 animate-spin" />
//               <span>Loading user information...</span>
//             </div>
//           ) : loading && licenses.length === 0 ? (
//             <div className="flex justify-center items-center p-8">
//               <ReloadIcon className="mr-2 h-6 w-6 animate-spin" />
//               <span>Loading licenses...</span>
//             </div>
//           ) : !user ? (
//             <div className="p-8 text-center">
//               <Alert>
//                 <AlertTitle>Authentication Required</AlertTitle>
//                 <AlertDescription>Please log in to view your licenses.</AlertDescription>
//               </Alert>
//             </div>
//           ) : (
//             <LicenseTable licenses={licenses} />
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LicenseTable } from "./table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReloadIcon } from "@radix-ui/react-icons";
import { fetchLicenses, License } from "@/lib/services/license-service";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function LicensePage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadLicenses = async () => {
    try {
      if (!user?.email) {
        setError("User email not available. Please log in again.");
        return;
      }
      
      setLoading(true);
      setError("");
      
      const data = await fetchLicenses(user.email, 2);
      
      // Lọc ra những bản ghi có archived_at = null
      const filteredLicenses = data.filter(license => license.archived_at === null);
      setLicenses(filteredLicenses);
    } catch (err) {
      console.error("Failed to fetch licenses:", err);
      setError("Failed to load license data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách license khi đã có thông tin người dùng
  useEffect(() => {
    if (user?.email && !userLoading) {
      loadLicenses();
    }
  }, [user, userLoading]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">License Management</h1>
        <Button onClick={loadLicenses} disabled={loading || userLoading || !user?.email}>
          {loading ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Licenses</CardTitle>
        </CardHeader>
        <CardContent>
          {userLoading ? (
            <div className="flex justify-center items-center p-8">
              <ReloadIcon className="mr-2 h-6 w-6 animate-spin" />
              <span>Loading user information...</span>
            </div>
          ) : loading && licenses.length === 0 ? (
            <div className="flex justify-center items-center p-8">
              <ReloadIcon className="mr-2 h-6 w-6 animate-spin" />
              <span>Loading licenses...</span>
            </div>
          ) : !user ? (
            <div className="p-8 text-center">
              <Alert>
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>Please log in to view your licenses.</AlertDescription>
              </Alert>
            </div>
          ) : (
            <LicenseTable licenses={licenses} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
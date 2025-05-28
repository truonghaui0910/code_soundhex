import RevenueCard from "@/components/dashboard/revenue-card";
import AgreementOverview from "@/components/dashboard/agreement-overview";

// Mock data for dashboard
const dashboardData = {
  agreementStatus: {
    distribution: {
      status: "active",
      effectiveDate: "Jan 1, 2024"
    },
    approval: {
      status: "pending"
    }
  },
  recentTracks: [
    { id: 1, title: "Track A", status: "approved" },
    { id: 2, title: "Track B", status: "review" },
    { id: 3, title: "Track C", status: "rejected" }
  ],
  revenue: {
    monthly: 2000,
    daily: 150
  },
  agreementOverview: {
    total: 25,
    active: 5,
    pending: 2
  },
  latestUploads: [
    { platform: "Platform X", progress: 70, status: "uploading" },
    { platform: "Pending", progress: 50, status: "pending" },
    { platform: "Platform Z", progress: 20, status: "error" }
  ],
  notifications: [
    { type: "approval", message: "Approval required for new agreement" },
    { type: "expiration", message: "Agreement expiring soon" }
  ]
};

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Agreement Status Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Agreement Status</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1 rounded-full bg-rose-100 p-1">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-rose-600" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Distribution Agreement</h3>
                <p className="text-gray-600">Effective {dashboardData.agreementStatus.distribution.effectiveDate}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1 rounded-full bg-gray-100 p-1">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-gray-600" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Pending Approval</h3>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Tracks Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Recent Tracks</h2>
          <div className="space-y-4">
            {dashboardData.recentTracks.map((track) => (
              <div key={track.id} className="flex items-start space-x-3">
                <div className="mt-1 rounded-full bg-gray-100 p-1">
                  {track.status === "approved" ? (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-rose-600" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : track.status === "review" ? (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-gray-600" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-gray-600" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{track.title}</h3>
                  <p className="text-gray-600">
                    {track.status === "approved" ? "Approved" : 
                     track.status === "review" ? "In Review" : "Rejected"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Revenue Card - Client Component */}
        <RevenueCard initialData={dashboardData.revenue} />
        
        {/* Agreement Overview Card - Client Component */}
        <AgreementOverview data={dashboardData.agreementOverview} />
        
        {/* Latest Uploads Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Latest Uploads</h2>
          <div className="space-y-6">
            {dashboardData.latestUploads.map((upload, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">{upload.platform}</span>
                  {upload.status === "error" && <span className="text-red-600">Error</span>}
                </div>
                <div className="bg-gray-200 h-2 rounded-full">
                  <div 
                    className={`h-2 rounded-full ${
                      upload.status === "error" ? "bg-red-600" : 
                      upload.status === "pending" ? "bg-gray-600" : "bg-rose-600"
                    }`} 
                    style={{ width: `${upload.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Notifications Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          <div className="space-y-4">
            {dashboardData.notifications.map((notification, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="mt-1">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-rose-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-800">{notification.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
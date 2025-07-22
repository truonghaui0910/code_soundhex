// app/(route)/track/[id]/track-loading.tsx
export default function TrackLoadingComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header Section Loading */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16">
          {/* Back Button Loading */}
          <div className="mb-6">
            <div className="w-24 h-10 bg-white/10 rounded animate-pulse"></div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            {/* Cover Image Loading */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl bg-white/10 animate-pulse"></div>
            
            {/* Track Info Loading */}
            <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
              <div className="w-16 h-6 bg-white/20 rounded animate-pulse mx-auto md:mx-0"></div>
              <div className="h-16 md:h-20 bg-white/20 rounded animate-pulse"></div>
              <div className="h-6 bg-white/20 rounded animate-pulse w-3/4 mx-auto md:mx-0"></div>
              
              {/* Action Buttons Loading */}
              <div className="flex gap-4 justify-center md:justify-start mt-4">
                <div className="w-32 h-12 bg-white/20 rounded animate-pulse"></div>
                <div className="w-24 h-12 bg-white/20 rounded animate-pulse"></div>
                <div className="w-24 h-12 bg-white/20 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section Loading */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>
        
        {/* Track Details Loading */}
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
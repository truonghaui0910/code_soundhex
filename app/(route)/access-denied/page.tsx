
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Lock } from "lucide-react";

export default function AccessDeniedPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      router.push("/music");
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-rose-600 dark:text-rose-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            Truy Cập Bị Từ Chối
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
            Bạn không có quyền truy cập vào trang này
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-lg border border-rose-200 dark:border-rose-800">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              🎵 <strong>Xin lỗi!</strong> Trang này chỉ dành cho những người dùng có quyền đặc biệt. 
              Để truy cập được các tính năng như upload nhạc, quản lý dashboard hay xem hợp đồng, 
              bạn cần có quyền <span className="font-semibold text-rose-600">Music Provider</span> hoặc cao hơn.
            </p>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            💡 <strong>Gợi ý:</strong> Liên hệ với quản trị viên để được cấp quyền truy cập nếu bạn cần sử dụng các tính năng này.
          </div>
          
          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={() => router.push("/music")} 
              className="w-full bg-rose-600 hover:bg-rose-700 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về Trang Nhạc
            </Button>
            
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Tự động chuyển hướng sau 10 giây...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

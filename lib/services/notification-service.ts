
import { toast } from 'sonner';

export interface NotificationOptions {
  title: string;
  message?: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  showProgress?: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Success notifications
  success(options: NotificationOptions | string) {
    if (typeof options === 'string') {
      toast.success(options);
      return;
    }

    toast.success(options.title, {
      description: options.message,
      duration: options.duration || 5000,
    });
  }

  // Error notifications
  error(options: NotificationOptions | string) {
    if (typeof options === 'string') {
      toast.error(options);
      return;
    }

    toast.error(options.title, {
      description: options.message,
      duration: options.duration || 7000,
    });
  }

  // Warning notifications
  warning(options: NotificationOptions | string) {
    if (typeof options === 'string') {
      toast.warning(options);
      return;
    }

    toast.warning(options.title, {
      description: options.message,
      duration: options.duration || 5000,
    });
  }

  // Info notifications
  info(options: NotificationOptions | string) {
    if (typeof options === 'string') {
      toast.info(options);
      return;
    }

    toast.info(options.title, {
      description: options.message,
      duration: options.duration || 4000,
    });
  }

  // Import success notification - chuyên dụng cho import tracks
  importSuccess(data: {
    totalTracks: number;
    successCount: number;
    failedCount: number;
    albumName?: string;
    artistName?: string;
  }) {
    const { totalTracks, successCount, failedCount, albumName, artistName } = data;
    
    if (failedCount === totalTracks) {
      // Tất cả tracks đều fail
      this.error({
        title: '❌ Import thất bại',
        message: `Không thể import bất kỳ track nào${albumName ? ` từ album "${albumName}"` : ''}${artistName ? ` của ${artistName}` : ''}. Lý do: ${failedCount === totalTracks ? 'Tất cả tracks đã tồn tại trong hệ thống' : 'Lỗi không xác định'}.`,
        duration: 8000,
      });
    } else if (failedCount > 0) {
      // Một số tracks fail
      this.warning({
        title: '⚠️ Import hoàn tất với lỗi',
        message: `${successCount}/${totalTracks} tracks đã được import thành công${albumName ? ` cho album "${albumName}"` : ''}${artistName ? ` của ${artistName}` : ''}. ${failedCount} tracks bị lỗi (có thể đã tồn tại).`,
        duration: 8000,
      });
    } else {
      // Tất cả thành công
      this.success({
        title: '🎉 Import thành công!',
        message: `Đã import ${successCount} tracks thành công${albumName ? ` cho album "${albumName}"` : ''}${artistName ? ` của ${artistName}` : ''}. Bạn có thể xem chúng trong thư viện nhạc.`,
        duration: 6000,
      });
    }
  }

  // Upload success notification
  uploadSuccess(data: {
    fileName: string;
    type: 'track' | 'album' | 'artist';
  }) {
    const { fileName, type } = data;
    const typeMap = {
      track: 'bài hát',
      album: 'album',
      artist: 'nghệ sĩ'
    };

    this.success({
      title: '✅ Upload thành công!',
      message: `${typeMap[type]} "${fileName}" đã được upload và xử lý thành công.`,
      duration: 5000,
    });
  }

  // Processing notification
  processing(message: string = 'Đang xử lý...') {
    toast.loading(message, {
      duration: Infinity, // Keep showing until dismissed
    });
  }

  // Dismiss all notifications
  dismissAll() {
    toast.dismiss();
  }

  // Agreement notifications
  agreementSuccess(action: 'created' | 'signed' | 'completed', agreementId?: number) {
    const messages = {
      created: '📄 Hợp đồng đã được tạo thành công!',
      signed: '✍️ Hợp đồng đã được ký thành công!',
      completed: '🎉 Hợp đồng đã hoàn tất!'
    };

    this.success({
      title: messages[action],
      message: agreementId ? `ID hợp đồng: ${agreementId}` : undefined,
      duration: 5000,
    });
  }

  // Authentication notifications
  authSuccess(action: 'login' | 'register' | 'logout') {
    const messages = {
      login: '👋 Chào mừng bạn trở lại!',
      register: '🎉 Đăng ký thành công!',
      logout: '👋 Hẹn gặp lại!'
    };

    this.success(messages[action]);
  }

  authError(action: 'login' | 'register' | 'logout') {
    const messages = {
      login: '❌ Đăng nhập thất bại!',
      register: '❌ Đăng ký thất bại!',
      logout: '❌ Đăng xuất thất bại!'
    };

    this.error(messages[action]);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Export individual methods for convenience
export const {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  importSuccess: showImportSuccess,
  uploadSuccess: showUploadSuccess,
  processing: showProcessing,
  dismissAll: dismissNotifications,
  agreementSuccess: showAgreementSuccess,
  authSuccess: showAuthSuccess,
  authError: showAuthError,
} = notificationService;

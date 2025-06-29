
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

  // Import success notification - specialized for importing tracks
  importSuccess(data: {
    totalTracks: number;
    successCount: number;
    failedCount: number;
    albumName?: string;
    artistName?: string;
  }) {
    const { totalTracks, successCount, failedCount, albumName, artistName } = data;
    
    if (failedCount === totalTracks) {
      // All tracks failed
      this.warning({
        title: '⚠️ Import Skipped',
        message: `All ${totalTracks} track${totalTracks > 1 ? 's' : ''} already exist in your library${albumName ? ` for album "${albumName}"` : ''}${artistName ? ` by ${artistName}` : ''}. No new tracks were added.`,
        duration: 6000,
      });
    } else if (failedCount > 0) {
      // Some tracks failed
      this.warning({
        title: '⚠️ Import Completed with Duplicates',
        message: `${successCount}/${totalTracks} tracks imported successfully${albumName ? ` for album "${albumName}"` : ''}${artistName ? ` by ${artistName}` : ''}. ${failedCount} track${failedCount > 1 ? 's' : ''} already existed and were skipped.`,
        duration: 8000,
      });
    } else {
      // All successful
      this.success({
        title: '🎉 Import Successful!',
        message: `Successfully imported ${successCount} track${successCount > 1 ? 's' : ''}${albumName ? ` for album "${albumName}"` : ''}${artistName ? ` by ${artistName}` : ''}. You can view them in your music library.`,
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
      created: '📄 Agreement Created Successfully!',
      signed: '✍️ Agreement Signed Successfully!',
      completed: '🎉 Agreement Completed!'
    };

    this.success({
      title: messages[action],
      message: agreementId ? `Agreement ID: ${agreementId}` : undefined,
      duration: 5000,
    });
  }

  // Authentication notifications
  authSuccess(action: 'login' | 'register' | 'logout') {
    const messages = {
      login: '👋 Welcome back!',
      register: '🎉 Registration successful!',
      logout: '👋 See you later!'
    };

    this.success(messages[action]);
  }

  authError(action: 'login' | 'register' | 'logout') {
    const messages = {
      login: '❌ Login failed!',
      register: '❌ Registration failed!',
      logout: '❌ Logout failed!'
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

import { toast } from "sonner";

export interface NotificationOptions {
  title: string;
  message?: string;
  duration?: number;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center";
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
    if (typeof options === "string") {
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
    if (typeof options === "string") {
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
    if (typeof options === "string") {
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
    if (typeof options === "string") {
      toast.info(options);
      return;
    }

    toast.info(options.title, {
      description: options.message,
      duration: options.duration || 4000,
    });
  }

  // Upload success notification
  uploadSuccess(data: {
    fileName: string;
    type: "track" | "album" | "artist";
  }) {
    const { fileName, type } = data;
    const typeMap = {
      track: "track",
      album: "album",
      artist: "artist",
    };

    this.success({
      title: "Upload Successful!",
      message: `${typeMap[type]} "${fileName}" has been uploaded and processed successfully.`,
      duration: 5000,
    });
  }

  // Processing notification
  processing(message: string = "Processing...") {
    toast.loading(message, {
      duration: Infinity, // Keep showing until dismissed
    });
  }

  // Dismiss all notifications
  dismissAll() {
    toast.dismiss();
  }

  // Agreement notifications
  agreementSuccess(
    action: "created" | "signed" | "completed",
    agreementId?: number,
  ) {
    const messages = {
      created: "Agreement Created Successfully!",
      signed: "Agreement Signed Successfully!",
      completed: "Agreement Completed!",
    };

    this.success({
      title: messages[action],
      message: agreementId ? `Agreement ID: ${agreementId}` : undefined,
      duration: 5000,
    });
  }

  // Authentication notifications
  authSuccess(action: "login" | "register" | "logout") {
    const messages = {
      login: "Welcome back!",
      register: "Registration successful!",
      logout: "See you later!",
    };

    this.success(messages[action]);
  }

  authError(action: "login" | "register" | "logout") {
    const messages = {
      login: "Login failed!",
      register: "Registration failed!",
      logout: "Logout failed!",
    };

    this.error(messages[action]);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

export function showSuccess(message: string): void;
export function showSuccess(options: {
  title: string;
  message: string;
  duration?: number;
}): void;
export function showSuccess(
  input: string | { title: string; message: string; duration?: number },
): void {
  if (typeof input === "string") {
    toast.success("Success", {
      description: input,
      duration: 4000,
    });
  } else {
    toast.success(input.title, {
      description: input.message,
      duration: input.duration || 4000,
    });
  }
}

// showError function
export function showError(message: string): void;
export function showError(options: {
  title: string;
  message: string;
  duration?: number;
}): void;
export function showError(
  input: string | { title: string; message: string; duration?: number },
): void {
  if (typeof input === "string") {
    toast.error("Error", {
      description: input,
      duration: 5000,
    });
  } else {
    toast.error(input.title, {
      description: input.message,
      duration: input.duration || 5000,
    });
  }
}

// showWarning function
export function showWarning(message: string): void;
export function showWarning(options: {
  title: string;
  message: string;
  duration?: number;
}): void;
export function showWarning(
  input: string | { title: string; message: string; duration?: number },
): void {
  if (typeof input === "string") {
    toast.warning("Warning", {
      description: input,
      duration: 5000,
    });
  } else {
    toast.warning(input.title, {
      description: input.message,
      duration: input.duration || 5000,
    });
  }
}

// showInfo function
export function showInfo(message: string): void;
export function showInfo(options: {
  title: string;
  message: string;
  duration?: number;
}): void;
export function showInfo(
  input: string | { title: string; message: string; duration?: number },
): void {
  if (typeof input === "string") {
    toast.info("Info", {
      description: input,
      duration: 4000,
    });
  } else {
    toast.info(input.title, {
      description: input.message,
      duration: input.duration || 4000,
    });
  }
}

export const showProcessing = (message: string) => {
  return toast.loading(message);
};

export const dismissNotifications = () => {
  toast.dismiss();
};

// Import success notification - specialized for importing tracks
export const showImportSuccess = (data: {
  totalTracks: number;
  successCount: number;
  failedCount: number;
  albumName?: string;
  artistName?: string;
}) => {
  const { totalTracks, successCount, failedCount, albumName, artistName } =
    data;

  if (failedCount === totalTracks) {
    // All tracks failed
    showWarning({
      title: "Import Skipped",
      message: `All ${totalTracks} track${totalTracks > 1 ? "s" : ""} already exist in your library${albumName ? ` for album "${albumName}"` : ""}${artistName ? ` by ${artistName}` : ""}. No new tracks were added.`,
      duration: 6000,
    });
  } else if (failedCount > 0) {
    // Some tracks failed
    showWarning({
      title: "Import Completed with Duplicates",
      message: `${successCount}/${totalTracks} tracks imported successfully${albumName ? ` for album "${albumName}"` : ""}${artistName ? ` by ${artistName}` : ""}. ${failedCount} track${failedCount > 1 ? "s" : ""} already existed and were skipped.`,
      duration: 8000,
    });
  } else {
    // All successful
    showSuccess({
      title: "Import Successful!",
      message: `Successfully imported ${successCount} track${successCount > 1 ? "s" : ""}${albumName ? ` for album "${albumName}"` : ""}${artistName ? ` by ${artistName}` : ""}. You can view them in your music library.`,
      duration: 6000,
    });
  }
};

// Export individual methods for convenience
export const {
  success: showUploadSuccess,
  error: showAgreementSuccess,
  warning: showAuthSuccess,
  info: showAuthError,
} = notificationService;

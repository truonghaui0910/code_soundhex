export const getBaseUrl = () => {
  // Replit deployment - sử dụng URL của Replit
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  }

  // Vercel deployment (nếu có)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Custom environment URL từ env variable
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Production environment
  if (process.env.NODE_ENV === "production") {
    return "https://soundhex.com";
  }

  // Staging environment
  if ((process.env.NODE_ENV as string) === "staging") {
    return "https://dev.soundhex.com";
  }

  // Local development - sử dụng 0.0.0.0 cho Replit
  return process.env.NODE_ENV === "development"
    ? "http://0.0.0.0:3000"
    : "http://localhost:3000";
};

// Client-side version cho browser
export const getClientBaseUrl = () => {
  // Trong browser, sử dụng window.location.origin làm fallback
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Fallback cho server-side
  return getBaseUrl();
};

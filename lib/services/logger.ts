
// Client-side logger (browser environment)
export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';
  operation: string;
  method?: string;
  endpoint?: string;
  userId?: string;
  duration?: number;
  error?: string;
  data?: any;
}

class ClientLogger {
  private formatLogEntry(entry: LogEntry): string {
    return `${entry.timestamp} [${entry.level}] ${entry.operation} - ${JSON.stringify({
      method: entry.method,
      endpoint: entry.endpoint,
      userId: entry.userId,
      duration: entry.duration,
      error: entry.error,
      data: entry.data
    })}`;
  }

  public logSupabaseRequest(entry: Omit<LogEntry, 'timestamp'>): void {
    try {
      const logEntry: LogEntry = {
        ...entry,
        timestamp: new Date().toISOString()
      };

      // Only log errors and important events to reduce noise
      const shouldLog = entry.level === 'ERROR' || 
                       entry.operation.includes('SIGNIN') || 
                       entry.operation.includes('SIGNUP') || 
                       entry.operation.includes('SIGNOUT');

      // Log to console in development (only important events)
      if (process.env.NODE_ENV === 'development' && shouldLog) {
        console.log(`🔍 Supabase ${entry.level}:`, entry.operation, entry.data || '');
      }

      // Store in localStorage for client-side persistence (optional, only errors)
      if (entry.level === 'ERROR' && typeof window !== 'undefined' && window.localStorage) {
        try {
          const logs = JSON.parse(localStorage.getItem('supabase_logs') || '[]');
          logs.push(logEntry);
          // Keep only last 50 logs to prevent localStorage bloat
          if (logs.length > 50) {
            logs.splice(0, logs.length - 50);
          }
          localStorage.setItem('supabase_logs', JSON.stringify(logs));
        } catch (storageError) {
          console.warn('Failed to store log in localStorage:', storageError);
        }
      }
    } catch (error) {
      console.error('Failed to log:', error);
    }
  }

  public logInfo(operation: string, data?: any): void {
    this.logSupabaseRequest({
      level: 'INFO',
      operation,
      data
    });
  }

  public logError(operation: string, error: string, data?: any): void {
    this.logSupabaseRequest({
      level: 'ERROR',
      operation,
      error,
      data
    });
  }

  public logWarn(operation: string, data?: any): void {
    this.logSupabaseRequest({
      level: 'WARN',
      operation,
      data
    });
  }

  // Method to get logs from localStorage
  public getLogs(): LogEntry[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return JSON.parse(localStorage.getItem('supabase_logs') || '[]');
      } catch (error) {
        console.error('Failed to retrieve logs from localStorage:', error);
        return [];
      }
    }
    return [];
  }

  // Method to clear logs
  public clearLogs(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('supabase_logs');
    }
  }
}

export const logger = new ClientLogger();

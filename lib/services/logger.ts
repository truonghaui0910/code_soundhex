
import { writeFileSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';

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

class Logger {
  private logDir = join(process.cwd(), 'logs');
  
  private getLogFileName(type: 'supabase' | 'general' = 'general'): string {
    const date = new Date().toISOString().split('T')[0];
    return join(this.logDir, `${type}-${date}.log`);
  }

  private formatLogEntry(entry: LogEntry): string {
    return `${entry.timestamp} [${entry.level}] ${entry.operation} - ${JSON.stringify({
      method: entry.method,
      endpoint: entry.endpoint,
      userId: entry.userId,
      duration: entry.duration,
      error: entry.error,
      data: entry.data
    })}\n`;
  }

  public logSupabaseRequest(entry: Omit<LogEntry, 'timestamp'>): void {
    try {
      const logEntry: LogEntry = {
        ...entry,
        timestamp: new Date().toISOString()
      };

      const logFile = this.getLogFileName('supabase');
      const formattedEntry = this.formatLogEntry(logEntry);

      // Ensure logs directory exists
      if (!existsSync(this.logDir)) {
        require('fs').mkdirSync(this.logDir, { recursive: true });
      }

      // Append to log file
      if (existsSync(logFile)) {
        appendFileSync(logFile, formattedEntry);
      } else {
        writeFileSync(logFile, formattedEntry);
      }

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Supabase ${entry.level}:`, entry.operation, entry.data || '');
      }
    } catch (error) {
      console.error('Failed to write log:', error);
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
}

export const logger = new Logger();

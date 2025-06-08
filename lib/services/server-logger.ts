import fs from 'fs';
import path from 'path';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';
  operation: string;
  method?: string;
  endpoint?: string;
  userId?: string;
  userEmail?: string;
  duration?: number;
  error?: string;
  data?: any;
}

class ServerLogger {
  private logsDir: string;

  constructor() {
    this.logsDir = path.join(process.cwd(), 'logs');
    this.ensureLogsDirectory();
  }

  private ensureLogsDirectory(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  private getLogFileName(): string {
    // Use GMT+7 timezone for filename
    const vietnamTime = new Date();
    vietnamTime.setHours(vietnamTime.getHours() + 7);
    const today = vietnamTime.toISOString().split('T')[0];
    return path.join(this.logsDir, `spotify-debug-${today}.log`);
  }

  private getVietnamTimestamp(): string {
    const now = new Date();
    // Convert to GMT+7 (Vietnam time)
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    
    const year = vietnamTime.getFullYear();
    const month = String(vietnamTime.getMonth() + 1).padStart(2, '0');
    const day = String(vietnamTime.getDate()).padStart(2, '0');
    const hours = String(vietnamTime.getHours()).padStart(2, '0');
    const minutes = String(vietnamTime.getMinutes()).padStart(2, '0');
    const seconds = String(vietnamTime.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  private formatLogEntry(entry: LogEntry): string {
    const userInfo = entry.userEmail || entry.userId || 'anonymous';
    const content = JSON.stringify({
      method: entry.method,
      endpoint: entry.endpoint,
      duration: entry.duration,
      error: entry.error,
      data: entry.data
    });
    
    return `${entry.timestamp} [${entry.level}] ${userInfo} ${entry.operation} - ${content}\n`;
  }

  public log(entry: Omit<LogEntry, 'timestamp'>, userEmail?: string): void {
    try {
      const logEntry: LogEntry = {
        ...entry,
        timestamp: this.getVietnamTimestamp(),
        userEmail: userEmail || entry.userEmail
      };

      const logLine = this.formatLogEntry(logEntry);
      const logFile = this.getLogFileName();

      fs.appendFileSync(logFile, logLine);

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        const userInfo = userEmail || entry.userEmail || 'anonymous';
        console.log(`📝 ${entry.level}: ${userInfo} ${entry.operation}`, entry.data || '');
      }
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  public logInfo(operation: string, data?: any, userEmail?: string): void {
    this.log({ level: 'INFO', operation, data }, userEmail);
  }

  public logError(operation: string, error: string, data?: any, userEmail?: string): void {
    this.log({ level: 'ERROR', operation, error, data }, userEmail);
  }

  public logWarn(operation: string, data?: any, userEmail?: string): void {
    this.log({ level: 'WARN', operation, data }, userEmail);
  }

  public logDebug(operation: string, data?: any, userEmail?: string): void {
    this.log({ level: 'DEBUG', operation, data }, userEmail);
  }
}

export const serverLogger = new ServerLogger();
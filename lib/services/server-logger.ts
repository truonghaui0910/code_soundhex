import fs from 'fs';
import path from 'path';

interface LogEntry {
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
    const today = new Date().toISOString().split('T')[0];
    return path.join(this.logsDir, `spotify-debug-${today}.log`);
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

  public log(entry: Omit<LogEntry, 'timestamp'>): void {
    try {
      const logEntry: LogEntry = {
        ...entry,
        timestamp: new Date().toISOString()
      };

      const logLine = this.formatLogEntry(logEntry);
      const logFile = this.getLogFileName();

      fs.appendFileSync(logFile, logLine);

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`📝 ${entry.level}: ${entry.operation}`, entry.data || '');
      }
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  public logInfo(operation: string, data?: any): void {
    this.log({ level: 'INFO', operation, data });
  }

  public logError(operation: string, error: string, data?: any): void {
    this.log({ level: 'ERROR', operation, error, data });
  }

  public logWarn(operation: string, data?: any): void {
    this.log({ level: 'WARN', operation, data });
  }

  public logDebug(operation: string, data?: any): void {
    this.log({ level: 'DEBUG', operation, data });
  }
}

export const serverLogger = new ServerLogger();
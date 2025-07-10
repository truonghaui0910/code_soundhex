
import fs from 'fs';
import path from 'path';

interface AgreementLogEntry {
  timestamp: string;
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';
  operation: string;
  userEmail?: string;
  submissionId?: string;
  requestData?: any;
  responseData?: any;
  error?: string;
  duration?: number;
  apiCalls?: {
    url: string;
    method: string;
    status: number;
    response: any;
    duration: number;
  }[];
}

class AgreementLogger {
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
    const vietnamTime = new Date();
    vietnamTime.setHours(vietnamTime.getHours() + 7);
    const today = vietnamTime.toISOString().split('T')[0];
    return path.join(this.logsDir, `agreement-debug-${today}.log`);
  }

  private getVietnamTimestamp(): string {
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    
    const year = vietnamTime.getFullYear();
    const month = String(vietnamTime.getMonth() + 1).padStart(2, '0');
    const day = String(vietnamTime.getDate()).padStart(2, '0');
    const hours = String(vietnamTime.getHours()).padStart(2, '0');
    const minutes = String(vietnamTime.getMinutes()).padStart(2, '0');
    const seconds = String(vietnamTime.getSeconds()).padStart(2, '0');
    const ms = String(vietnamTime.getMilliseconds()).padStart(3, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`;
  }

  private formatLogEntry(entry: AgreementLogEntry): string {
    const logData = {
      timestamp: entry.timestamp,
      level: entry.level,
      operation: entry.operation,
      userEmail: entry.userEmail || 'anonymous',
      submissionId: entry.submissionId,
      duration: entry.duration,
      error: entry.error,
      requestData: entry.requestData,
      responseData: entry.responseData,
      apiCalls: entry.apiCalls
    };
    
    return JSON.stringify(logData, null, 2) + '\n' + '='.repeat(100) + '\n';
  }

  public log(entry: Omit<AgreementLogEntry, 'timestamp'>): void {
    try {
      const logEntry: AgreementLogEntry = {
        ...entry,
        timestamp: this.getVietnamTimestamp()
      };

      const logLine = this.formatLogEntry(logEntry);
      const logFile = this.getLogFileName();

      fs.appendFileSync(logFile, logLine);

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`📝 AGREEMENT ${entry.level}: ${entry.userEmail || 'anonymous'} ${entry.operation}`);
        if (entry.error) {
          console.error('ERROR:', entry.error);
        }
      }
    } catch (error) {
      console.error('Failed to write agreement log:', error);
    }
  }

  public logInfo(operation: string, data: Partial<AgreementLogEntry>): void {
    this.log({ level: 'INFO', operation, ...data });
  }

  public logError(operation: string, error: string, data: Partial<AgreementLogEntry>): void {
    this.log({ level: 'ERROR', operation, error, ...data });
  }

  public logWarn(operation: string, data: Partial<AgreementLogEntry>): void {
    this.log({ level: 'WARN', operation, ...data });
  }

  public logDebug(operation: string, data: Partial<AgreementLogEntry>): void {
    this.log({ level: 'DEBUG', operation, ...data });
  }
}

export const agreementLogger = new AgreementLogger();

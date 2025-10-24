/**
 * @context7-library /threewebdesigner/workers/utils/logger
 * @description Logging utility for worker operations
 * @version 1.0.0
 * 
 * From PRD 05, Section 3: Logging Strategy
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = true;

  /**
   * Info level logging
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  /**
   * Error level logging
   */
  error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  /**
   * Debug level logging
   */
  debug(message: string, data?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      this.log('debug', message, data);
    }
  }

  /**
   * Internal log implementation
   */
  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    // In production, this would send to a logging service (e.g., Datadog)
    const logMethod = level === 'error' ? console.error : console.log;
    logMethod(JSON.stringify(entry));
  }
}

export const logger = new Logger();

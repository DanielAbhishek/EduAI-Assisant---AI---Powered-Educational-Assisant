interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  operation?: string;
  userId?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

class Logger {
  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, operation, userId, duration, metadata } = entry;
    
    let logString = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (operation) logString += ` | Operation: ${operation}`;
    if (userId) logString += ` | User: ${userId}`;
    if (duration !== undefined) logString += ` | Duration: ${duration}ms`;
    if (metadata && Object.keys(metadata).length > 0) {
      logString += ` | Metadata: ${JSON.stringify(metadata)}`;
    }
    
    return logString;
  }

  private log(level: LogEntry['level'], message: string, options: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'message'>> = {}) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...options
    };

    const formattedLog = this.formatLog(entry);
    
    // Use appropriate console method based on level
    switch (level) {
      case 'error':
        console.error(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(formattedLog);
        }
        break;
      default:
        console.log(formattedLog);
    }
  }

  info(message: string, options?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'message'>>) {
    this.log('info', message, options);
  }

  warn(message: string, options?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'message'>>) {
    this.log('warn', message, options);
  }

  error(message: string, options?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'message'>>) {
    this.log('error', message, options);
  }

  debug(message: string, options?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'message'>>) {
    this.log('debug', message, options);
  }

  // Helper for API request logging
  apiRequest(method: string, path: string, userId?: string, startTime?: number) {
    const duration = startTime ? Date.now() - startTime : undefined;
    this.info(`${method} ${path}`, {
      operation: 'api_request',
      userId,
      duration,
      metadata: { method, path }
    });
  }

  // Helper for database operation logging
  dbOperation(operation: string, table?: string, userId?: string, startTime?: number) {
    const duration = startTime ? Date.now() - startTime : undefined;
    this.debug(`Database ${operation}`, {
      operation: 'db_operation',
      userId,
      duration,
      metadata: { operation, table }
    });
  }
}

export const logger = new Logger();
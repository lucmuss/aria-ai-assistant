/**
 * Centralized Logging Module
 * Provides consistent logging across the extension with levels and timestamps
 */

// Log levels
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Current log level (can be changed via settings)
let currentLogLevel = LogLevel.DEBUG;

/**
 * Format timestamp
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString();
}

/**
 * Format log message
 */
function formatMessage(level, module, message, data = null) {
  const timestamp = getTimestamp();
  const levelStr = Object.keys(LogLevel).find(key => LogLevel[key] === level);
  
  let formatted = `[${timestamp}] [${levelStr}] [${module}] ${message}`;
  
  if (data !== null && data !== undefined) {
    formatted += '\n' + JSON.stringify(data, null, 2);
  }
  
  return formatted;
}

/**
 * Log to console with appropriate method
 */
function logToConsole(level, module, message, data = null) {
  if (level < currentLogLevel) return;
  
  const formatted = formatMessage(level, module, message, data);
  
  switch (level) {
    case LogLevel.DEBUG:
      console.log(formatted);
      break;
    case LogLevel.INFO:
      console.info(formatted);
      break;
    case LogLevel.WARN:
      console.warn(formatted);
      break;
    case LogLevel.ERROR:
      console.error(formatted);
      break;
  }
}

/**
 * Create a logger for a specific module
 */
export function createLogger(moduleName) {
  return {
    debug: (message, data) => logToConsole(LogLevel.DEBUG, moduleName, message, data),
    info: (message, data) => logToConsole(LogLevel.INFO, moduleName, message, data),
    warn: (message, data) => logToConsole(LogLevel.WARN, moduleName, message, data),
    error: (message, data) => logToConsole(LogLevel.ERROR, moduleName, message, data),
    
    // Utility methods
    logFunctionCall: (functionName, args = null) => {
      logToConsole(LogLevel.DEBUG, moduleName, `Function called: ${functionName}`, args);
    },
    
    logFunctionResult: (functionName, result = null) => {
      logToConsole(LogLevel.DEBUG, moduleName, `Function result: ${functionName}`, result);
    },
    
    logError: (functionName, error) => {
      logToConsole(LogLevel.ERROR, moduleName, `Error in ${functionName}: ${error.message}`, {
        stack: error.stack,
        error: error
      });
    }
  };
}

/**
 * Set the global log level
 */
export function setLogLevel(level) {
  if (typeof level === 'string') {
    currentLogLevel = LogLevel[level.toUpperCase()] || LogLevel.INFO;
  } else {
    currentLogLevel = level;
  }
}

/**
 * Export log levels for external use
 */
export { LogLevel };

/**
 * List of Node.js internal async resource types that should be ignored
 * These are system-level operations not relevant for user code visualization
 */
export const IGNORED_ASYNC_TYPES = [
  // File System
  'FSEVENTWRAP',
  'FSREQCALLBACK',
  'FSREQPROMISE',

  // Network
  'GETADDRINFOREQWRAP',
  'GETNAMEINFOREQWRAP',
  'HTTPPARSER',
  'HTTPCLIENTREQUEST',
  'HTTPINCOMINGMESSAGE',
  'TCPCONNECTWRAP',
  'TCPSERVERWRAP',
  'TCPWRAP',
  'UDPSENDWRAP',
  'UDPWRAP',

  // IPC/Pipes
  'PIPECONNECTWRAP',
  'PIPEWRAP',
  'PIPESERVERWRAP',

  // Process
  'PROCESSWRAP',
  'SIGNALWRAP',
  'STATWATCHER',

  // DNS
  'QUERYWRAP',
  'DNSCHANNEL',

  // Crypto
  'PBKDF2REQUEST',
  'RANDOMBYTESREQUEST',
  'TLSWRAP',
  'SSLCONNECTION',

  // Compression
  'ZLIB',

  // Other
  'JSSTREAM',
  'SHUTDOWNWRAP',
  'TTYWRAP',
  'WRITEWRAP',

  // Timers (we use Timeout, not TickObject)
  'TickObject',
] as const;

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

/**
 * College Network Whitelist Middleware
 *
 * Restricts face registration and attendance endpoints to requests
 * originating from the college network (IP whitelist).
 *
 * Configure via env var:
 *   COLLEGE_IP_WHITELIST=192.168.1.0/24,10.0.0.0/8,172.16.0.0/12
 *   COLLEGE_NETWORK_ENABLED=true
 *
 * If COLLEGE_NETWORK_ENABLED is not 'true', the middleware is a no-op
 * (useful in development).
 */

/** Converts a CIDR string to a mask checker function */
function makeCIDRChecker(cidr: string): (ip: string) => boolean {
  const [base, prefixLen] = cidr.split('/');
  const prefix = parseInt(prefixLen ?? '32', 10);
  const baseNum = ipToNum(base);
  if (baseNum === null) return () => false;

  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const network = (baseNum & mask) >>> 0;

  return (ip: string): boolean => {
    const num = ipToNum(ip);
    if (num === null) return false;
    return ((num & mask) >>> 0) === network;
  };
}

function ipToNum(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => isNaN(n) || n < 0 || n > 255)) return null;
  return ((nums[0] << 24) | (nums[1] << 16) | (nums[2] << 8) | nums[3]) >>> 0;
}

/** Parse the COLLEGE_IP_WHITELIST env into CIDR checkers */
function buildCheckers(): Array<(ip: string) => boolean> {
  const raw = process.env.COLLEGE_IP_WHITELIST || '';
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      // Plain IP without prefix → treat as /32
      if (!entry.includes('/')) entry = `${entry}/32`;
      return makeCIDRChecker(entry);
    });
}

let _checkers: Array<(ip: string) => boolean> | null = null;
const getCheckers = () => {
  if (!_checkers) _checkers = buildCheckers();
  return _checkers;
};

/** Extract the real client IP from the request */
function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '';
}

/**
 * Middleware: requireCollegeNetwork
 * Apply to routes that must be accessed only from within the college campus.
 */
export const requireCollegeNetwork = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If feature is disabled (e.g., in dev mode), skip check
  if (process.env.COLLEGE_NETWORK_ENABLED !== 'true') {
    return next();
  }

  const checkers = getCheckers();
  if (checkers.length === 0) {
    // No whitelist configured → allow all (safety fallback)
    console.warn('[NetworkCheck] COLLEGE_IP_WHITELIST not set. Allowing all IPs.');
    return next();
  }

  const clientIP = getClientIP(req);
  const isAllowed = checkers.some((check) => check(clientIP));

  if (!isAllowed) {
    res.status(403).json({
      success: false,
      code: 'OUTSIDE_COLLEGE_NETWORK',
      message: 'This feature is only available within the college network. Please connect to the college Wi-Fi and try again.',
      clientIP,
    });
    return;
  }

  next();
};

/**
 * GET /api/network/check
 * Returns whether the client is on the college network.
 * Used by the frontend to show/hide face registration option.
 */
export const networkCheckHandler = (req: Request, res: Response): void => {
  if (process.env.COLLEGE_NETWORK_ENABLED !== 'true') {
    res.json({ success: true, onCollegeNetwork: true, ip: getClientIP(req), message: 'Network check disabled in dev mode' });
    return;
  }

  const checkers = getCheckers();
  const clientIP = getClientIP(req);
  const onCollegeNetwork = checkers.length === 0 || checkers.some((check) => check(clientIP));

  res.json({
    success: true,
    onCollegeNetwork,
    ip: clientIP,
    message: onCollegeNetwork
      ? 'You are connected to the college network.'
      : 'You are NOT on the college network. Please connect to the college Wi-Fi.',
  });
};

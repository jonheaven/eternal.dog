import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, json, printf, colorize } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp(),
  printf(({ level, message, timestamp, requestId }) => {
    const rid = requestId ? ` [${requestId}]` : '';
    return `${timestamp} ${level}${rid}: ${message}`;
  })
);

const fileFormat = combine(timestamp(), json());

const transports: winston.transport[] = [
  new winston.transports.Console({
    level: process.env.DEBUG ? 'debug' : 'info',
    format: consoleFormat,
  }),
  new DailyRotateFile({
    filename: 'logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat,
  }),
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    level: 'error',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    format: fileFormat,
  }),
];

export const logger = winston.createLogger({
  level: 'info',
  defaultMeta: {},
  transports,
});

export function withRequest(meta: { requestId?: string }) {
  return logger.child({ requestId: meta.requestId });
}

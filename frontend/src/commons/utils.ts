import { RWAccess } from "../models/bucket";

export const getHumanSize = (size: number) => {
  if (size < 1000) return `${size} B`;
  if (size < 1000000) return `${(size / 1000).toFixed(1)} kB`;
  if (size < 1000000000) return `${(size / 1000000).toFixed(1)} MB`;
  if (size < 1000000000000) return `${(size / 1000000000).toFixed(1)} GB`;
}

export const parseReadWriteAccess = (rwAccess: RWAccess) => {
  return rwAccess.read && rwAccess.write ? "R/W" :
    rwAccess.read ? "R" : rwAccess.write ? "R" : "Unknown";
}
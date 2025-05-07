import resolveConfig from "tailwindcss/resolveConfig";
import _tailwindConfig from "../../../tailwind.config.js";

export const tailwindConfig = resolveConfig(_tailwindConfig);

export function getHumanSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1000000) return `${(size / 1000).toFixed(1)} kB`;
  if (size < 1000000000) return `${(size / 1000000).toFixed(1)} MB`;
  if (size < 1000000000000) return `${(size / 1000000000).toFixed(1)} GB`;
  return "N/A";
}

export function decodeJwtPayload(token: string) {
  return JSON.parse(atob(token.split(".")[1]));
}

export function parseS3Error(err: unknown) {
  console.log(err);
  if (err instanceof Error) {
    switch (err.name) {
      case "AccessDenied":
        return "Access Denied";
      case "BucketNotEmpty":
        return "Bucket is not empty";
      default:
        "Unknown Error";
    }
  }
  return "Unknown Error";
}

export function dateToHuman(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Europe/Rome",
  }).format(date);
}

export function dropDuplicates<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

import resolveConfig from "tailwindcss/resolveConfig";
import _tailwindConfig from "../../../tailwind.config.js";

export const tailwindConfig = resolveConfig(_tailwindConfig);

export const getHumanSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1000000) return `${(size / 1000).toFixed(1)} kB`;
  if (size < 1000000000) return `${(size / 1000000).toFixed(1)} MB`;
  if (size < 1000000000000) return `${(size / 1000000000).toFixed(1)} GB`;
  return "N/A";
};

export const camelToWords = (s: string) => {
  return s.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
};

export const decodeJwtPayload = (token: string) => {
  return JSON.parse(atob(token.split(".")[1]));
};

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

export const truncateString = (s: string, length: number) => {
  if (s.length <= length) {
    return s;
  }
  return s.slice(0, length) + "...";
};

export const extractPathAndBasename = (s: string) => {
  const items = s.split("/");
  const basename = items.length > 0 ? items.pop()! : s;
  const path = items.join("/");
  return [path, basename];
};

export const dropDuplicates = <T>(arr: T[]): T[] => {
  return [...new Set(arr)];
};

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

export function dateToHuman(date: Date): string {
  const now = Date.now();
  const delta = now - date.getTime();
  const sign = delta >= 0 ? -1 : 1;

  if (delta >= 0 && delta < 86400000) {
    return "today";
  }
  const absDelta = Math.abs(delta);
  const formatter = new Intl.RelativeTimeFormat("en");
  const days = Math.ceil(absDelta / 86400000);

  if (days <= 31) {
    return formatter.format(sign * days, "day");
  }

  const months = Math.floor(absDelta / 2678400000);
  if (months < 12) {
    return formatter.format(sign * months, "month");
  }

  const years = Math.floor(absDelta / 32140800000);
  return formatter.format(sign * years, "year");
}

export function dropDuplicates<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

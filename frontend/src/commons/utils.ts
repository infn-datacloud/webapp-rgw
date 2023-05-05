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

interface PathI {
  path: string,
  parent?: Path;
  name: string
  isAbsolute: boolean;
  removePrefix: (prefix: string) => Path;
  concat: (_: Path) => Path;
}

export class Path implements PathI {
  rawPath: string;
  pathElements: string[];

  constructor(path: string) {
    this.rawPath = path === "/" ? path : path.replace(/(\/+)$/, "");  // Remove trailing slashes
    this.pathElements = this.rawPath.split('/');
  }

  get path() {
    return this.rawPath;
  }

  removePrefix(prefix: string) {
    if (!this.rawPath.startsWith(prefix)) {
      throw new Error(`Prefix ${prefix} not found in path ${this.rawPath}`);
    }
    prefix = prefix === "/" ? prefix : prefix.replace(/(\/+)$/, "/");
    prefix = !prefix.endsWith("/") ? prefix + '/' : prefix;
    const re = new RegExp(`^${prefix}`);
    const newPath = this.path.replace(re, "");
    return new Path(newPath);
  }

  get name() {
    if (this.path === '/') {
      return '/';
    }
    return this.pathElements[this.pathElements.length - 1];
  }

  get parent(): Path | undefined {
    if (this.path === '/') {
      return new Path('/');
    }
    switch (this.pathElements.length) {
      case 0:
        throw new Error("Invalid path lenght: 0");
      case 1:
        return this.isAbsolute ? new Path("/") : undefined;
      case 2:
        return new Path(this.isAbsolute ? "/" : this.pathElements[0]);
      default:
        let newPathElements = [...this.pathElements];
        newPathElements.pop();
        const newPathString = newPathElements.join("/")
        return new Path(newPathString);
    }
  }

  get isAbsolute() {
    return this.path.startsWith("/");
  }

  concat(newPath: Path) {
    return newPath.isAbsolute ?
      new Path(this.rawPath + newPath.path) :
      new Path(this.rawPath + '/' + newPath.path);
  }
}

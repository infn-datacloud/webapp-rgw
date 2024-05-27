import { RWAccess } from "../models/bucket";

export const getHumanSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1000000) return `${(size / 1000).toFixed(1)} kB`;
  if (size < 1000000000) return `${(size / 1000000).toFixed(1)} MB`;
  if (size < 1000000000000) return `${(size / 1000000000).toFixed(1)} GB`;
  return "N/A";
};

export const parseReadWriteAccess = (rwAccess: RWAccess) => {
  return rwAccess.read && rwAccess.write
    ? "R/W"
    : rwAccess.read
      ? "R"
      : rwAccess.write
        ? "R"
        : "Unknown";
};

export const camelToWords = (s: string) => {
  return s.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
};

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

/** Add a custom key handler and provides a cleanup callback function.
 * Please remember to call the cleanup function when you have done with it.
 */
export const addKeyHandler = (key: string, callback: () => void) => {
  let cancel = false;
  const keyDownHandler = (event: KeyboardEvent) => {
    if (cancel) {
      return;
    }
    if (event.key === key) {
      event.preventDefault();
      callback();
    }
  };
  document.addEventListener("keydown", keyDownHandler);

  const cleanupCallback = function () {
    cancel = true;
    document.removeEventListener("keydown", keyDownHandler);
  };
  return cleanupCallback;
};

export class NodePath<T> {
  parent?: NodePath<T>;
  basename: string;
  value?: T;
  children: Map<string, NodePath<T>>;
  size: number;
  lastModified: Date;

  constructor(
    basename: string,
    value?: T,
    size: number = 0,
    lastModified = new Date("1970-01-01")
  ) {
    this.basename = basename;
    this.value = value;
    this.size = size;
    this.children = new Map<string, NodePath<T>>();
    this.lastModified = lastModified;
  }

  clone() {
    const newNode = new NodePath<T>(this.basename, this.value);
    newNode.parent = this.parent;
    return newNode;
  }

  addChild(node: NodePath<T>, path?: string) {
    if (path) {
      path = path.replace(/(^\/|\/$)/g, "");
      const directories = path.split("/");
      let currentNode: NodePath<T> = this;
      // Build the tree branches
      directories.forEach(dir => {
        let child = currentNode.children.get(dir);
        if (!child) {
          child = new NodePath<T>(dir);
          currentNode.addChild(child);
        }
        currentNode = child;
      });
      // Finally add the node
      currentNode.addChild(node);
    } else {
      node.parent = this;
      this.children.set(node.basename, node);
      // Walk the entire tree to sum up the file size
      if (node.size > 0) {
        let parent: NodePath<T> | undefined = node.parent;
        while (parent) {
          parent.size += node.size;
          if (node.lastModified > parent.lastModified) {
            parent.lastModified = node.lastModified;
          }
          parent = parent.parent;
        }
      }
    }
  }

  removeChild(node: NodePath<T>) {
    return this.children.delete(node.basename);
  }

  get path(): string {
    const { parent } = this;
    let p = "";
    if (parent) {
      if (parent.path === "/" || parent.path === "") {
        p = parent.path + this.basename;
      } else {
        p = parent.path + "/" + this.basename;
      }
    } else {
      p = this.basename;
    }
    return p;
  }

  get isDir(): boolean {
    return this.children.size > 0;
  }

  print(level = 0) {
    console.log(" ".repeat(level * 2) + this.basename);
    for (const child of this.children.values()) {
      child.print(level + 1);
    }
  }

  get(path: string): NodePath<T> | undefined {
    path = path.replace(/(^\/|\/$)/g, "");
    const levels = path.split("/");
    let nextLevel = levels.shift();
    let currentNode: NodePath<T> | undefined = this;
    while (nextLevel) {
      currentNode = currentNode?.children.get(nextLevel);
      nextLevel = levels.shift();
    }
    return currentNode;
  }

  getAll() {
    let result: NodePath<T>[] = Array.from(this.children.values()).filter(
      c => c.children.size === 0
    );
    this.children.forEach(c => {
      result = result.concat(c.getAll());
    });
    return result;
  }
}

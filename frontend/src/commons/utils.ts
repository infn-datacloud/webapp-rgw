import { RWAccess } from "../models/bucket";

export const getHumanSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1000000) return `${(size / 1000).toFixed(1)} kB`;
  if (size < 1000000000) return `${(size / 1000000).toFixed(1)} MB`;
  if (size < 1000000000000) return `${(size / 1000000000).toFixed(1)} GB`;
  return "N/A";
}

export const parseReadWriteAccess = (rwAccess: RWAccess) => {
  return rwAccess.read && rwAccess.write ? "R/W" :
    rwAccess.read ? "R" : rwAccess.write ? "R" : "Unknown";
}

export const camelToWords = (s: string) => {
  return s.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
}

export const truncateString = (s: string, length: number) => {
  if (s.length <= length) {
    return s;
  }
  return s.slice(0, length) + "..."
}


export class NodePath<T> {
  parent?: NodePath<T>;
  basename: string;
  value?: T;
  children: Map<string, NodePath<T>>;
  size: number;

  constructor(basename: string, value?: T, size: number = 0) {
    this.basename = basename;
    this.value = value;
    this.size = size;
    this.children = new Map<string, NodePath<T>>();
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
        let parent : NodePath<T> | undefined = node.parent;
        while (parent) {
          parent.size += node.size;
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
      if (parent.path === '/' || parent.path === '') {
        p = parent.path + this.basename;
      } else {
        p = parent.path + '/' + this.basename;
      }
    } else {
      p = this.basename;
    }
    return p;
  }

  print(level = 0) {
    console.log(" ".repeat(level * 2) + this.basename);
    for (let c of this.children.values()) {
      c.print(level + 1);
    }
  }

  get(path: string): NodePath<T> | undefined {
    path = path.replace(/(^\/|\/$)/g, "");
    const levels = path.split("/");
    let nextLevel = levels.shift();
    let node: NodePath<T> | undefined = this;
    while (nextLevel) {
      node = node?.children.get(nextLevel);
      nextLevel = levels.shift()
    }
    return node;
  }

  getAll() {
    let result: NodePath<T>[] = Array.from(this.children.values())
      .filter(c => c.children.size === 0);
    this.children.forEach(c => {
      result = result.concat(c.getAll());
    });
    return result;
  }
}

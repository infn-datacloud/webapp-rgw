import { RWAccess } from "../models/bucket";

export const getHumanSize = (size: number) => {
  if (size < 1000) return `${size} B`;
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

export interface INodePath<T> {
  parent?: INodePath<T>;
  basename: string;
  path: string;
  value?: T;
  children: INodePath<T>[];
  addChild: (_: INodePath<T>) => void;
  findChild: (_: string) => INodePath<T> | undefined;
  removeChild: (_: NodePath<T>) => boolean;
  print: (_: number) => void;
  getAll: () => INodePath<T>[];
  clone: () => INodePath<T>;
}

export class NodePath<T> implements INodePath<T> {
  parent?: INodePath<T>;
  basename: string;
  value?: T;
  children: INodePath<T>[];

  constructor(basename: string, value?: T) {
    this.basename = basename;
    this.value = value;
    this.children = [];
  }

  clone() {
    const newNode = new NodePath<T>(this.basename, this.value);
    newNode.parent = this.parent;
    return newNode;
  }

  addChild(node: INodePath<T>) {
    node.parent = this;
    this.children.push(node);
  }

  findChild(basename: string): INodePath<T> | undefined {
    const result = this.children.filter(c => c.basename === basename);
    if (result.length) {
      return result[0];
    }
    return undefined;
  }

  removeChild(node: INodePath<T>) {
    const index = this.children.map(c => c.value).indexOf(node.value);
    if (index >= 0) {
      this.children.splice(index, 1);
      return true;
    }
    return false;
  }

  get path() {
    const { parent } = this;
    if (parent) {
      if (parent.path === '/' || parent.path === '') {
        return parent.path + this.basename;
      }
      return parent.path + '/' + this.basename;
    } else {
      return this.basename;
    }
  }

  print(level = 0) {
    console.log(" ".repeat(level * 2) + this.basename);
    this.children.forEach(c => {
      c.print(level + 1);
    })
  }

  getAll() {
    let result: NodePath<T>[] = this.children.filter(c => c.children.length === 0);
    this.children.forEach(c => {
      result = result.concat(c.getAll());
    });
    return result;
  }
}

export function addPath<T>(path: string, node: NodePath<T>, value?: T) {
  const args = path.split("/");
  let currentNode = node;
  args.forEach(arg => {
    const child = currentNode.findChild(arg);
    if (child) {
      currentNode = child;
    } else {
      const pArg = new NodePath(arg, value);
      currentNode.addChild(pArg);
      currentNode = pArg;
    }
  });
}
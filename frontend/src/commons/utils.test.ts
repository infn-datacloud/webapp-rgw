import { Path } from "./utils";

test("Path 1", () => {
  const p = new Path("/this/is/a/path/");
  expect(p.isAbsolute).toBe(true);
  expect(p.name).toBe("path");
  expect(p.parent?.name).toBe("a");
  expect(p.toStr()).toBe("/this/is/a/path");
});

test("Path 2", () => {
  const p = new Path("/this/is/a/path");
  expect(p.isAbsolute).toBe(true);
  expect(p.name).toBe("path");
  expect(p.parent?.name).toBe("a");
  expect(p.toStr()).toBe("/this/is/a/path");
});

test("Path 3", () => {
  const p = new Path("this/is/a/path/");
  expect(p.isAbsolute).toBe(false);
  expect(p.name).toBe("path");
  expect(p.parent?.name).toBe("a");
  expect(p.toStr()).toBe("this/is/a/path");
});

test("Path 4", () => {
  const p = new Path("this/is/a/path");
  expect(p.isAbsolute).toBe(false);
  expect(p.name).toBe("path");
  expect(p.parent?.name).toBe("a");
  expect(p.toStr()).toBe("this/is/a/path");
});

test("Path 5", () => {
  const p = new Path("/this/is/a/");
  expect(p.isAbsolute).toBe(true);
  expect(p.name).toBe("a");
  expect(p.parent?.name).toBe("is");
  expect(p.toStr()).toBe("/this/is/a");
});

test("Path 6", () => {
  const p = new Path("/this/is/a");
  expect(p.isAbsolute).toBe(true);
  expect(p.name).toBe("a");
  expect(p.parent?.name).toBe("is");
  expect(p.toStr()).toBe("/this/is/a");
});

test("Path 7", () => {
  const p = new Path("this/is/a");
  expect(p.isAbsolute).toBe(false);
  expect(p.name).toBe("a");
  expect(p.parent?.name).toBe("is");
  expect(p.toStr()).toBe("this/is/a");
});

test("Path 8", () => {
  const p = new Path("this/is/a/");
  expect(p.isAbsolute).toBe(false);
  expect(p.name).toBe("a");
  expect(p.parent?.name).toBe("is");
  expect(p.toStr()).toBe("this/is/a");
});

test("Path 9", () => {
  const p = new Path("/this/is");
  expect(p.isAbsolute).toBe(true);
  expect(p.name).toBe("is");
  expect(p.parent?.name).toBe("this");
  expect(p.toStr()).toBe("/this/is");
});

test("Path 10", () => {
  const p = new Path("/this/is/");
  expect(p.isAbsolute).toBe(true);
  expect(p.name).toBe("is");
  expect(p.parent?.name).toBe("this");
  expect(p.toStr()).toBe("/this/is");
});

test("Path 11", () => {
  const p = new Path("this/is");
  expect(p.isAbsolute).toBe(false);
  expect(p.name).toBe("is");
  expect(p.parent?.name).toBe("this");
  expect(p.toStr()).toBe("this/is");
});

test("Path 12", () => {
  const p = new Path("this/is/");
  expect(p.isAbsolute).toBe(false);
  expect(p.name).toBe("is");
  expect(p.parent?.name).toBe("this");
  expect(p.toStr()).toBe("this/is");
});

test("Path 13", () => {
  const p = new Path("/this");
  expect(p.isAbsolute).toBe(true);
  expect(p.name).toBe("this");
  expect(p.parent?.name).toBe("/");
  expect(p.toStr()).toBe("/this");
});

test("Path 14", () => {
  const p = new Path("/this/");
  expect(p.isAbsolute).toBe(true);
  expect(p.name).toBe("this");
  expect(p.parent?.name).toBe("/");
  expect(p.toStr()).toBe("/this");
});

test("Path 15", () => {
  const p = new Path("this");
  expect(p.isAbsolute).toBe(false);
  expect(p.name).toBe("this");
  expect(p.parent?.name).toBe(undefined);
  expect(p.toStr()).toBe("this");
});

test("Path 16", () => {
  const p = new Path("this/");
  expect(p.isAbsolute).toBe(false);
  expect(p.name).toBe("this");
  expect(p.parent?.name).toBe(undefined);
  expect(p.toStr()).toBe("this");
});

test("Path 17", () => {
  const p = new Path("/");
  expect(p.isAbsolute).toBe(true);
  expect(p.name).toBe("/");
  expect(p.parent?.name).toBe("/");
  expect(p.toStr()).toBe("/");
});

test("Path 18", () => {
  const p = new Path("");
  expect(p.isAbsolute).toBe(false);
  expect(p.name).toBe("");
  expect(p.parent?.name).toBe(undefined);
  expect(p.toStr()).toBe("");
});

test("Path 19", () => {
  const p = new Path("/this/path//");
  expect(p.isAbsolute).toBe(true);
  expect(p.name).toBe("path");
  expect(p.parent?.name).toBe("this");
  expect(p.toStr()).toBe("/this/path");
});

test("Path 20", () => {
  const p = new Path("/this/path///");
  expect(p.isAbsolute).toBe(true);
  expect(p.name).toBe("path");
  expect(p.parent?.name).toBe("this");
  expect(p.toStr()).toBe("/this/path");
});

test("Prefix 1", () => {
  const p = new Path("/this/is/a/path/");
  expect(p.isAbsolute).toBe(true);
  expect(p.name).toBe("path");
  expect(p.parent?.name).toBe("a");
  expect(p.toStr()).toBe("/this/is/a/path");
  expect(p.removePrefix("/this/").toStr()).toBe("is/a/path");
});

test("Prefix 2", () => {
  const p = new Path("/this/is/a/path/");
  expect(p.isAbsolute).toBe(true);
  expect(p.name).toBe("path");
  expect(p.parent?.name).toBe("a");
  expect(p.toStr()).toBe("/this/is/a/path");
  expect(p.removePrefix("/this").toStr()).toBe("is/a/path");
});

test("Prefix 3", () => {
  const p = new Path("/this/is/a/path/");
  expect(() => {
    p.removePrefix("/is/a");
  }).toThrow();
});

test("Prefix 4", () => {
  const p = new Path("/this/is/a/path/");
  expect(p.removePrefix("/this/is").toStr()).toBe("a/path");
});

test("Concat 1", () => {
  const p1 = new Path("/this/is/a/path/");
  const p2 = new Path("foo");
  const p3 = p1.concat(p2);
  expect(p3.toStr()).toBe("/this/is/a/path/foo");
})

test("Concat 2", () => {
  const p1 = new Path("/this/is/a/path");
  const p2 = new Path("/foo");
  const p3 = p1.concat(p2);
  expect(p3.toStr()).toBe("/this/is/a/path/foo");
})

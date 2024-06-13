import { NodePath, extractPathAndBasename } from ".";
import { dropDuplicates } from ".";

test("NodePath 1", () => {
  const root = new NodePath<string>("/");

  root.addChild(new NodePath("foo", "value1", 10), "this/is/b/path");
  expect(root.get("this")?.size).toBe(10);
  root.addChild(new NodePath("bar", "value2", 20), "this/is/another/path");
  expect(root.get("this")?.size).toBe(30);
  root.addChild(new NodePath("baz", "value3", 30), "this/is/b/path");
  expect(root.size).toBe(60);

  const p1 = root.get("this/is/b/path/foo")!;
  const p2 = root.get("this/is/another/path/bar")!;
  const p3 = root.get("this/is/b/path/baz")!;

  expect(p1.basename).toBe("foo");
  expect(p2.basename).toBe("bar");
  expect(p3.basename).toBe("baz");

  expect(p1.path).toBe("/this/is/b/path/foo");
  expect(p2.path).toBe("/this/is/another/path/bar");
  expect(p3.path).toBe("/this/is/b/path/baz");

  expect(p1.children.size).toBe(0);
  expect(p2.children.size).toBe(0);
  expect(p3.children.size).toBe(0);

  expect(root.children.size).toBe(1);
  expect(root.get("this")?.children.size).toBe(1);
  expect(root.get("this/is")?.children.size).toBe(2);
  expect(root.get("this/is/b")?.children.size).toBe(1);
  expect(root.get("this/is/b/path")?.children.size).toBe(2);
  expect(root.get("this/is/another")?.children.size).toBe(1);
  expect(root.get("this/is/another/path")?.children.size).toBe(1);

  expect(p1.parent?.parent?.basename).toBe("b");
  expect(p2.parent?.parent?.basename).toBe("another");
  expect(p3.parent?.parent?.basename).toBe("b");

  expect(p1.value).toBe("value1");
  expect(p2.value).toBe("value2");
  expect(p3.value).toBe("value3");

  expect(p1.size).toBe(10);
  expect(p2.size).toBe(20);
  expect(p3.size).toBe(30);

  expect(root.size).toBe(60);
  expect(root.get("this")?.size).toBe(60);
  expect(root.get("this/is")?.size).toBe(60);
  expect(root.get("this/is/b")?.size).toBe(40);
  expect(root.get("this/is/another")?.size).toBe(20);
});

test("NodePath 2", () => {
  const root = new NodePath("", "");

  root.addChild(new NodePath("foo", "value 1", 10), "this/is/a/path");
  root.addChild(new NodePath("bar", "value 2", 20), "this/is/another/path");
  root.addChild(new NodePath("baz", "value 2", 20), "this/is/a/path");

  let result = root.getAll();
  expect(
    result.map(r => {
      return r.path;
    })
  ).toStrictEqual([
    "this/is/a/path/foo",
    "this/is/a/path/baz",
    "this/is/another/path/bar",
  ]);

  const pThis = root.get("this");
  const pIs = pThis?.get("is");
  const pA = pIs?.get("a");

  result = pA!.getAll();

  expect(
    result.map(r => {
      return r.path;
    })
  ).toStrictEqual(["this/is/a/path/foo", "this/is/a/path/baz"]);

  result = pIs!.get("another")!.getAll();
  expect(
    result.map(r => {
      return r.path;
    })
  ).toStrictEqual(["this/is/another/path/bar"]);
});

test("NodePath 3", () => {
  const root = new NodePath("/");
  root.addChild(new NodePath("foo", "value 1", 10), "this/is/a/path");
  root.addChild(new NodePath("bar", "value 2", 20), "this/is/another/path");
  root.addChild(new NodePath("baz", "value 3", 30), "this/is/a/path");

  expect(root.getAll().length).toBe(3);
  const thisIs = root.get("this/is")!;
  expect(thisIs.path).toBe("/this/is");
  expect(thisIs.children.size).toBe(2);

  const child = thisIs.get("a")!;
  let deleted = thisIs.removeChild(child);
  expect(deleted).toBe(true);
  deleted = thisIs.removeChild(new NodePath("foo"));
  expect(deleted).toBe(false);
  expect(thisIs.children.size).toBe(1);
  expect(root.getAll().length).toBe(1);
});

test("extractPathAndBasename", () => {
  let objectPath = "/this/is/a/long/path";
  let [path, basename] = extractPathAndBasename(objectPath);
  expect(path).toBe("/this/is/a/long");
  expect(basename).toBe("path");

  objectPath = "this/is/another/object";
  [path, basename] = extractPathAndBasename(objectPath);
  expect(path).toBe("this/is/another");
  expect(basename).toBe("object");

  objectPath = "/short/path";
  [path, basename] = extractPathAndBasename(objectPath);
  expect(path).toBe("/short");
  expect(basename).toBe("path");

  objectPath = "short/path";
  [path, basename] = extractPathAndBasename(objectPath);
  expect(path).toBe("short");
  expect(basename).toBe("path");

  objectPath = "foo";
  [path, basename] = extractPathAndBasename(objectPath);
  expect(path).toBe("");
  expect(basename).toBe("foo");
});

test("Drop Duplicates", () => {
  const sizes = [10, 100, 1000];
  const arr = [
    "cygno-analysis",
    "cygno-data",
    "cygno-sim",
    "lhcb-data",
    "cygno-analysis",
    "cygno-data",
    "cygno-sim",
    "alice-data",
  ];

  const runTest = <T>(
    fn: (arr: T[]) => T[],
    arr: T[],
    size: number,
    iterations: number
  ) => {
    let t = [...arr];
    const u = [...arr];
    for (let i = 1; i < size; ++i) {
      t = t.concat(u);
    }
    const start = performance.now();
    let result: T[] = [];
    for (let i = 0; i < iterations; ++i) {
      result = fn(t);
    }

    const end = performance.now();
    const elapsed = end - start;
    console.log(
      `Array length: ${t.length}\n` +
        `Iterations: ${iterations}\n` +
        `Runtime: ${elapsed}\n` +
        `Time per iteration: ${elapsed / iterations}`
    );
    return result;
  };

  sizes.forEach(size => {
    [dropDuplicates].forEach(fn => {
      console.log("Testing function:", fn);
      const result: string[] = runTest(fn, arr, size, 100);
      result.sort();
      expect(result).toStrictEqual([
        "alice-data",
        "cygno-analysis",
        "cygno-data",
        "cygno-sim",
        "lhcb-data",
      ]);
    });
  });
});

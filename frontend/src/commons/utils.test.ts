import { NodePath, addPath } from "./utils";

test("NodePath 1", () => {
  const root = new NodePath("", "");

  addPath("this/is/a/path", root, "value1");
  addPath("this/is/another/path", root, "value2");
  addPath("this/is/a/file", root, "value3");

  const p1 = root.children[0].children[0].children[0].children[0];
  const p2 = root.children[0].children[0].children[1].children[0];
  const p3 = root.children[0].children[0].children[0].children[1];

  expect(p1.basename).toBe("path");
  expect(p2.basename).toBe("path");
  expect(p3.basename).toBe("file");

  expect(p1.path).toBe("this/is/a/path");
  expect(p2.path).toBe("this/is/another/path");
  expect(p3.path).toBe("this/is/a/file");

  expect(p1.parent?.basename).toBe("a");
  expect(p2.parent?.basename).toBe("another");
  expect(p3.parent?.basename).toBe("a");

  expect(p1.value).toBe("value1");
  expect(p2.value).toBe("value2");
  expect(p3.value).toBe("value3");
});

test("NodePath 2", () => {
  const root = new NodePath("", "");

  addPath("this/is/a/path", root, "value1");
  addPath("this/is/another/path", root, "value2");
  addPath("this/is/a/file", root, "value3");

  const r1 = root.getAll();
  expect(r1.map(r => { return r.path })).toStrictEqual([
    "this/is/a/path",
    "this/is/a/file",
    "this/is/another/path"
  ])

  const level1 = root.children[0];
  const level2 = level1.children[0];
  const level3 = level2.findChild('a')!;
  const r2 = level3.getAll();

  expect(r2.map(r => { return r.path })).toStrictEqual([
    "this/is/a/path",
    "this/is/a/file"
  ]);

  const level3bis = level2.findChild('another')!;
  const r3 = level3bis.getAll();

  expect(r3.map(r => { return r.path })).toStrictEqual(["this/is/another/path"]);
});

test("NodePath 3", () => {
  const root = new NodePath("", "");

  addPath("this/is/a/path", root, "value1");
  addPath("this/is/another/path", root, "value2");
  addPath("this/is/a/file", root, "value3");

  expect(root.getAll().length).toBe(3);

  const thisIs = root.children[0].children[0];
  expect(thisIs.path).toBe("this/is");
  expect(thisIs.children.length).toBe(2);

  const child = thisIs.findChild("a");
  if (child) {
    let deleted = thisIs.removeChild(child);
    expect(deleted).toBe(true);
    deleted = thisIs.removeChild(new NodePath("foo"));
    expect(deleted).toBe(false);
  }

  expect(thisIs.children.length).toBe(1);
  expect(root.getAll().length).toBe(1);
});
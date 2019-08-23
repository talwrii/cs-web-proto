import { PvResolver, NoMapping, ResolvedPv } from "./connectionMiddleware";

/* So a *resolution* can result in subscriptions


*/

it("maps correctly", (): void => {
  let resolver = new PvResolver();
  resolver.mapMacro("name", "dave");
  let result = resolver.resolve("hello:${name}");
  expect(result.pv.resolvedName).toBe("hello:dave");
  expect(result.newResolutions.length).toBe(1);
  expect(result.newResolutions[0].resolvedName).toBe("hello:dave");

  let result2 = resolver.resolve("hello:${name}");
  expect(result2.pv.resolvedName).toBe("hello:dave");
  expect(result2.newResolutions.length).toBe(0);
});

it("prompts refreshes on collision", (): void => {
  let resolver = new PvResolver();
  resolver.mapMacro("name", "dave");
  resolver.mapMacro("nom", "dave");
  let result = resolver.resolve("hello:${name}");
  let collisionResult = resolver.resolve("hello:${nom}");

  expect(collisionResult.pv.resolvedName).toBe("hello:dave");
  expect(collisionResult.newResolutions.length).toBe(0);

  expect(collisionResult.duplicateResolutions.length).toBe(1);
  expect(collisionResult.duplicateResolutions[0].resolvedName).toBe(
    "hello:dave"
  );
});

it("reverse maps correctly", (): void => {
  let resolver = new PvResolver();
  resolver.mapMacro("name", "dave");
  resolver.resolve("hello:${name}");
  let result = resolver.unresolve(new ResolvedPv("hello:dave"));
  expect(result).toStrictEqual(["hello:${name}"]);
});

it("supports reverse map collisions", (): void => {
  let resolver = new PvResolver();
  resolver.mapMacro("name", "dave");
  resolver.mapMacro("other", "dave");

  resolver.resolve("hello:${name}");
  resolver.resolve("hello:${other}");
  let unresolved = resolver.unresolve(new ResolvedPv("hello:dave"));
  expect(unresolved).toStrictEqual(["hello:${name}", "hello:${other}"]);
});

it("supports remap", (): void => {
  let resolver = new PvResolver();
  let mapping1 = resolver.mapMacro("name", "dave");
  expect(mapping1.newResolutions.length).toBe(0);
  let result = resolver.resolve("hello:${name}");
  expect(result.pv.resolvedName).toBe("hello:dave");

  let mapping2 = resolver.mapMacro("name", "tim");
  expect(mapping2.newResolutions.length).toBe(1);
  expect(mapping2.newResolutions[0].resolvedName).toBe("hello:tim");
  expect(mapping2.removedResolutions[0].resolvedName).toBe("hello:dave");

  let resultTim = resolver.resolve("hello:${name}");
  expect(resultTim.pv.resolvedName).toBe("hello:tim");
  expect(resultTim.newResolutions.length).toBe(0);
});

it("missing mapping", (): void => {
  let resolver = new PvResolver();
  resolver.mapMacro("name", "dave");
  expect((): any => resolver.resolve("hello:${nam}")).toThrowError(
    new NoMapping("nam")
  );
});

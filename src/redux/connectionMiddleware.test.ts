import { PvResolver, NoMapping } from "./connectionMiddleware";

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
  expect((): never => resolver.resolve("hello:${nam}")).toThrowError(
    new NoMapping("nam")
  );
});

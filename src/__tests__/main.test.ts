import ExpressAwsCognito from "../main";

describe("Testing Negative Scenarios", () => {
  test("Initialize without parameters", function () {
    expect(new ExpressAwsCognito(undefined as any)).toThrowError(
      /Configuration is required./
    );
  });
});

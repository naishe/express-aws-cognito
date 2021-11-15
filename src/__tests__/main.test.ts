import Config from "../Config";
import ExpressAwsCognito from "../main";
import { sanitizeConfig } from "../utils";

jest.setTimeout(10_000);

const minimalValidConf: Config = {
  cognitoUserPoolId: "us-east-1_TcoKGbf7n",
  region: "us-east-1",
  tokenUse: "access",
};

// const notExistingUserPool = "us-east-1_TcoKGbf7n";

describe("Testing Negative Scenarios", () => {
  test("Initialize without parameters", function () {
    expect(() => new ExpressAwsCognito(undefined as any)).toThrowError(
      /Configuration is required./
    );
  });

  test("Initialize with wrong type", function () {
    expect(() => new ExpressAwsCognito("some string" as any)).toThrowError(
      /Configuration is required./
    );
  });

  test("Initialize with empty config", function () {
    expect(() => new ExpressAwsCognito({} as any)).toThrowError(
      /Congnito user pool id is required./
    );
  });

  test("Initialize without user pool", function () {
    expect(() => {
      const minusOneField = { ...minimalValidConf } as any;
      delete minusOneField["cognitoUserPoolId"];
      new ExpressAwsCognito(minusOneField);
    }).toThrowError(/Congnito user pool id is required./);
  });

  test("Initialize without region", function () {
    expect(() => {
      const minusOneField = { ...minimalValidConf } as any;
      delete minusOneField["region"];
      new ExpressAwsCognito(minusOneField);
    }).toThrowError(/Region is required./);
  });

  test("Initialize without tokenUse", function () {
    expect(() => {
      const minusOneField = { ...minimalValidConf } as any;
      delete minusOneField["tokenUse"];
      new ExpressAwsCognito(minusOneField);
    }).toThrowError(/The value of tokenUse must be either 'id' or 'access'./);
  });

  test("Initialize with wrong tokenExpiration type", function () {
    expect(() => {
      const wrongFieldType = { ...minimalValidConf } as any;
      wrongFieldType.tokenExpiration = true;
      new ExpressAwsCognito(wrongFieldType);
    }).toThrowError(
      /tokenExpiration must be either a number \(seconds\) or string./
    );
  });

  test("Initialize with wrong maxAge type", function () {
    expect(() => {
      const wrongFieldType = { ...minimalValidConf } as any;
      wrongFieldType.maxAge = true;
      new ExpressAwsCognito(wrongFieldType);
    }).toThrowError(/maxAge must be either a number \(seconds\) or string./);
  });

  test("Initialize with wrong onInitComplete type", function () {
    expect(() => {
      const wrongFieldType = { ...minimalValidConf } as any;
      wrongFieldType.onInitComplete = "";
      new ExpressAwsCognito(wrongFieldType);
    }).toThrowError(/onInitComplete must be a function./);
  });

  test("Initialize with wrong onInitFailed type", function () {
    expect(() => {
      const wrongFieldType = { ...minimalValidConf } as any;
      wrongFieldType.onInitFailed = "";
      new ExpressAwsCognito(wrongFieldType);
    }).toThrowError(/onInitFailed must be a function/);
  });

  test("Non existing user pool should call onInitFailed", function (done) {
    function onInitComplete() {
      expect(true).toBe(false);
      done();
    }

    function onInitFailed() {
      expect(true).toBe(true);
      done();
    }

    new ExpressAwsCognito({
      ...minimalValidConf,
      onInitComplete,
      onInitFailed,
    });
  });
});

describe("Testing Positive Scenarios", () => {
  test("Config is sanitized and return correctly", function () {
    expect(sanitizeConfig({ ...minimalValidConf })).toMatchObject(
      minimalValidConf
    );
  });

  // test("Config is sanitized and returne correctly", function (done) {
  //   function onInitComplete() {
  //     expect(true).toBe(true);
  //     done();
  //   }

  //   function onInitFailed() {
  //     expect(true).toBe(false);
  //     done();
  //   }

  //   new ExpressAwsCognito({
  //     ...minimalValidConf,
  //     onInitComplete,
  //     onInitFailed,
  //   });
  // });
});

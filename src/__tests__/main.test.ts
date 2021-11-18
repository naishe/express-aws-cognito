import Config from "../Config";
import ExpressAwsCognito from "../main";
import { sanitizeConfig } from "../utils";

jest.setTimeout(10_000);

const minimalValidConf: Config = {
  cognitoUserPoolId: "ap-south-1_oUjyqdXf1",
  region: "ap-south-1",
  tokenUse: "access",
};
// const validSub = "67915d9e-5d49-4e54-8970-6e331773c26c";

const notExistingUserPool = "ap-south-1_oUjyqdXf2";
const invalidIssuer = `https://cognito-idp.ap-south-1.amazonaws.com/${notExistingUserPool}`;

const expiredToken =
  "eyJraWQiOiI5XC9SdTRZelpsdjJCMVlxRE1KZlVyTmVrUWNPNE" +
  "J0NkZ4aURkUlBOZlwvMUE9IiwiYWxnIjoiUlMyNTYifQ.eyJvcmlnaW5fanRpIjoiMzViMTM4" +
  "ZWEtN2JhZi00NjE1LTg3YzMtOTk0MTdjZGYxNzQ3Iiwic3ViIjoiNjc5MTVkOWUtNWQ0OS00Z" +
  "TU0LTg5NzAtNmUzMzE3NzNjMjZjIiwiZXZlbnRfaWQiOiI2ZGU4ODEzMi04ZGUwLTRhNTEtOD" +
  "g4NS01YWNhNjBkODg3MjkiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2d" +
  "uaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNjM1MDU5MTQxLCJpc3MiOiJo" +
  "dHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGgtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0a" +
  "C0xX29VanlxZFhmMSIsImV4cCI6MTYzNzA3ODUzNSwiaWF0IjoxNjM3MDc0OTM1LCJqdGkiOi" +
  "JmYjI4YTZiMi03OGFhLTRlMGUtOGQ1MC1iMzQ2ZDU2ZDQ2NjQiLCJjbGllbnRfaWQiOiIyMnA" +
  "3MzVqZjdrcHFlYmRwbDA1dTJmcTZkdSIsInVzZXJuYW1lIjoiNjc5MTVkOWUtNWQ0OS00ZTU0L" +
  "Tg5NzAtNmUzMzE3NzNjMjZjIn0.dZSXHcUnpTDs-K071c0kh7kZGOEgAAqtP-zjDvTJF-0gpnP" +
  "SkQZybM7gMVtWq2Gj-Mtb4Xd3kFBewfBMj8WQ0ZV9S6rHPhuuAm9P73H-ozhtcqzigI7U815pn" +
  "RYR1xvZ0P93AJF6YMlERJma2Qze34MGaf6PGE8-jUwEhgeyu0FqRTuqjpChaVA7C5soPIK198c" +
  "cxMbT19qodJzBNtXCcs2m7AAmVZ7-0iaW-NIF75pRLPWWJGvVfT5dYqgMv0FVS6UgtnToh01vs" +
  "K0kp9W-65U9MN0n6A3GSbgFJhSw39zphY7TI4_QGlMacf6lRTRb7M4GbK6P2LZsfSIdHFiKEg";

const expiredIdToken =
  "eyJraWQiOiJKWTlIY0doamJWK3FNK2s5aVVBYktOSDRxVG5ZUFNNcnd5QThOM1ZmR3FjPSIsImFsZyI" +
  "6IlJTMjU2In0.eyJzdWIiOiI2NzkxNWQ5ZS01ZDQ5LTRlNTQtODk3MC02ZTMzMTc3M2MyNmMiLCJlbWF" +
  "pbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmFwLXNvdXRoLTEuYW1" +
  "hem9uYXdzLmNvbVwvYXAtc291dGgtMV9vVWp5cWRYZjEiLCJjb2duaXRvOnVzZXJuYW1lIjoiNjc5MTV" +
  "kOWUtNWQ0OS00ZTU0LTg5NzAtNmUzMzE3NzNjMjZjIiwib3JpZ2luX2p0aSI6IjM1YjEzOGVhLTdiYWY" +
  "tNDYxNS04N2MzLTk5NDE3Y2RmMTc0NyIsImF1ZCI6IjIycDczNWpmN2twcWViZHBsMDV1MmZxNmR1Iiw" +
  "iZXZlbnRfaWQiOiI2ZGU4ODEzMi04ZGUwLTRhNTEtODg4NS01YWNhNjBkODg3MjkiLCJ0b2tlbl91c2U" +
  "iOiJpZCIsImF1dGhfdGltZSI6MTYzNTA1OTE0MSwiZXhwIjoxNjM3MDc4NTM1LCJpYXQiOjE2MzcwNzQ" +
  "5MzUsImp0aSI6Ijg2NGYyNWY3LWM1ZjgtNDYwNi04NjBjLTdmNGI2ZDM1YTU2NyIsImVtYWlsIjoibml" +
  "zaGFudC5uZWVyYWorbG9jYWxAZ21haWwuY29tIn0.c72iCGF62GMYa57RscVotCHmvftagxSXy45DOHX" +
  "Vy8dN6XFEe1-YJyY_u4gUsVavvm9y_bfBnABAdcWqRX7PtdPN15sNIs2sUa_w5Bd1cP3DS3E9PAthxcr" +
  "VcxqlOZMA0ABRh96Q08ElthKuSspEVConDdB6DcJ33tzww5ulRM8n9YWCVvhz09p3zipuQOz-MVj1Gdy" +
  "V9qTgG5Xldrtealh9vQ_Zhkf7NePANmmMceqrTk0ui2qEI1urE6lZ0GwrLGpCEtHTFIYPnTw23a68W2e" +
  "86rbF3YDq1m_Jr7yjuqSNXysQwJDcLd1xAcmbdwZUOiLPk4c0LZbAt34B2CAQ7w";

beforeEach(() => {
  // Make sure each test starts fresh (can be set in jest.config.js with `restoreMocks: true`)
  jest.restoreAllMocks();
});

describe("#init", () => {
  test("Initialization", async () => {
    console.error = jest.fn();
    const init = jest.spyOn(ExpressAwsCognito.prototype as any, "init");
    const instance = new ExpressAwsCognito({
      ...minimalValidConf,
      cognitoUserPoolId: notExistingUserPool,
    });
    expect(init).toBeCalledTimes(1);
    await (instance as any).init();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/Unable to generate certificate due to/),
      expect.stringMatching(/.+/)
    );
  });
});

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
      done(new Error("Init complete called"));
    }

    function onInitFailed() {
      expect(true).toBe(true);
      done();
    }

    new ExpressAwsCognito({
      ...minimalValidConf,
      cognitoUserPoolId: notExistingUserPool,
      onInitComplete,
      onInitFailed,
    });
  });

  test("Validation before initialization should throw error", function () {
    expect(() =>
      new ExpressAwsCognito({
        ...minimalValidConf,
      }).validate("Some token")
    ).toThrowError(
      "The middleware is still initializing or failed during initialization."
    );
  });

  test("Invalid token should throw error", function (done) {
    function onInitComplete() {
      try {
        expect(() =>
          middleware.validate("Some invalid token string")
        ).toThrowError(/Invalid JWT. Token provided:/);
        done();
      } catch (e) {
        done(e);
      }
    }

    function onInitFailed() {
      done(new Error("Init failed called"));
    }

    const middleware = new ExpressAwsCognito({
      ...minimalValidConf,
      onInitComplete,
      onInitFailed,
    });
  });

  test("Expired token should throw error", function (done) {
    function onInitComplete() {
      try {
        expect(() => middleware.validate(expiredToken)).toThrowError(
          /jwt expired/
        );
        done();
      } catch (e) {
        done(e);
      }
    }

    function onInitFailed() {
      done(new Error("Init failed called"));
    }

    const middleware = new ExpressAwsCognito({
      ...minimalValidConf,
      onInitComplete,
      onInitFailed,
    });
  });

  test("Different token type should throw error", function (done) {
    function onInitComplete() {
      try {
        expect(() => middleware.validate(expiredIdToken)).toThrowError(
          /The configured user pool's token_use does not match with token's/
        );
        done();
      } catch (e) {
        done(e);
      }
    }

    function onInitFailed() {
      done(new Error("Init failed called"));
    }

    const middleware = new ExpressAwsCognito({
      ...minimalValidConf,
      onInitComplete,
      onInitFailed,
    });
  });

  test("Non matching key id should throw error", function (done) {
    function onInitComplete() {
      try {
        expect(() => {
          const fakeTokenObject = {
            payload: { iss: middleware.issuer, token_use: "access" },
            header: { kid: "Some garbage key id" },
          };
          (middleware as any).tokenSanityCheck(fakeTokenObject);
        }).toThrowError(/Invalid access token. No matching key_id found/);
        done();
      } catch (e) {
        done(e);
      }
    }

    function onInitFailed() {
      done(new Error("Init failed called"));
    }

    const middleware = new ExpressAwsCognito({
      ...minimalValidConf,
      onInitComplete,
      onInitFailed,
    });
  });

  test("Mismatch issues or issuer from a different pool should throw error", function (done) {
    function onInitComplete() {
      try {
        expect(() => {
          const fakeTokenObject = {
            payload: { iss: invalidIssuer, token_use: "access" },
            header: { kid: Object.keys(middleware.pems)[0] },
          };
          (middleware as any).tokenSanityCheck(fakeTokenObject);
        }).toThrowError(
          /The configured user pool does not match with token's user pool./
        );
        done();
      } catch (e) {
        done(e);
      }
    }

    function onInitFailed() {
      done(new Error("Init failed called"));
    }

    const middleware = new ExpressAwsCognito({
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

  test("Valid config should call onInitComplete", function (done) {
    function onInitComplete() {
      expect(true).toBe(true);
      done();
    }

    function onInitFailed() {
      done(new Error("Init failed called"));
    }

    new ExpressAwsCognito({
      ...minimalValidConf,
      onInitComplete,
      onInitFailed,
    });
  });

  // test("Valid token should return JSON payload", function (done) {
  //   function onInitComplete() {
  //     try {
  //       const payload = middleware.validate(validToken);
  //       expect(payload.sub).toEqual(validSub);
  //       done();
  //     } catch (e) {
  //       done(e);
  //     }
  //   }

  //   function onInitFailed() {
  //     done(new Error("Init failed called"));
  //   }

  //   const middleware = new ExpressAwsCognito({
  //     ...minimalValidConf,
  //     onInitComplete,
  //     onInitFailed,
  //   });
  // });

  test("Config is sanitized and returne correctly", function (done) {
    function onInitComplete() {
      expect(true).toBe(true);
      done();
    }

    function onInitFailed() {
      expect(true).toBe(false);
      done();
    }

    new ExpressAwsCognito({
      ...minimalValidConf,
      onInitComplete,
      onInitFailed,
    });
  });
});

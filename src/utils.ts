import Config from "./Config";

const URL_TO_CONF =
  "https://github.com/naishe/express-aws-cognito#Configuration";

const DEFAULT_TOKEN_EXPIRATION = 3600_000; // 1hr

export function sanitizeConfig(config: Config): Config {
  if (!config || typeof config !== "object") {
    throw new Error(
      `Configuration is required. See configuration: ${URL_TO_CONF}`
    );
  }

  const {
    cognitoUserPoolId,
    region,
    tokenUse,
    tokenExpiration = DEFAULT_TOKEN_EXPIRATION,
    onInitComplete,
    onInitFailed,
  } = config;
  if (!cognitoUserPoolId || cognitoUserPoolId.trim().length < 1) {
    throw new Error(
      `Congnito user pool id is not correct. Found: '${cognitoUserPoolId}'. Refer: ${URL_TO_CONF}`
    );
  }

  if (!region || region.trim().length < 1) {
    throw new Error(`Region is not correct. Refer: ${URL_TO_CONF}`);
  }

  if (!tokenUse || !["id", "access"].includes(tokenUse)) {
    throw new Error(
      `tokenUse must be either 'id' or 'access'. Refer: ${URL_TO_CONF}`
    );
  }

  if (onInitComplete && typeof onInitComplete !== "function") {
    throw new Error(
      `onInitComplete must be a function. This function is invokes after successful ` +
        `initialization of the middleware. Optionally, you can omit it.`
    );
  }

  if (onInitFailed && typeof onInitFailed !== "function") {
    throw new Error(
      `onInitFailed must be a function of type: (e: Error) => void. This function is invokes after unsuccessful ` +
        `initialization of the middleware. Optionally, you can omit it.`
    );
  }

  return {
    cognitoUserPoolId: cognitoUserPoolId.trim(),
    region: region.trim(),
    tokenUse: tokenUse.trim(),
    tokenExpiration,
  } as Config;
}

import Config from "./Config";

const URL_TO_CONF =
  "https://github.com/naishe/express-aws-cognito#Configuration";

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
    tokenExpiration,
    maxAge: maxAgePassed,
    onInitComplete,
    onInitFailed,
  } = config;
  if (!cognitoUserPoolId || cognitoUserPoolId.trim().length < 1) {
    throw new Error(
      `Congnito user pool id is required. Found: '${cognitoUserPoolId}'. Refer: ${URL_TO_CONF}`
    );
  }

  if (!region || region.trim().length < 1) {
    throw new Error(`Region is required. Refer: ${URL_TO_CONF}`);
  }

  if (!tokenUse || !["id", "access"].includes(tokenUse)) {
    throw new Error(
      `The value of tokenUse must be either 'id' or 'access'. Refer: ${URL_TO_CONF}`
    );
  }

  if (onInitComplete !== undefined && typeof onInitComplete !== "function") {
    throw new Error(
      `onInitComplete must be a function. This function is invokes after successful ` +
        `initialization of the middleware. Optionally, you can omit it.`
    );
  }

  if (onInitFailed !== undefined && typeof onInitFailed !== "function") {
    throw new Error(
      `onInitFailed must be a function of type: (e: Error) => void. This function is invokes after unsuccessful ` +
        `initialization of the middleware. Optionally, you can omit it.`
    );
  }

  const maxAge = maxAgePassed || tokenExpiration;
  if (maxAge !== undefined && !["string", "number"].includes(typeof maxAge)) {
    throw new Error(
      `${
        !!maxAgePassed ? "maxAge" : "tokenExpiration"
      } must be either a number (seconds) ` +
        `or string. For more info see here: https://github.com/vercel/ms` +
        `${
          !!tokenExpiration
            ? "\n\n Also, tokenExpiration is deprecated, please use maxAge."
            : ""
        }`
    );
  }

  return {
    cognitoUserPoolId: cognitoUserPoolId.trim(),
    region: region.trim(),
    tokenUse: tokenUse.trim(),
    maxAge,
    onInitComplete,
    onInitFailed,
  } as Config;
}

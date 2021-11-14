import { Jwt } from "jsonwebtoken";

/**
 * Initial configuration to set up the middleware
 */
export default interface Config {
  /**
   * Cognito user pool id
   *
   * *Example*: ap-south-1_oNniqdXf1
   */
  cognitoUserPoolId: string;

  /**
   * Type of token in use
   *
   * *Refer:* [AWS Documentation: Token Type](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html#amazon-cognito-identity-user-pools-using-id-and-access-tokens-in-web-api)
   */
  tokenUse: TokenUse;

  /**
   * The maximum allowed age for tokens to still be valid.
   * It is expressed in seconds or a string describing a time span [vercel/ms](https://github.com/vercel/ms).
   *
   * **Example:** 1000, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count.
   * If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit
   * is used by default ("120" is equal to "120ms").
   *
   * *Refer*: maxAge from [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
   *
   */
  tokenExpiration?: number | string;

  /**
   * AWS Region which this user pool belongs to. Currently, user pool id starts with aws region
   *
   * *Example*: ap-south-1
   */
  region: string;

  /**
   * This function is called when initialization successfully
   * completes and the middleware is ready to use
   */
  onInitComplete?: () => void;

  /**
   * This function is called when initialization fails for some reason.
   * If you don't provide this function, the error will be logged in console
   */
  onInitFailed?: (e: Error) => void;
}

export type TokenUse = "id" | "access";

export type CongnitoJwt = Jwt & { payload: { token_use?: TokenUse } };

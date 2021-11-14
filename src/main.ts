import jwt, { Jwt, JwtPayload } from "jsonwebtoken";
import jwk2Pem from "jwk-to-pem";
import fetch from "node-fetch";
import Config, { CongnitoJwt } from "./Config";
import Jwks from "./Jwks";
import { sanitizeConfig } from "./utils";
export default class ExpressAwsCognito {
  config: Config;
  issuer: string;
  initializationComplete = false;
  pems: Record<string, string> = {};

  constructor(config: Config) {
    this.config = sanitizeConfig(config);
    this.issuer = `https://cognito-idp.${this.config.region}.amazonaws.com/${this.config.cognitoUserPoolId}`;
    this.init();
  }

  private init() {
    fetch(`${this.issuer}/.well-known/jwks.json`)
      .then((resp) => resp.json() as Promise<Jwks>)
      .then((response) => {
        this.pems = response.keys.reduce((cum, { kid, n, e, kty }) => {
          cum[kid] = jwk2Pem({
            kty,
            n,
            e,
          });
          return cum;
        }, {} as Record<string, string>);
        this.initializationComplete = true;
        if (this.config.onInitComplete) {
          this.config.onInitComplete();
        }
      })
      .catch((err) => {
        if (this.config.onInitFailed) {
          this.config.onInitFailed(
            new Error("Unable to generate certificate due to \n" + err)
          );
        } else {
          console.error("Unable to generate certificate due to \n", err);
        }
      });
  }

  validate(token: string): JwtPayload {
    if (!this.initializationComplete) {
      throw new Error(
        "The middleware is still initializing or failed during initialization."
      );
    }
    const decodedToken: CongnitoJwt | null = jwt.decode(token, {
      complete: true,
    });
    if (!decodedToken) {
      throw new Error(`Invalid JWT. Token provided:\n${token}`);
    }
    const pem = this.tokenSanityCheck(decodedToken);

    return jwt.verify(token, pem, {
      issuer: this.issuer,
      // @ts-ignore refer: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/57146
      maxAge: this.config.tokenExpiration,
    });
  }

  private tokenSanityCheck(decodedToken: CongnitoJwt) {
    const issuer = this.issuer;
    const config = this.config;
    const {
      payload: { iss, token_use },
      header: { kid },
    } = decodedToken;

    if (iss !== issuer) {
      throw new Error(
        `The configured user pool does not match with token's user pool.`
      );
    }

    if (token_use !== config.tokenUse) {
      throw new Error(
        `The configured user pool's token_use does not match with token's.` +
          ` Configured token use: ${config.tokenUse}, received: ${token_use}`
      );
    }

    const pem = kid && this.pems[kid];
    if (!pem) {
      throw new Error(
        `Invalid ${this.config.tokenUse} token. No matching key_id found`
      );
    }

    return pem;
  }
}

import jwt, { JwtPayload } from "jsonwebtoken";
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

  private async init() {
    const resp = await fetch(`${this.issuer}/.well-known/jwks.json`);

    // Handle error respose
    if (resp.status < 200 || resp.status > 299) {
      const json: { message: string } = await resp.json();
      const failedCb = this.config.onInitFailed;
      if (failedCb) {
        failedCb(new Error(json.message));
      } else {
        console.error("Unable to generate certificate due to \n", json.message);
      }
      return;
    }

    const jwks: Jwks = await resp.json();
    this.pems = jwks.keys.reduce((cum, { kid, n, e, kty }) => {
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

    // .then((resp) => {
    //   if (resp.status < 200 || resp.status > 299) {
    //     return Promise.reject(resp);
    //   }
    //   return resp.json() as Promise<Jwks>;
    // })
    // .then((response) => {
    //   console.log(">>>>> " + JSON.stringify(response));
    //   this.pems = response.keys.reduce((cum, { kid, n, e, kty }) => {
    //     cum[kid] = jwk2Pem({
    //       kty,
    //       n,
    //       e,
    //     });
    //     return cum;
    //   }, {} as Record<string, string>);
    //   this.initializationComplete = true;
    //   if (this.config.onInitComplete) {
    //     this.config.onInitComplete();
    //   }
    // })
    // .catch((resp) => {
    //   const failedCb = this.config.onInitFailed;

    //   resp.json().then((errJson: { message: string }) => {
    //     if (failedCb) {
    //       failedCb(new Error(errJson.message));
    //     } else {
    //       console.error(
    //         "Unable to generate certificate due to \n",
    //         JSON.stringify(errJson)
    //       );
    //     }
    //   });
    // });
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

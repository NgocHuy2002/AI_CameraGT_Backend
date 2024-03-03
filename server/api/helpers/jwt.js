import jwt from "jsonwebtoken";
import { getConfig } from "../../config/config";

const config = getConfig(process.env.NODE_ENV);

export default {
  issue(payload, expiresIn) {
    return jwt.sign(payload, config.secret, {
      expiresIn
    });
  },
  issueRefresh(payload, expiresIn) {
    return jwt.sign(payload, config.secretRefresh, {
      expiresIn
    });
  },
  async verifyToken(token) {
    if (token) {
      try {
        const payload = await jwt.verify(token, config.secretRefresh);
        return payload;
      } catch (error) {
        return null;
      }
    }
  },
};

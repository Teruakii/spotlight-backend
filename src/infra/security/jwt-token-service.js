const jwt = require("jsonwebtoken");
const TokenService = require("../../domain/auth/ports/token-service");

class JwtTokenService extends TokenService {
  constructor(secret, expiresIn = "1h") {
    super();
    if (!secret) {
      throw new Error("JwtTokenService requires a non-empty secret");
    }
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  generate(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token) {
    return jwt.verify(token, this.secret);
  }
}

module.exports = JwtTokenService;

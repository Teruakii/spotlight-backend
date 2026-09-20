class TokenService {
  
  generate(payload) {
    throw new Error('TokenService.generate() must be implemented');
  }
  verify(token) {
    throw new Error('TokenService.verify() must be implemented');
  }
}

module.exports = TokenService;
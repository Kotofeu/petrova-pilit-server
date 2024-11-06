const ApiError = require('../error/ApiError');
const tokenService = require('../service/TokenService');

module.exports = function(role) {
    return function (req, res, next) {
        try {
            const authorizationHeader = req.headers.authorization;
            if (!authorizationHeader) {
                return next(ApiError.UnauthorizedError());
            }
        
            const accessToken = authorizationHeader.split(' ')[1];
            if (!accessToken) {
                return next(ApiError.UnauthorizedError());
            }
            const decoded = tokenService.validateAccessToken(accessToken)
            if (decoded.role !== role) {
                return next(ApiError.Forbidden("Нет доступа"));
            }
            req.user = decoded;
            next()
        } catch (e) {
            return next(ApiError.UnauthorizedError());
        }
    };
}

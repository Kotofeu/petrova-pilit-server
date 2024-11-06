module.exports = class ApiError extends Error {
    status;
    errors;

    constructor(status, message) {
        super(message);
        this.status = status;
    }

    static BadRequest(message) {
        return new ApiError(400, message);
    }
    static NotFound(message) {
        return new ApiError(404, message);
    }
    // Ошибка сервера
    static Internal(message) {
        return new ApiError(500, message);
    }
    // Нет прав доступа
    static Forbidden(message) {
        return new ApiError(403, message);
    }
    // Не авторизован
    static UnauthorizedError() {
        return new ApiError(401, 'Пользователь не авторизован')
    }

}
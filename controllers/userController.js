const userService = require('../service/UserService');
const ApiError = require('../error/ApiError');
const { validationResult } = require('express-validator');
const UserDto = require('../dtos/UserDto');

class UserController {

    async createUserWithToken(req, res, next) {
        try {
            if (!req.cookies || !req.cookies.confirmToken) {
                return next(ApiError.Forbidden('Вы не подтвердили адрес электронной почты'))
            }
            const { confirmToken, reviewId } = req.cookies;
            const { password } = req.body;
            const userData = await userService.createUserWithToken(confirmToken, password, reviewId);
            if (userData.user.review) {
                res.cookie('reviewId', userData.user.review.id, { httpOnly: true, secure: true })
            }
            else {
                res.clearCookie('reviewId');
            }
            res.clearCookie('confirmToken');
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 60 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true })
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async recoverUser(req, res, next) {
        try {

            if (!req.cookies || !req.cookies.confirmToken) {
                return next(ApiError.Forbidden('Вы не подтвердили адрес электронной почты'))
            }
            const { confirmToken } = req.cookies;
            const { password } = req.body;
            const userData = await userService.recoverUser(confirmToken, password);
            if (userData.user.review) {
                res.cookie('reviewId', userData.user.review.id, { httpOnly: true, secure: true })
            }
            else {
                res.clearCookie('reviewId');
            }
            res.clearCookie('confirmToken');
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 60 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true })
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async changeEmail(req, res, next) {
        try {
            if (!req.cookies || !req.cookies.confirmToken) {
                return next(ApiError.Forbidden('Вы не подтвердили адрес электронной почты'))
            }
            const { confirmToken } = req.cookies;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации почты'))
            }
            const { newEmail } = req.body;
            const userData = await userService.changeEmail(confirmToken, newEmail);
            if (userData.user.review) {
                res.cookie('reviewId', userData.user.review.id, { httpOnly: true, secure: true })
            }
            else {
                res.clearCookie('reviewId');
            }
            res.clearCookie('confirmToken');
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 60 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true })
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async recoverUserSendCode(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации почты'))
            }
            const { email } = req.body;
            const userData = await userService.recoverUserSendCode(email);
            res.clearCookie('confirmToken');
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async changeEmailSendCode(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации почты'))
            }
            if (!req.user) {
                return next(ApiError.UnauthorizedError())
            }

            const { newEmail } = req.body;
            const { email } = req.user
            const userData = await userService.changeEmailSendCode(email, newEmail);
            res.clearCookie('confirmToken');
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async newUserSendCode(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации почты'))
            }
            const { email } = req.body;
            const userData = await userService.newUserSendCode(email);
            res.clearCookie('confirmToken');
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async activate(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации почты или кода подтверждения'))
            }
            const { email, code } = req.body;
            const token = await userService.activate(email, code);
            res.cookie('confirmToken', token, { maxAge: 10 * 60 * 1000, httpOnly: true, secure: true })
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации почты'))
            }
            const { email, password } = req.body;
            const userData = await userService.login(email, password);
            if (userData.user.review) {
                res.cookie('reviewId', userData.user.review.id, { httpOnly: true, secure: true })
            }
            else {
                res.clearCookie('reviewId');
            }
            res.clearCookie('confirmToken');
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 60 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true })
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async logout(req, res, next) {
        try {
            if (!req.cookies || !req.cookies.refreshToken) {
                return next(ApiError.UnauthorizedError());
            }
            const { refreshToken } = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            res.clearCookie('confirmToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }
    async refresh(req, res, next) {
        try {
            if (!req.cookies || !req.cookies.refreshToken) {
                return next(ApiError.UnauthorizedError());
            }
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken, res);
            if (userData.user.review) {
                res.cookie('reviewId', userData.user.review.id, { httpOnly: true, secure: true })
            }
            else {
                res.clearCookie('reviewId');
            }
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 60 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true })
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async giveRole(req, res, next) {
        try {
            const { id, role } = req.body;
            const userData = await userService.giveRole(id, role);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async changeById(req, res, next) {
        try {
            const { id } = req.params
            const userDto = new UserDto(req.body);
            let image;
            if (req.files && req.files.image) {
                image = req.files.image
            }
            const userData = await userService.changeById(id, userDto, image);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async changeImage(req, res, next) {
        try {
            if (!req.user) {
                return next(ApiError.UnauthorizedError())
            }
            const { id } = req.user
            let image;
            if (req.files && req.files.image) {
                image = req.files.image
            }
            const userData = await userService.changeImage(id, image);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async changeName(req, res, next) {
        try {
            if (!req.user) {
                return next(ApiError.UnauthorizedError())
            }
            const { id } = req.user
            const { name } = req.body;

            const userData = await userService.changeName(id, name);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async changePhone(req, res, next) {
        try {
            if (!req.user) {
                return next(ApiError.UnauthorizedError())
            }
            const { id } = req.user
            const { phone } = req.body;

            const userData = await userService.changePhone(id, phone);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async changePassword(req, res, next) {
        try {
            if (!req.cookies || !req.cookies.refreshToken) {
                return next(ApiError.UnauthorizedError());
            }
            const { refreshToken } = req.cookies;
            const { password } = req.body;
            const userData = await userService.changePassword(refreshToken, password);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 60 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true })
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async getAllUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }
    async getUserById(req, res, next) {
        try {
            const { id } = req.params
            const userData = await userService.getUserById(id);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async deleteUser(req, res, next) {
        try {
            if (!req.user) {
                return next(ApiError.UnauthorizedError())
            }
            const { id } = req.user
            const userData = await userService.deleteUser(id);
            res.clearCookie('refreshToken');
            res.clearCookie('confirmToken');
            res.clearCookie('reviewId');
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async deleteUserById(req, res, next) {
        try {
            const { id } = req.params
            const userData = await userService.deleteUser(id);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new UserController();
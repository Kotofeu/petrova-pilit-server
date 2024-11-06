const jwt = require('jsonwebtoken');
const ApiError = require('../error/ApiError');
const { RefreshTokens } = require('../models/models');
const UserDto = require('../dtos/UserDto');
class TokenService {
    generateTokens(userDto) {
        const {id, role, email, phone, name, imageSrc, visitsNumber} = new UserDto(userDto)
        const accessToken = jwt.sign({id, role, email, phone, name, imageSrc, visitsNumber}, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' })
        const refreshToken = jwt.sign({id}, process.env.JWT_REFRESH_SECRET, { expiresIn: '60d' })
        return {
            accessToken,
            refreshToken
        }
    }
    generateConfirmToken(id, email) {
        return jwt.sign({id, email}, process.env.JWT_CONFIRM_SECRET, {expiresIn: '10m'})
    }
    validateToken(token, secret) {
        try {
            return jwt.verify(token, secret);
        } catch (e) {
            throw ApiError.Internal(`Ошибка валидации токена`);
        }
    }

    validateAccessToken(token) {
        return this.validateToken(token, process.env.JWT_ACCESS_SECRET);
    }

    validateRefreshToken(token) {
        return this.validateToken(token, process.env.JWT_REFRESH_SECRET);
    }
    validateConfirmToken(token) {
        return this.validateToken(token, process.env.JWT_CONFIRM_SECRET);
    }

    async saveToken(id, refreshToken) {
        try {
            const tokenData = await RefreshTokens.findOne({ where: { id } })
            if (tokenData) {
                tokenData.token = refreshToken;
                return await tokenData.save();
            }
        } catch (e) {
            throw ApiError.Internal(`Ошибка сохранения токена`);
        }
    }
    async createToken(userId, refreshToken) {
        try {
            const newToken = await RefreshTokens.create({ userId, token: refreshToken });
            return newToken;
        } catch (error) {
            throw ApiError.Internal(`Ошибка создания токена`);
        }
    }

    async removeToken(refreshToken) {
        try {
            const result = await RefreshTokens.destroy({ where: { token: refreshToken } });
            return result > 0;
        } catch (error) {
            throw ApiError.Internal(`Ошибка удаления токена`);
        }
    }
    async removeAllTokens(userId) {
        try {
            const result = await RefreshTokens.destroy({ where: { userId: userId } });
            return result > 0;
        } catch (error) {
            throw ApiError.Internal(`Ошибка удаления токенов пользователя`);
        }
    }
    async findToken(refreshToken) {
        try {
            return await RefreshTokens.findOne({ where: { token: refreshToken } });
        } catch (error) {
            throw ApiError.Internal(`Ошибка нахождения токена`);
        }
    }
}

module.exports = new TokenService();
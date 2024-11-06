const { RefreshTokens } = require('../models/models'); 
const { Op } = require('sequelize');

const deleteOldRefreshTokens = async () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    try {
        const result = await RefreshTokens.destroy({
            where: {
                updatedAt: {
                    [Op.lt]: sixtyDaysAgo
                }
            }
        });
        console.log(`${result} токен(ов) удалено.`);
    } catch (error) {
        console.error('Ошибка при удалении токенов:', error);
    }
};

module.exports = deleteOldRefreshTokens;
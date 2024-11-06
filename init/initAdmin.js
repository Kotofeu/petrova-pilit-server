require('dotenv').config();
const { Users, AuthValues } = require('../models/models');
const bcrypt = require('bcrypt');
const initAdmin = async () => {
    try {
        const candidate = await Users.findOne({ where: { email: process.env.SMTP_USER } })
        if (!candidate) {
            const admin = await Users.create({ email: process.env.SMTP_USER, role: 'ADMIN' })
            const hashPassword = await bcrypt.hash(process.env.SMTP_PASSWORD, 3)
            const authAdmin = await AuthValues.create({ userId: admin.id, password: hashPassword })
        }
    }
    catch {
        console.error(`Невозможно создать админа`);

    }
};

initAdmin();
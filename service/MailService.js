const nodemailer = require('nodemailer');
const ApiError = require('../error/ApiError'); // Предполагается, что у вас есть класс ApiError

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true, // true для 465, false для других портов
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    async sendCodeMail(to, code) {
        const mailOptions = {
            from: `"PETROVA PILIT" <${process.env.SMTP_USER}>`,
            to,
            subject: 'Активация аккаунта на ' + process.env.API_URL,
            text: `Ваш код активации: ${code}`, // Текстовое сообщение
            html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
        <h1 style="color: #4CAF50; text-align: center; font-size: 42px; margin: 15px 0 0px;">PETROVA PILIT</h1>
        <h2 style="color: #333; text-align: center; margin: 5px 0 15px;">Код активации</h2>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 18px; color: #555; text-align: center;">Ваш код активации:</p>
            <h2 style="font-size: 24px; color: #4CAF50; text-align: center;">${code}</h2>
            <p style="font-size: 16px; color: #777; text-align: center;">Пожалуйста, используйте этот код для завершения процесса активации.</p>
            <p style="font-size: 14px; color: #ff0000; text-align: center; margin-top: 20px;">
                Важно: Не передавайте код никому. Этот код был сгенерирован автоматически. Пожалуйста, не отвечайте на это письмо.
            </p>
        </div>
        <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #aaa;">
        <p style="text-align: center">© Petrova Pilit, 2024</p>
        </footer>
    </div>

            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            throw ApiError.Internal(`Ошибка при отправке: ${error.message}`);
        }
    }
}

module.exports = new MailService();
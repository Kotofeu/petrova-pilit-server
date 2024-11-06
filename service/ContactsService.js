const { Contacts } = require('../models/models');
const ApiError = require('../error/ApiError');
const staticManagement = require('../helpers/staticManagement')
const ContactDto = require('../dtos/ContactDto');
class ContactsService {

    async getContacts() {
        const contacts = await Contacts.findAndCountAll({ order: [['id', 'ASC']] });
        return contacts;
    }
    async addContact(contactDto, image) {
        const contactValues = new ContactDto(contactDto)
        if (!image || !contactValues.name || !contactValues.link) {
            throw ApiError.BadRequest(`Данные для ссылки отсутствуют (name, link, image)`);
        }
        const candidate = await Contacts.findOne({ where: { name: contactValues.name } })
        if (candidate) {
            throw ApiError.BadRequest(`Контакст с названием ${contactValues.name} уже существует`);
        }
        const fileName = await staticManagement.staticCreate(image);
        const contactLink = await Contacts.create({
            name: contactValues.name,
            link: contactValues.link,
            imageSrc: fileName
        })
        return new ContactDto(contactLink)
    }
    async changeById(id, contactDto, image) {
        const contactValues = new ContactDto(contactDto)
        if (!id) {
            throw ApiError.BadRequest('Не указан id контакта');
        }

        const contactLink = await Contacts.findOne({ where: { id } })
        if (!contactLink) {
            throw ApiError.NotFound(`Контакст с id ${id} не существует`);
        }
        if (contactValues.name) {
            const candidate = await Contacts.findOne({ where: { name: contactValues.name } })
            if (candidate && contactLink.id !== candidate.id) {
                throw ApiError.BadRequest(`Контакст с названием ${contactValues.name} уже существует`);
            }
        }
        Object.keys(contactValues).forEach(key => {
            if (contactValues[key]) {
                contactLink[key] = contactValues[key];
            }
        });
        if (image) {
            const fileName = await staticManagement.staticCreate(image);
            await staticManagement.staticDelete(contactLink.imageSrc);
            contactLink.imageSrc = fileName;
        }
        await contactLink.save()
        return new ContactDto(contactLink)
    }
    async deleteById(id) {
        const contactLink = await Contacts.findOne({ where: { id } });
        if (!contactLink) {
            throw ApiError.NotFound(`Контакст с id ${id} не существует`);
        }
        await staticManagement.staticDelete(contactLink.imageSrc);
        return await Contacts.destroy({ where: { id } });
    }
}
module.exports = new ContactsService();
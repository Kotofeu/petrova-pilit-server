const contactsService = require('../service/ContactsService');
const ContactDto = require('../dtos/ContactDto');

class ContactController {

    async getContacts(req, res, next) {
        try {
            const contacts = await contactsService.getContacts();
            return res.json(contacts);
        } catch (e) {
            next(e);
        }
    }

    async addContact(req, res, next) {
        try {
            let image;
            if (req.files && req.files.image) {
                image = req.files.image
            }
            const contactDto = new ContactDto(req.body);
            const contact = await contactsService.addContact(contactDto, image);
            return res.json(contact);
        } catch (e) {
            next(e);
        }
    }
    async changeById(req, res, next) {
        try {
            const { id } = req.params
            let image;
            if (req.files && req.files.image) {
                image = req.files.image
            }
            const contactDto = new ContactDto(req.body);
            const contact = await contactsService.changeById(id, contactDto, image);
            return res.json(contact);
        } catch (e) {
            next(e);
        }
    }
    async deleteById(req, res, next) {
        try {
            const { id } = req.params
            const contact = await contactsService.deleteById(id);
            return res.json(contact);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new ContactController();
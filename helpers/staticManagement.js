const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../error/ApiError');

class StaticManagement {
    async manyStaticDelete(foundElements) {
        const imagesForDelete = foundElements.map(image => image.imageSrc);
        if (imagesForDelete.length) {
            await Promise.all(imagesForDelete.map(async (image) => {
                const filePath = path.resolve(__dirname, '..', 'static', image);
                try {
                    await fs.unlink(filePath);
                } catch (error) {
                }
            }));
        }
    }

    async manyStaticCreate(images) {
        let imagesNames = [];
        if (images) {
            if (!Array.isArray(images)) images = [images];
            for (const image of images) {
                if (image.name) {
                    const fileName = `${uuidv4()}.${image.name.split('.').pop()}`;
                    imagesNames.push(fileName);
                    const filePath = path.resolve(__dirname, '..', 'static', fileName)
                    try {
                        await this.compressFile(image, filePath, image.name);
                    } catch (error) {
                        throw ApiError.Internal('Ошибка сохранения изображения');
                    }
                }
            }
        }
        return imagesNames;
    }

    async staticDelete(imageSrc) {
        if (imageSrc) {
            const filePath = path.resolve(__dirname, '..', 'static', imageSrc);
            try {
                await fs.unlink(filePath);
            } catch (error) {
            }
        }
    }

    async staticCreate(image) {
        if (Array.isArray(image)) {
            throw ApiError.BadRequest('Вы передали больше 1 изображения');
        }
    
        let imageName;
        if (image && image.name) {
            imageName =`${uuidv4()}.${image.name.split('.').pop()}`;
            const filePath = path.resolve(__dirname, '..', 'static', imageName);
            await this.compressFile(image, filePath, image.name);
        }
        return imageName;
    }
    
    async compressFile(image, filePath, fileName) {
        console.log(filePath)
        const ext = path.extname(fileName).toLowerCase();
        const supportedFormats = [
            '.mp4',
            '.mov',
            '.jpg',
            '.webp',
            '.jpeg',
            '.png',
            '.gif',
            '.bmp',
            '.svg',
        ];
    
        if (!supportedFormats.includes(ext)) {
            throw ApiError.BadRequest(`Тип файла ${ext} не поддерживается`);
        }

        try {
            let outputFormat;

            switch (ext) {
                case '.jpg':
                case '.jpeg':
                    outputFormat = sharp(image.data).jpeg({ quality: 80 });
                    break;
                case '.png':
                    outputFormat = sharp(image.data).png({ quality: 80 });
                    break;
                case '.webp':
                    outputFormat = sharp(image.data).webp({ quality: 80 });
                    break;
                default:
                    await image.mv(filePath);
                    return;
            }
    
            await outputFormat.toFile(filePath);
        } catch (error) {
            throw ApiError.Internal('Ошибка сжатия изображения');
        }
    }
}

module.exports = new StaticManagement();
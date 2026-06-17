import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../../config/logger';
export class CloudinaryStorageProvider {
    constructor() {
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });
            logger.info('Cloudinary configured successfully.');
        }
        else if (process.env.CLOUDINARY_URL) {
            // It will auto-configure from CLOUDINARY_URL
            logger.info('Cloudinary auto-configured from CLOUDINARY_URL.');
        }
        else {
            logger.warn('Cloudinary credentials missing. Uploads will fail if this provider is used.');
        }
    }
    async upload(fileBuffer, originalName, folder = 'hiremind') {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder,
                resource_type: 'auto', // Auto-detects image vs raw (pdf, docx)
                public_id: `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
            }, (error, result) => {
                if (error) {
                    logger.error('Cloudinary upload error:', error);
                    return reject(error);
                }
                if (!result) {
                    return reject(new Error('Cloudinary upload returned no result'));
                }
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    provider: 'CLOUDINARY'
                });
            });
            uploadStream.end(fileBuffer);
        });
    }
    async delete(identifier) {
        try {
            await cloudinary.uploader.destroy(identifier);
        }
        catch (error) {
            logger.error('Cloudinary delete error:', error);
            throw error;
        }
    }
    getUrl(identifier) {
        if (identifier.startsWith('http'))
            return identifier;
        return cloudinary.url(identifier);
    }
}
//# sourceMappingURL=CloudinaryStorageProvider.js.map
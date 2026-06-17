import { LocalStorageProvider } from './LocalStorageProvider';
import { CloudinaryStorageProvider } from './CloudinaryStorageProvider';
export class StorageFactory {
    static instance;
    static getProvider() {
        if (!this.instance) {
            // Determines which storage provider to use based on env var. Default to LOCAL.
            const providerType = process.env.STORAGE_PROVIDER || 'LOCAL';
            if (providerType === 'CLOUDINARY') {
                this.instance = new CloudinaryStorageProvider();
            }
            else {
                this.instance = new LocalStorageProvider();
            }
        }
        return this.instance;
    }
}
//# sourceMappingURL=StorageFactory.js.map
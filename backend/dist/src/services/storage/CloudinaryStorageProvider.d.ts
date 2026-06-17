import { FileStorageProvider, UploadResult } from './FileStorageProvider';
export declare class CloudinaryStorageProvider implements FileStorageProvider {
    constructor();
    upload(fileBuffer: Buffer, originalName: string, folder?: string): Promise<UploadResult>;
    delete(identifier: string): Promise<void>;
    getUrl(identifier: string): string;
}
//# sourceMappingURL=CloudinaryStorageProvider.d.ts.map
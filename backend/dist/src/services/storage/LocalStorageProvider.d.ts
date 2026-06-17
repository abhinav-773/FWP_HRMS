import { FileStorageProvider, UploadResult } from './FileStorageProvider';
export declare class LocalStorageProvider implements FileStorageProvider {
    private readonly uploadDir;
    constructor();
    upload(fileBuffer: Buffer, originalName: string, folder?: string): Promise<UploadResult>;
    delete(identifier: string): Promise<void>;
    getUrl(identifier: string): string;
}
//# sourceMappingURL=LocalStorageProvider.d.ts.map
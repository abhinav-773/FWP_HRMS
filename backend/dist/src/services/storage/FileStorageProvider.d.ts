export interface UploadResult {
    url: string;
    publicId?: string;
    provider: string;
}
export interface FileStorageProvider {
    /**
     * Uploads a file buffer or stream to the storage provider
     * @param fileBuffer The file buffer to upload
     * @param originalName The original file name
     * @param folder Optional folder path within the storage
     */
    upload(fileBuffer: Buffer, originalName: string, folder?: string): Promise<UploadResult>;
    /**
     * Deletes a file from the storage provider
     * @param identifier The unique identifier of the file (e.g., path or public_id)
     */
    delete(identifier: string): Promise<void>;
    /**
     * Generates a fully qualified URL for accessing the file
     * @param identifier The unique identifier of the file
     */
    getUrl(identifier: string): string;
}
//# sourceMappingURL=FileStorageProvider.d.ts.map
import { FileStorageProvider, UploadResult } from './FileStorageProvider';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class LocalStorageProvider implements FileStorageProvider {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  
  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(fileBuffer: Buffer, originalName: string, folder: string = 'general'): Promise<UploadResult> {
    const ext = path.extname(originalName);
    const filename = `${uuidv4()}${ext}`;
    const targetDir = path.join(this.uploadDir, folder);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const filePath = path.join(targetDir, filename);
    await fs.promises.writeFile(filePath, fileBuffer);
    
    const relativePath = path.posix.join(folder, filename);
    
    return {
      url: `/uploads/${relativePath}`,
      publicId: relativePath,
      provider: 'LOCAL'
    };
  }

  async delete(identifier: string): Promise<void> {
    const filePath = path.join(this.uploadDir, identifier);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  getUrl(identifier: string): string {
    // If it's already a full URL, return it
    if (identifier.startsWith('http')) return identifier;
    
    const host = process.env.API_BASE_URL || 'http://localhost:5000';
    return `${host}/uploads/${identifier}`;
  }
}

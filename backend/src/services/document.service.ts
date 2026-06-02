import prisma from '../config/prisma';
import { DocumentType } from '@prisma/client';

export class DocumentService {
  async saveDocument(userId: string, name: string, documentType: DocumentType, fileUrl: string) {
    return await prisma.document.create({
      data: {
        userId,
        name,
        documentType,
        fileUrl
      }
    });
  }

  async getMyDocuments(userId: string) {
    return await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async verifyDocument(documentId: string) {
    return await prisma.document.update({
      where: { id: documentId },
      data: { isVerified: true }
    });
  }
}

export default new DocumentService();

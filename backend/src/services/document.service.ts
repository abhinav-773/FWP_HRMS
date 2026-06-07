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

  async getMyDocuments(userId: string, search?: string, type?: string) {
    const whereClause: any = { userId };
    
    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    if (type && type !== 'ALL') {
      whereClause.documentType = type as any;
    }

    return await prisma.document.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
  }

  async verifyDocument(documentId: string, status: 'VERIFIED' | 'REJECTED' | 'PENDING' = 'VERIFIED') {
    return await prisma.document.update({
      where: { id: documentId },
      data: { verificationStatus: status }
    });
  }
}

export default new DocumentService();

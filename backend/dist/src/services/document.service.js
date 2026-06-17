import prisma from '../config/prisma';
export class DocumentService {
    async saveDocument(userId, name, documentType, fileUrl, fileProvider = 'LOCAL', publicId) {
        return await prisma.document.create({
            data: {
                userId,
                name,
                documentType,
                fileUrl,
                fileProvider,
                publicId
            }
        });
    }
    async getMyDocuments(userId, search, type) {
        const whereClause = { userId };
        if (search) {
            whereClause.name = {
                contains: search,
                mode: 'insensitive'
            };
        }
        if (type && type !== 'ALL') {
            whereClause.documentType = type;
        }
        return await prisma.document.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });
    }
    async verifyDocument(documentId, status = 'VERIFIED') {
        return await prisma.document.update({
            where: { id: documentId },
            data: { verificationStatus: status }
        });
    }
}
export default new DocumentService();
//# sourceMappingURL=document.service.js.map
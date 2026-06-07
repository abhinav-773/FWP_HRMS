import { DocumentType } from '@prisma/client';
export declare class DocumentService {
    saveDocument(userId: string, name: string, documentType: DocumentType, fileUrl: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        documentType: import(".prisma/client").$Enums.DocumentType;
        fileUrl: string;
        verificationStatus: import(".prisma/client").$Enums.DocumentVerificationStatus;
    }>;
    getMyDocuments(userId: string, search?: string, type?: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        documentType: import(".prisma/client").$Enums.DocumentType;
        fileUrl: string;
        verificationStatus: import(".prisma/client").$Enums.DocumentVerificationStatus;
    }[]>;
    verifyDocument(documentId: string, status?: 'VERIFIED' | 'REJECTED' | 'PENDING'): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        documentType: import(".prisma/client").$Enums.DocumentType;
        fileUrl: string;
        verificationStatus: import(".prisma/client").$Enums.DocumentVerificationStatus;
    }>;
}
declare const _default: DocumentService;
export default _default;
//# sourceMappingURL=document.service.d.ts.map
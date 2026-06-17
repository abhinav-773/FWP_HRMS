import { Request, Response } from 'express';
import documentService from '../services/document.service';
import { StorageFactory } from '../services/storage/StorageFactory';

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = (req as any).user.userId;
    const { name, documentType } = req.body;
    
    const storageProvider = StorageFactory.getProvider();
    const uploadResult = await storageProvider.upload(req.file.buffer, req.file.originalname, 'documents');

    const doc = await documentService.saveDocument(
      userId, 
      name, 
      documentType, 
      uploadResult.url, 
      uploadResult.provider, 
      uploadResult.publicId
    );
    res.status(201).json({ data: doc, message: 'Document uploaded successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyDocuments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { search, type } = req.query;
    const docs = await documentService.getMyDocuments(
      userId, 
      search ? String(search) : undefined, 
      type ? String(type) : undefined
    );
    res.json({ data: docs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyDocument = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const doc = await documentService.verifyDocument(id);
    res.json({ data: doc, message: 'Document verified' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

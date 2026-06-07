import { Request, Response } from 'express';
import documentService from '../services/document.service';

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = (req as any).user.userId;
    const { name, documentType } = req.body;
    
    // Convert absolute path to a relative URL for frontend consumption
    // Assuming backend runs on port 3000 and serves /uploads statically
    const fileUrl = `/uploads/${req.file.filename}`;

    const doc = await documentService.saveDocument(userId, name, documentType, fileUrl);
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

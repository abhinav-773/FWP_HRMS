import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { eventBus } from '../services/eventBus';

// Fetch notes for a candidate
export const getSharedNotes = async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.params;
    const notes = await prisma.sharedNote.findMany({
      where: { candidateId: candidateId as string },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, fullName: true, role: true }
        }
      }
    });
    res.json(notes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Add a note
export const addSharedNote = async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.params;
    const { content } = req.body;
    const userId = (req as any).user.userId;

    const note = await prisma.sharedNote.create({
      data: {
        content,
        candidateId: candidateId as string,
        authorId: userId
      },
      include: {
        author: {
          select: { id: true, fullName: true, role: true }
        }
      }
    });

    // Optionally broadcast via eventBus if live candidate profile view is implemented
    // eventBus.emit(`candidate:note:${candidateId}`, note);

    res.status(201).json(note);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

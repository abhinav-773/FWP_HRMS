import prisma from '../config/prisma';
// Fetch notes for a candidate
export const getSharedNotes = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const notes = await prisma.sharedNote.findMany({
            where: { candidateId: candidateId },
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { id: true, fullName: true, role: true }
                }
            }
        });
        res.json(notes);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Add a note
export const addSharedNote = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;
        const note = await prisma.sharedNote.create({
            data: {
                content,
                candidateId: candidateId,
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=shared-notes.controller.js.map
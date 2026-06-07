import prisma from '../config/prisma';
import { eventBus } from '../services/eventBus';
// Fetch all conversations for the logged-in user
export const getConversations = async (req, res) => {
    try {
        const userId = req.user.userId;
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: { userId }
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, fullName: true, role: true }
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
        res.json(conversations);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Fetch messages for a specific conversation
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.userId;
        // Ensure user is participant
        const isParticipant = await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: { conversationId: conversationId, userId }
            }
        });
        if (!isParticipant) {
            return res.status(403).json({ error: 'Not a participant of this conversation' });
        }
        const messages = await prisma.message.findMany({
            where: { conversationId: conversationId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: { id: true, fullName: true, role: true }
                }
            }
        });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Send a new message
export const sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;
        const message = await prisma.message.create({
            data: {
                content,
                conversationId: conversationId,
                senderId: userId
            },
            include: {
                sender: {
                    select: { id: true, fullName: true, role: true }
                }
            }
        });
        // Update conversation updated_at for sorting
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });
        // Broadcast via Event Bus -> Socket Service
        eventBus.emitMessage(conversationId, message);
        res.status(201).json(message);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Create a new 1-on-1 conversation
export const createConversation = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const userId = req.user.userId;
        if (userId === targetUserId) {
            return res.status(400).json({ error: "Cannot create a conversation with yourself" });
        }
        // Check if 1-on-1 conversation already exists
        const existing = await prisma.conversation.findFirst({
            where: {
                isGroup: false,
                AND: [
                    { participants: { some: { userId } } },
                    { participants: { some: { userId: targetUserId } } }
                ]
            }
        });
        if (existing) {
            return res.json(existing);
        }
        // Create new conversation
        const conversation = await prisma.conversation.create({
            data: {
                isGroup: false,
                participants: {
                    create: [
                        { userId },
                        { userId: targetUserId }
                    ]
                }
            },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, fullName: true, role: true } }
                    }
                }
            }
        });
        res.status(201).json(conversation);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=team-chat.controller.js.map
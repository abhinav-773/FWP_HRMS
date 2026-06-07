import prisma from '../config/prisma';
export class CandidateService {
    async createCandidate(data) {
        return await prisma.candidate.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                location: data.location,
                resumeUrl: data.resumeUrl,
                linkedinUrl: data.linkedinUrl,
                skills: data.skills || [],
                source: data.source || 'DIRECT',
                experience: data.experience ? parseInt(data.experience, 10) : 0,
                education: data.education,
                notes: data.notes,
                assignedToId: data.assignedToId || null,
            },
            include: {
                assignedTo: { select: { id: true, fullName: true } }
            }
        });
    }
    async getAllCandidates(query) {
        const where = {};
        if (query.source)
            where.source = query.source;
        if (query.assignedToId)
            where.assignedToId = query.assignedToId;
        if (query.search) {
            where.OR = [
                { fullName: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
                { skills: { hasSome: [query.search] } }
            ];
        }
        return await prisma.candidate.findMany({
            where,
            include: {
                assignedTo: { select: { id: true, fullName: true } },
                _count: { select: { applications: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getCandidateById(id) {
        return await prisma.candidate.findUnique({
            where: { id },
            include: {
                assignedTo: { select: { id: true, fullName: true } },
                applications: {
                    include: {
                        job: { select: { id: true, title: true } },
                        activities: {
                            orderBy: { createdAt: 'desc' },
                            include: { performedBy: { select: { fullName: true } } }
                        },
                        interviews: true
                    }
                }
            }
        });
    }
    async updateCandidate(id, data) {
        return await prisma.candidate.update({
            where: { id },
            data: {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                location: data.location,
                resumeUrl: data.resumeUrl,
                linkedinUrl: data.linkedinUrl,
                skills: data.skills,
                source: data.source,
                experience: data.experience ? parseInt(data.experience, 10) : undefined,
                education: data.education,
                notes: data.notes,
                assignedToId: data.assignedToId,
            }
        });
    }
    async deleteCandidate(id) {
        return await prisma.candidate.delete({
            where: { id }
        });
    }
}
export default new CandidateService();
//# sourceMappingURL=candidate.service.js.map
import prisma from '../config/prisma';
// Store active interview rooms
const activeInterviews = new Map();
export const setupInterviewGateway = (io, socket) => {
    // 1. Candidate Joining the Interview Room
    socket.on('join_interview_room', async (meetingUrl) => {
        console.log(`[Socket] Received join_interview_room for meetingUrl: ${meetingUrl}`);
        try {
            const interview = await prisma.interview.findUnique({
                where: { meetingUrl },
                include: { application: { include: { candidate: true } } }
            });
            if (!interview) {
                socket.emit('interview_error', 'Invalid meeting URL');
                return;
            }
            const roomId = `interview_${interview.id}`;
            socket.join(roomId);
            if (socket.isCandidate) {
                if (!activeInterviews.has(interview.id)) {
                    activeInterviews.set(interview.id, {
                        candidateSocketId: socket.id,
                        recruiterSocketIds: new Set(),
                        audioStream: null
                    });
                }
                else {
                    activeInterviews.get(interview.id).candidateSocketId = socket.id;
                }
                socket.emit('interview_ready', { role: 'candidate', interviewId: interview.id });
                console.log(`[Socket] Emitted interview_ready to candidate ${socket.id}`);
                // Notify recruiters that candidate joined
                socket.to(roomId).emit('candidate_joined', { candidateSocketId: socket.id });
            }
            else {
                // Recruiter joining
                if (activeInterviews.has(interview.id)) {
                    activeInterviews.get(interview.id).recruiterSocketIds.add(socket.id);
                }
                socket.emit('interview_ready', { role: 'recruiter', interviewId: interview.id });
            }
        }
        catch (error) {
            console.error('Error joining interview room:', error);
        }
    });
    // 2. Candidate sending Audio/Video chunks (WebM format typically)
    socket.on('interview_media_chunk', (data) => {
        const roomId = `interview_${data.interviewId}`;
        // Broadcast chunk to any recruiters monitoring live
        socket.to(roomId).emit('live_media_chunk', data.chunk);
        // TODO: Save to file for post-processing or pipe to Whisper STT here
        // For real-time AI, we could pipe audio directly to Whisper.
    });
    // 3. AI Question Trigger
    socket.on('request_next_question', async (data) => {
        console.log(`[Socket] Received request_next_question for interview: ${data.interviewId}`);
        // Here we would call aiInterviewEngine.service to generate next question
        // and synthesize TTS audio, then emit back to candidate
        socket.emit('ai_question_audio', {
            text: "Hello, could you please introduce yourself?",
            audioBuffer: null // Buffer containing TTS output
        });
        console.log(`[Socket] Emitted ai_question_audio back to ${socket.id}`);
    });
    socket.on('disconnect', () => {
        // Cleanup activeInterviews maps if needed
    });
};
//# sourceMappingURL=interview.gateway.js.map
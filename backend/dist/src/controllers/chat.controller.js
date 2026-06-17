import copilotActionEngine from '../services/ai/copilotActionEngine';
export const sendChatMessage = async (req, res) => {
    const { session_id, message, context } = req.body;
    const user = req.user;
    try {
        const copilotResponse = await copilotActionEngine.processMessage(user.userId, user.role || 'EMPLOYEE', user.fullName || 'Employee', message, context || 'No specific page context');
        return res.json({
            session_id: session_id || `session-${Date.now()}`,
            message,
            ai_response: copilotResponse.result.content || '',
            // New structured response fields
            action_executed: copilotResponse.actionExecuted,
            action_id: copilotResponse.actionId,
            action_result: copilotResponse.result,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('[Chat Controller] Copilot failed:', error.message);
        // Fallback logic
        const fallbackResponse = `### 👋 Welcome to HireMind Co-Pilot
The AI service is currently experiencing high load. I can help you with core policies:
* **Leaves**: Navigate to "My Leaves".
* **WFH**: Log on the "My Attendance" page.
* **Onboarding**: Upload NDA in the "My Onboarding" portal.

Please try asking a more specific question later!`;
        return res.json({
            session_id: session_id || `local-fallback-${Date.now()}`,
            message,
            ai_response: fallbackResponse,
            action_executed: false,
            action_id: null,
            action_result: null,
            timestamp: new Date().toISOString()
        });
    }
};
export const getChatHistory = async (req, res) => {
    const { sessionId } = req.params;
    res.json({ session_id: sessionId, messages: [] });
};
export const getUserSessions = async (req, res) => {
    res.json({ sessions: [] });
};
export const getChatHealth = async (req, res) => {
    res.json({ status: 'active', llm_available: !!process.env.GEMINI_API_KEY });
};
//# sourceMappingURL=chat.controller.js.map
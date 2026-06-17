import { geminiGenerate } from './gemini.service';
/**
 * Generate an AI-powered employee performance summary
 */
export async function generatePerformanceSummary(metrics) {
    const prompt = `Generate a performance summary for an employee with the following metrics:
  Technical Rating: ${metrics.technicalRating}/5
  Communication: ${metrics.communicationRating}/5
  Productivity: ${metrics.productivityRating}/5
  Teamwork: ${metrics.teamworkRating}/5
  Strengths: ${metrics.strengths.join(', ')}
  Weaknesses: ${metrics.weaknesses.join(', ')}
  
  Provide a concise 3-sentence summary of their performance, followed by 1 key area for improvement.`;
    try {
        return await geminiGenerate(prompt);
    }
    catch (error) {
        console.error('[AnalyticsAI] Performance summary generation failed:', error);
        return 'AI Summary could not be generated at this time.';
    }
}
/**
 * Generate an AI-powered team analytics summary
 */
export async function generateTeamAnalyticsSummary(data) {
    const prompt = `You are an HR analytics expert. Analyze the following department metrics and provide a concise executive summary with actionable insights:

  Department: ${data.department}
  Average Attendance Rate: ${data.averageAttendance.toFixed(1)}%
  Average Productivity Rate: ${data.averageProductivity.toFixed(1)}%
  Completed Tasks: ${data.completedTasks}
  Overdue Tasks: ${data.overdueTasks}
  Burnout Risk Score: ${data.burnoutRiskScore.toFixed(1)}/100

  Provide:
  1. A 2-sentence executive summary
  2. Top concern (if any)
  3. One specific recommendation`;
    try {
        return await geminiGenerate(prompt);
    }
    catch (error) {
        console.error('[AnalyticsAI] Team analytics summary generation failed:', error);
        return 'Team analytics summary could not be generated.';
    }
}
//# sourceMappingURL=analyticsAI.service.js.map
import React from 'react';
import { BrainCircuit, CheckCircle, AlertTriangle, Briefcase, Award, TrendingUp, BookOpen, Clock } from 'lucide-react';

const AIReasoningPanel = ({ insights, score, application }) => {
  let parsed = null;
  try {
    if (insights && insights.trim().startsWith('{') && insights.trim().endsWith('}')) {
      parsed = JSON.parse(insights);
    }
  } catch (err) {
    console.warn("Failed to parse AI insights JSON:", err);
  }

  const semanticVal = application?.semanticScore !== undefined && application?.semanticScore !== null 
    ? application.semanticScore 
    : (parsed?.semanticScore ?? 0);

  const technicalVal = application?.technicalScore !== undefined && application?.technicalScore !== null 
    ? application.technicalScore 
    : (parsed?.technicalScore ?? 0);

  const experienceVal = application?.experienceScore !== undefined && application?.experienceScore !== null 
    ? application.experienceScore 
    : (parsed?.experienceScore ?? 0);

  const educationVal = application?.educationScore !== undefined && application?.educationScore !== null 
    ? application.educationScore 
    : (parsed?.educationScore ?? 0);

  const overallVal = application?.overallAIScore !== undefined && application?.overallAIScore !== null 
    ? application.overallAIScore 
    : (application?.aiScore !== undefined && application?.aiScore !== null ? application.aiScore : (parsed?.overallScore ?? score ?? 0));

  const strengthsVal = application?.aiStrengths && application?.aiStrengths.length > 0 
    ? application.aiStrengths 
    : (parsed?.strengths ?? []);

  const weaknessesVal = application?.aiWeaknesses && application?.aiWeaknesses.length > 0 
    ? application.aiWeaknesses 
    : (parsed?.weaknesses ?? []);

  const recommendationVal = application?.aiRecommendation || parsed?.recommendation || 'Evaluation Completed';
  
  // AI reasoning summary: fallback to text-based description or insights
  const explanationVal = parsed?.explanation || application?.aiRecommendation || insights || 'No additional explanation provided.';

  // Matched and Missing skills calculations
  const candidateSkills = application?.candidate?.skills || [];
  const jobSkills = application?.job?.skills || [];

  const matchedSkillsList = candidateSkills.filter(skill =>
    jobSkills.some(js => js.toLowerCase() === skill.toLowerCase())
  );

  let missingSkillsList = parsed?.missingSkills || [];
  if (missingSkillsList.length === 0 && jobSkills.length > 0) {
    missingSkillsList = jobSkills.filter(js =>
      !candidateSkills.some(cs => cs.toLowerCase() === js.toLowerCase())
    );
  }

  const isRich = (parsed && parsed.isRichAnalysis) || 
                 (application && (
                   application.semanticScore !== null ||
                   application.technicalScore !== null ||
                   application.experienceScore !== null ||
                   application.educationScore !== null
                 ));

  if (!isRich) {
    // Fallback if not rich
    return (
      <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-indigo-300 font-bold flex items-center text-sm sm:text-base">
            <BrainCircuit className="w-5 h-5 mr-2" />
            AI Candidate Analysis
          </h4>
          {overallVal > 0 && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
              overallVal >= 80 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
              overallVal >= 50 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
              'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              {Math.round(overallVal)}% AI Score
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed mb-2 p-4 bg-black/20 rounded-lg border border-white/5 font-medium">
          {explanationVal}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-5 sm:p-6 space-y-6">
      
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/10 pb-4">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="w-6 h-6 text-indigo-400 shrink-0" />
          <div>
            <h4 className="text-white font-bold text-lg">AI Candidate Screening</h4>
            <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">{recommendationVal}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 bg-black/30 border border-white/10 px-4 py-2 rounded-xl w-fit">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Overall Match</span>
          <span className={`text-2xl font-black ${
            overallVal >= 80 ? 'text-green-400' : 
            overallVal >= 60 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {Math.round(overallVal)}%
          </span>
        </div>
      </div>

      {/* 4 Pillars - Sub-scores Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Semantic similarity */}
        <div className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Semantic
          </div>
          <div className="text-xl font-bold text-white">{Math.round(semanticVal)}%</div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${semanticVal}%` }} />
          </div>
        </div>

        {/* Technical relevance */}
        <div className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-purple-400" /> Technical
          </div>
          <div className="text-xl font-bold text-white">{Math.round(technicalVal)}%</div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${technicalVal}%` }} />
          </div>
        </div>

        {/* Experience match */}
        <div className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-blue-400" /> Experience
          </div>
          <div className="text-xl font-bold text-white">{Math.round(experienceVal)}%</div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${experienceVal}%` }} />
          </div>
        </div>

        {/* Education fit */}
        <div className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-green-400" /> Education
          </div>
          <div className="text-xl font-bold text-white">{Math.round(educationVal)}%</div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full rounded-full" style={{ width: `${educationVal}%` }} />
          </div>
        </div>

      </div>

      {/* Recruiter explanation text */}
      <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-1">
        <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-black block">AI Rationale & Recommendation</span>
        <p className="text-sm text-gray-200 leading-relaxed font-medium">
          {explanationVal}
        </p>
      </div>

      {/* Matched and Missing Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched Skills */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center">
            <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Matched Skills
          </span>
          <div className="bg-black/20 border border-emerald-500/10 p-3.5 rounded-xl min-h-[70px]">
            {matchedSkillsList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {matchedSkillsList.map((m, i) => (
                  <span key={i} className="text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded">
                    {m}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-500 font-medium italic block pt-1">No overlapping skills detected</span>
            )}
          </div>
        </div>

        {/* Missing Skills / Gaps */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-rose-400" /> Missing Skills / Gaps
          </span>
          <div className="bg-black/20 border border-rose-500/10 p-3.5 rounded-xl min-h-[70px]">
            {missingSkillsList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {missingSkillsList.map((m, i) => (
                  <span key={i} className="text-[10px] uppercase font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded">
                    {m}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-500 font-medium italic block pt-1">No gaps flagged</span>
            )}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Key Strengths */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center">
            <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-green-500" /> Strengths
          </span>
          <ul className="text-xs text-gray-300 space-y-1.5 bg-black/10 border border-green-500/10 p-3.5 rounded-xl min-h-[70px]">
            {strengthsVal.map((s, i) => (
              <li key={i} className="flex items-start gap-1 font-medium">
                <span className="text-green-500">•</span> {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Key Weaknesses */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-yellow-500" /> Areas of Concern
          </span>
          <ul className="text-xs text-gray-300 space-y-1.5 bg-black/10 border border-yellow-500/10 p-3.5 rounded-xl min-h-[70px]">
            {weaknessesVal.map((w, i) => (
              <li key={i} className="flex items-start gap-1 font-medium">
                <span className="text-yellow-500">•</span> {w}
              </li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
};

export default AIReasoningPanel;

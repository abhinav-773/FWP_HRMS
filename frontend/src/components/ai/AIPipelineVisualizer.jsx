import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Database, FileText, CheckCircle2, User, Mic } from 'lucide-react';

const Node = ({ icon: Icon, label, status, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 backdrop-blur-sm z-10 w-32 ${
        status === 'active' 
          ? 'bg-indigo-900/40 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
          : status === 'complete' 
          ? 'bg-emerald-900/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
          : 'bg-gray-800/40 border-gray-700'
      }`}
    >
      <Icon className={`w-8 h-8 mb-2 ${
        status === 'active' ? 'text-indigo-400 animate-pulse' : 
        status === 'complete' ? 'text-emerald-400' : 'text-gray-500'
      }`} />
      <span className={`text-xs font-bold text-center ${
        status === 'active' ? 'text-indigo-200' : 
        status === 'complete' ? 'text-emerald-200' : 'text-gray-400'
      }`}>{label}</span>
      
      {status === 'complete' && (
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} 
          className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-0.5"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
};

const ConnectingLine = ({ active, delay = 0 }) => (
  <div className="flex-1 h-1 relative overflow-hidden bg-gray-800 mx-2 rounded-full">
    {active && (
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400 to-transparent w-1/2"
      />
    )}
    {active && (
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay }}
        className="absolute inset-0 bg-indigo-500/50 origin-left"
      />
    )}
  </div>
);

const AIPipelineVisualizer = () => {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < 4 ? prev + 1 : 0));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gray-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <BrainCircuit className="w-48 h-48 text-indigo-400" />
      </div>
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-indigo-400" />
            AI Pipeline Engine
          </h3>
          <p className="text-sm text-gray-400">Real-time candidate evaluation sequence</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Processing</span>
        </div>
      </div>

      <div className="flex items-center justify-between w-full relative z-10 px-4 py-8">
        <Node 
          icon={User} 
          label="New Applicant" 
          status={step >= 0 ? 'complete' : 'pending'} 
          delay={0}
        />
        <ConnectingLine active={step >= 1} delay={0.2} />
        <Node 
          icon={FileText} 
          label="Resume Parsing" 
          status={step === 1 ? 'active' : step > 1 ? 'complete' : 'pending'} 
          delay={0.2}
        />
        <ConnectingLine active={step >= 2} delay={0.4} />
        <Node 
          icon={Database} 
          label="Vector Embeddings" 
          status={step === 2 ? 'active' : step > 2 ? 'complete' : 'pending'} 
          delay={0.4}
        />
        <ConnectingLine active={step >= 3} delay={0.6} />
        <Node 
          icon={BrainCircuit} 
          label="Llama 3 Scoring" 
          status={step === 3 ? 'active' : step > 3 ? 'complete' : 'pending'} 
          delay={0.6}
        />
      </div>
      
      <div className="mt-4 bg-black/40 rounded-xl p-4 border border-white/5 relative z-10 h-24 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.p key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm text-gray-400">Waiting for candidate submission...</motion.p>
          )}
          {step === 1 && (
            <motion.p key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm text-indigo-300 font-medium">Extracting semantic tokens from PDF resume...</motion.p>
          )}
          {step === 2 && (
            <motion.p key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm text-indigo-300 font-medium">Generating 1536-dimensional embeddings for similarity search...</motion.p>
          )}
          {step === 3 && (
            <motion.p key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm text-indigo-300 font-medium">Evaluating candidate against job requirements using Llama 3...</motion.p>
          )}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3">
              <div className="text-2xl font-black text-emerald-400">94%</div>
              <div>
                <p className="text-sm font-bold text-white">Evaluation Complete</p>
                <p className="text-xs text-emerald-500 font-medium">Candidate auto-moved to Screening</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIPipelineVisualizer;

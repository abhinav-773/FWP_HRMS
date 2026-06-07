import React, { useState } from 'react';
import RequestDemoModal from './RequestDemoModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, Sparkles, Briefcase, Mic, BrainCircuit, 
  DollarSign, Clock, Users, BarChart3, MessageSquare, 
  CheckCircle2, Plus, Minus, ArrowRight, Shield, Layers, Zap,
  Moon, Sun, Code, Mail, Globe
} from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';

const LandingPage = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-300">
      {/* Dynamic Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none z-0" />

      <Navbar onOpenDemo={() => setIsDemoModalOpen(true)} />
      
      <main className="relative z-10">
        <HeroSection onOpenDemo={() => setIsDemoModalOpen(true)} />
        <TrustedBy />
        <CoreFeatures />
        <AIShowcase />
        <InteractivePreview />
        <DeveloperSection />
        <PricingSection onOpenDemo={() => setIsDemoModalOpen(true)} />
        <Testimonials />
        <FAQSection />
      </main>

      <Footer />
      <RequestDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </div>
  );
};

/* --- COMPONENTS --- */

const Navbar = ({ onOpenDemo }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-white/10 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-black text-xl text-white">H</span>
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            HireMind
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600 dark:text-gray-300">
          <a href="#features" className="hover:text-indigo-600 dark:hover:text-white transition-colors relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
          </a>
          <a href="#ai" className="hover:text-indigo-600 dark:hover:text-white transition-colors relative group">
            AI Engine
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
          </a>
          <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-white transition-colors relative group">
            Plans
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
          </a>
          <a href="#faq" className="hover:text-indigo-600 dark:hover:text-white transition-colors relative group">
            FAQ
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
          </a>
          <Link to="/careers" className="hover:text-indigo-600 dark:hover:text-indigo-400 font-black transition-colors relative group">
            Careers
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-6 py-2.5 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-bold text-sm shadow-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:border-indigo-500/50 transition-all duration-300 flex items-center justify-center overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Login</span>
            </motion.button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

const HeroSection = ({ onOpenDemo }) => (
  <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center">
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 text-indigo-600 dark:text-indigo-300 text-sm font-bold mb-8 cursor-pointer hover:bg-indigo-100 dark:hover:bg-white/10 transition-colors shadow-sm"
      onClick={onOpenDemo}
    >
      <Sparkles className="w-4 h-4" />
      <span>Introducing AI Voice Interviews 2.0</span>
    </motion.div>
    
    <motion.h1 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
      className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-slate-900 dark:text-white"
    >
      The AI-Powered <br className="hidden md:block"/>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
        Enterprise HRMS
      </span> &amp; ATS Platform
    </motion.h1>
    
    <motion.p 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
      className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
    >
      Transform your workforce with autonomous AI recruitment, automated employee lifecycle onboarding, seamless payroll, and predictive analytics in one powerful enterprise platform.
    </motion.p>
    
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-4"
    >
      <button onClick={onOpenDemo} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:from-indigo-500 hover:to-purple-500 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-2 group">
        Request Demo <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
      <Link to="/careers" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-lg hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm transition-all flex items-center justify-center gap-2">
        View Open Roles
      </Link>
    </motion.div>
  </section>
);

const TrustedBy = () => (
  <section className="py-10 border-y border-white/5 bg-black/20 overflow-hidden">
    <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">Trusted by innovative enterprise teams</p>
    <div className="flex space-x-16 animate-marquee whitespace-nowrap opacity-40">
      {/* Mock Logos */}
      {['ACME Corp', 'GlobalTech', 'Innotech Systems', 'Nexus UI', 'Stark Industries', 'Wayne Enterprises', 'ACME Corp', 'GlobalTech', 'Innotech Systems'].map((name, i) => (
        <span key={i} className="text-2xl font-black tracking-tighter">{name}</span>
      ))}
    </div>
    <style jsx>{`
      @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      .animate-marquee { animation: marquee 20s linear infinite; width: 200%; }
    `}</style>
  </section>
);

const CoreFeatures = () => {
  const features = [
    { icon: Briefcase, title: 'ATS Recruitment', desc: 'Drag-and-drop Kanban pipeline with automated candidate tracking.' },
    { icon: BrainCircuit, title: 'AI Resume Screening', desc: 'Auto-score resumes against job descriptions using vector embeddings.' },
    { icon: Mic, title: 'AI Voice Interviews', desc: 'Asynchronous voice interviews evaluated by Llama3.' },
    { icon: DollarSign, title: 'Smart Payroll', desc: 'Automated salary calculation, tax deductions, and one-click slips.' },
    { icon: Clock, title: 'Time & Attendance', desc: 'Geofenced check-ins, leave tracking, and manager approvals.' },
    { icon: Users, title: 'Employee Directory', desc: 'Centralized org chart and comprehensive employee profiles.' },
    { icon: BarChart3, title: 'Advanced Analytics', desc: 'Real-time dashboards for hiring funnels and HR metrics.' },
    { icon: MessageSquare, title: 'AI HR Assistant', desc: '24/7 conversational bot for employee policy queries.' },
  ];

  return (
    <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Everything you need to scale</h2>
        <p className="text-xl text-gray-400">One unified platform to manage the entire employee lifecycle.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-5 group-hover:opacity-10 transition-opacity">
              <f.icon className="w-24 h-24 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 border border-indigo-100 dark:border-none">
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white relative z-10">{f.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed relative z-10">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const AIShowcase = () => (
  <section id="ai" className="py-24 relative overflow-hidden border-t border-white/5">
    <div className="absolute inset-0 bg-indigo-900/10" />
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-6">
            <BrainCircuit className="w-4 h-4" /> Proprietary Engine
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">Hire smarter with Autonomous AI Evaluation</h2>
          <p className="text-lg text-gray-400 mb-8 leading-relaxed">
            HireMind utilizes local inferencing and state-of-the-art open models to evaluate candidates completely offline, ensuring total data privacy and blazing fast speeds.
          </p>
          <ul className="space-y-6">
            {[
              { title: 'OpenAI Whisper', desc: 'Real-time audio transcription with zero latency.' },
              { title: 'Llama 3 8B', desc: 'Semantic evaluation of candidate answers against job specs.' },
              { title: 'Vector Embeddings', desc: 'Instant resume matching via semantic similarity.' }
            ].map((item, i) => (
              <li key={i} className="flex gap-4">
                <div className="mt-1"><CheckCircle2 className="w-6 h-6 text-indigo-400" /></div>
                <div>
                  <h4 className="font-bold text-white text-lg">{item.title}</h4>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          {/* Mockup Architecture Graphic */}
          <div className="aspect-square rounded-full border border-white/10 flex items-center justify-center relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full animate-pulse" />
             <div className="w-64 h-64 bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative z-10 flex flex-col justify-center items-center gap-4">
                <Mic className="w-10 h-10 text-indigo-400" />
                <ArrowRight className="w-6 h-6 text-gray-600 rotate-90" />
                <div className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded">Whisper TTS</div>
                <ArrowRight className="w-6 h-6 text-gray-600 rotate-90" />
                <div className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded">Llama 3 Local Engine</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const InteractivePreview = () => (
  <section className="py-24 px-6 max-w-7xl mx-auto text-center">
    <h2 className="text-4xl font-bold mb-16">See it in action</h2>
    <div className="relative rounded-2xl border border-white/10 bg-gray-900 overflow-hidden shadow-2xl">
      <div className="h-10 bg-black/50 border-b border-white/10 flex items-center px-4 gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
      </div>
      <div className="p-8 aspect-video bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Abstract mock UI */}
        <div className="w-full h-full flex gap-6">
          <div className="w-1/4 h-full border border-white/10 rounded-xl bg-white/5 p-4 space-y-4">
             <div className="h-8 bg-white/10 rounded w-1/2" />
             <div className="h-4 bg-white/5 rounded w-3/4" />
             <div className="h-4 bg-white/5 rounded w-full" />
             <div className="h-4 bg-white/5 rounded w-5/6" />
          </div>
          <div className="flex-1 h-full border border-white/10 rounded-xl bg-white/5 p-6 flex flex-col gap-6">
             <div className="flex justify-between">
                <div className="h-8 bg-white/10 rounded w-1/3" />
                <div className="h-8 bg-indigo-500/50 rounded w-24" />
             </div>
             <div className="flex gap-4 h-32">
                <div className="flex-1 bg-white/5 rounded-xl border border-white/5" />
                <div className="flex-1 bg-white/5 rounded-xl border border-white/5" />
                <div className="flex-1 bg-white/5 rounded-xl border border-white/5" />
             </div>
             <div className="flex-1 bg-white/5 rounded-xl border border-white/5" />
          </div>
        </div>
        
        {/* Floating AI Badge overlay */}
        <motion.div 
          animate={{ y: [0, -10, 0] }} 
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute right-12 top-24 bg-gray-900 border border-indigo-500/50 rounded-xl p-4 shadow-2xl shadow-indigo-500/20 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full border-4 border-green-500 flex items-center justify-center font-bold text-green-400">92%</div>
          <div className="text-left">
            <p className="text-sm font-bold text-white">AI Candidate Score</p>
            <p className="text-xs text-gray-400">Strong semantic match</p>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const DeveloperSection = () => (
  <section className="py-24 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Built & Engineered By</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400">The vision behind HireMind Enterprise</p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ y: -5 }}
          className="relative rounded-3xl p-8 md:p-12 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 backdrop-blur-xl shadow-xl hover:shadow-[0_0_50px_-10px_rgba(147,51,234,0.3)] hover:border-purple-500/50 transition-all duration-500 group overflow-hidden"
        >
          {/* Subtle floating gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[80px] -z-10 group-hover:bg-purple-500/30 transition-colors duration-500 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[80px] -z-10 group-hover:bg-indigo-500/30 transition-colors duration-500 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
            {/* Developer Photo */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-md opacity-0 group-hover:opacity-60 group-hover:animate-pulse transition-opacity duration-500" />
              <img 
                src="/assets/developer.jpg" 
                alt="Abhinav Bharadwaj" 
                className="relative w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-2xl transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            
            {/* Developer Details */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Abhinav Bharadwaj</h3>
              <p className="text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase text-sm mb-6">
                Aspiring Software Engineer
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mb-8 italic">
                “Passionate about building scalable AI-powered enterprise systems, intelligent HR platforms, and futuristic SaaS products.”
              </p>
              
              {/* Social Buttons */}
              <div className="flex items-center justify-center md:justify-start gap-4">
                <a href="#" className="p-3.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="#" className="p-3.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300">
                  <Code className="w-5 h-5" />
                </a>
                <a href="#" className="p-3.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-500/20 hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-300">
                  <Globe className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const PricingSection = ({ onOpenDemo }) => {
  const plans = [
    { name: 'Growth', price: 'Custom', desc: 'For scaling companies', features: ['Up to 250 employees', 'AI Resume Screening', 'Basic ATS Pipeline', 'Standard Support'] },
    { name: 'Enterprise', price: 'Custom', desc: 'For large organizations', popular: true, features: ['Unlimited employees', 'AI Voice Interviews', 'Dedicated Server (Local Llama)', '24/7 SLA', 'Custom Integrations'] }
  ];

  return (
    <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Enterprise pricing built for scale</h2>
        <p className="text-xl text-gray-400">Contact our sales team for a custom quote tailored to your organization.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((p, i) => (
          <div key={i} className={`p-8 rounded-2xl relative ${p.popular ? 'bg-gradient-to-b from-indigo-900/50 to-gray-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-105 z-10' : 'bg-white/5 border border-white/10'}`}>
            {p.popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>}
            <h3 className="text-2xl font-bold mb-2">{p.name}</h3>
            <p className="text-gray-400 text-sm mb-6">{p.desc}</p>
            <div className="text-4xl font-black mb-8">{p.price}</div>
            <ul className="space-y-4 mb-8">
              {p.features.map((f, j) => (
                <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={onOpenDemo} className={`w-full py-3 rounded-xl font-bold transition-colors ${p.popular ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
              Contact Sales
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

const Testimonials = () => (
  <section className="py-24 border-y border-white/5 bg-black/20">
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="text-3xl font-bold text-center mb-16">Trusted by HR Leaders</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { q: "The AI Voice Interview feature cut our screening time by 80%. We're hiring better candidates, faster.", name: "Sarah Jenkins", role: "VP of HR, TechFlow" },
          { q: "HireMind's payroll and attendance integration is flawless. It's the only tool we need.", name: "Michael Chen", role: "Operations, Innovate AI" },
          { q: "We tested several AI screening tools, but the local Llama3 engine in HireMind is unmatched in accuracy.", name: "Emily Watson", role: "Head of Talent, Nexus" }
        ].map((t, i) => (
          <div key={i} className="p-8 rounded-2xl bg-gray-900 border border-white/5 relative">
            <div className="text-indigo-500 text-4xl font-serif absolute top-4 left-4 opacity-20">"</div>
            <p className="text-gray-300 relative z-10 mb-6 italic">"{t.q}"</p>
            <div>
              <p className="font-bold text-white">{t.name}</p>
              <p className="text-xs text-gray-500">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FAQSection = () => {
  const faqs = [
    { q: 'Is the AI Evaluation biased?', a: 'HireMind uses strictly constrained prompts that only evaluate candidate responses based on technical accuracy and relevance to the job description, actively ignoring demographic indicators.' },
    { q: 'Can I self-host the AI engine?', a: 'Yes! Our Enterprise tier allows you to run the entire backend, including the Llama3 inferencing engine, on your own on-premise hardware.' },
    { q: 'Does it integrate with my calendar?', a: 'We support full integration with Google Calendar and Outlook for seamless interview scheduling.' },
    { q: 'Is candidate data secure?', a: 'Absolutely. We use enterprise-grade encryption for all database records, and our voice processing deletes temporary audio files immediately after transcription.' }
  ];

  return (
    <section id="faq" className="py-24 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <FAQItem key={i} question={faq.q} answer={faq.a} />
        ))}
      </div>
    </section>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
      <button 
        className="w-full px-6 py-4 flex items-center justify-between font-bold text-left hover:bg-white/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {question}
        {isOpen ? <Minus className="w-5 h-5 text-indigo-400" /> : <Plus className="w-5 h-5 text-indigo-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-4 text-gray-400 text-sm leading-relaxed"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Footer = () => (
  <footer className="border-t border-white/10 bg-gray-950 py-12 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="font-black text-white text-sm">H</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">HireMind</span>
        </div>
        <p className="text-sm text-gray-500">The next generation of enterprise HR software, powered by artificial intelligence.</p>
      </div>
      <div>
        <h4 className="font-bold text-white mb-4">Product</h4>
        <ul className="space-y-2 text-sm text-gray-500">
          <li><a href="#" className="hover:text-indigo-400 transition-colors">Features</a></li>
          <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
          <li><a href="#" className="hover:text-indigo-400 transition-colors">AI Engine</a></li>
          <li><a href="#" className="hover:text-indigo-400 transition-colors">Integrations</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-white mb-4">Resources</h4>
        <ul className="space-y-2 text-sm text-gray-500">
          <li><a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a></li>
          <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
          <li><a href="#" className="hover:text-indigo-400 transition-colors">Support</a></li>
          <li><a href="#" className="hover:text-indigo-400 transition-colors">API</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-white mb-4">Legal</h4>
        <ul className="space-y-2 text-sm text-gray-500">
          <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
          <li><a href="#" className="hover:text-indigo-400 transition-colors">Security</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 text-center text-sm text-gray-600">
      &copy; {new Date().getFullYear()} HireMind. All rights reserved.
    </div>
  </footer>
);

export default LandingPage;

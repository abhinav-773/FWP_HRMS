import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Briefcase, UserPlus, Shield } from 'lucide-react';
import EnterpriseLoginModal from '../../../components/auth/EnterpriseLoginModal';

const ROLES = [
  { id: 'HR_RECRUITER', title: 'HR Recruiter', image: '/assets/roles/hr.png', description: 'Manage ATS & candidates' },
  { id: 'SENIOR_MANAGER', title: 'Senior Manager', image: '/assets/roles/manager.png', description: 'Team approvals & reports' },
  { id: 'SUPER_ADMIN', title: 'Super Admin', image: '/assets/roles/admin.png', description: 'Executive dashboard' },
  { id: 'EMPLOYEE', title: 'Employee', image: '/assets/roles/employee.png', description: 'Access your HR portal' },
];

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Add a slight delay before clearing the role to allow exit animations to finish smoothly
    setTimeout(() => setSelectedRole(null), 300);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4 tracking-tight">
            HireMind Enterprise
          </h1>
          <p className="text-gray-400 text-lg">
            Select your role portal to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {ROLES.map((role, i) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleRoleSelect(role)}
              className="group relative p-8 rounded-3xl bg-gray-900/50 border border-white/10 hover:border-purple-500/70 backdrop-blur-md hover:backdrop-blur-2xl transition-all duration-500 text-center flex flex-col items-center hover:-translate-y-3 hover:shadow-[0_0_40px_-5px_rgba(147,51,234,0.5)] overflow-hidden"
            >
              <div className="flex justify-center items-center mb-6 w-full h-[120px]">
                <img 
                  src={role.image} 
                  alt={role.title} 
                  className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] object-contain group-hover:scale-110 transition-transform duration-700 ease-out drop-shadow-2xl animate-[float_4s_ease-in-out_infinite]"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[200px] mx-auto">{role.description}</p>
              
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Enterprise Modal */}
      <EnterpriseLoginModal 
        role={selectedRole} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </div>
  );
};

export default LoginPage;

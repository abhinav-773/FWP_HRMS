import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, User, Building, Briefcase } from 'lucide-react';

const OrgChartNode = ({ employee, employeesMap, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Find subordinates for this employee
  const subordinates = employeesMap[employee.id] || [];
  const hasSubordinates = subordinates.length > 0;

  return (
    <div className="flex flex-col items-center select-none">
      {/* Employee Card Node */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-64 bg-gray-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl relative transition-all duration-300 ${
          hasSubordinates && isExpanded ? 'border-indigo-500/30 shadow-indigo-500/5' : 'hover:border-white/20'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-bold text-indigo-400 text-lg flex-shrink-0 overflow-hidden">
            {employee.profilePhoto ? (
              <img src={employee.profilePhoto} alt={employee.user?.fullName} className="h-full w-full object-cover" />
            ) : (
              employee.user?.fullName?.charAt(0) || 'E'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-white text-sm truncate">{employee.user?.fullName}</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
              <Briefcase className="h-3 w-3 text-indigo-400/80" />
              <span className="truncate">{employee.designation?.title || 'Member'}</span>
            </p>
            <p className="text-[9px] text-gray-500 font-medium truncate flex items-center gap-1 mt-0.5">
              <Building className="h-2.5 w-2.5" />
              <span className="truncate">{employee.department?.name || 'Unassigned'}</span>
            </p>
          </div>

          {/* Toggle Expand Subordinates Button */}
          {hasSubordinates && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white/5 border border-white/5 rounded-lg text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </motion.div>

      {/* Connection line down */}
      {hasSubordinates && isExpanded && (
        <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500/30 to-indigo-500/20" />
      )}

      {/* Children Subordinates Nodes */}
      <AnimatePresence>
        {hasSubordinates && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-row justify-center gap-8 relative px-4"
          >
            {/* Horizontal connection line spans */}
            {subordinates.length > 1 && (
              <div className="absolute top-0 left-[12%] right-[12%] h-0.5 bg-indigo-500/20" />
            )}

            {subordinates.map((sub, idx) => {
              const subSubordinates = employeesMap[sub.id] || [];
              const hasSubSub = subSubordinates.length > 0;

              return (
                <div key={sub.id} className="flex flex-col items-center relative">
                  {/* Small line going from horizontal bar down to child card */}
                  <div className="w-0.5 h-6 bg-indigo-500/20 mb-0.5" />
                  <OrgChartNode
                    employee={sub}
                    employeesMap={employeesMap}
                    depth={depth + 1}
                  />
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrgChartNode;

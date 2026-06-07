import React, { useState, useEffect } from 'react';
import * as JoyrideModule from 'react-joyride';
const Joyride = JoyrideModule.default || JoyrideModule.Joyride || JoyrideModule;
const STATUS = JoyrideModule.STATUS;

export const TourTypes = {
  RECRUITER: 'RECRUITER',
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
  INVESTOR: 'INVESTOR'
};

const tours = {
  [TourTypes.RECRUITER]: [
    {
      target: '.sidebar-link-ats-analytics',
      content: 'Welcome Recruiter! Here is where you monitor recruitment pipeline stats.',
      disableBeacon: true,
    },
    {
      target: '.sidebar-link-kanban-pipeline',
      content: 'Access the Kanban Pipeline to review resumes and move candidates across stages.',
    },
    {
      target: '.sidebar-link-onboarding-assets',
      content: 'Assign checklists to new hires and manage fleet hardware provisioning here.',
    }
  ],
  [TourTypes.INVESTOR]: [
    {
      target: '.sidebar-link-dashboard',
      content: 'Welcome to HireMind! This is the core employee-facing dashboard page.',
      disableBeacon: true,
    },
    {
      target: '.sidebar-link-directory',
      content: 'Check the team directory list or switch to the interactive Org Chart hierarchy.',
    }
  ],
  [TourTypes.ADMIN]: [
    {
      target: '.sidebar-link-executive-overview',
      content: 'Welcome Admin! Review global executive overview analytics here.',
      disableBeacon: true,
    },
    {
      target: '.sidebar-link-user-management',
      content: 'Manage user profiles, registration metadata, and system access roles.',
    },
    {
      target: '.sidebar-link-system-settings',
      content: 'Configure global RBAC details, API keys, and server-side configurations.',
    }
  ],
  [TourTypes.EMPLOYEE]: [
    {
      target: '.sidebar-link-dashboard',
      content: 'Welcome to your employee portal! Here is your quick personal overview.',
      disableBeacon: true,
    },
    {
      target: '.sidebar-link-my-attendance',
      content: 'Clock in, check break durations, or toggle remote WFH shifts here.',
    },
    {
      target: '.sidebar-link-my-payroll',
      content: 'Review monthly basic salary, allowances, deductions, and print payslips.',
    },
    {
      target: '.sidebar-link-ai-assistant',
      content: 'Ask questions about company guidelines, leave rules, and system routes.',
    }
  ]
};

const GuidedTour = ({ type, run, onFinish }) => {
  const steps = tours[type] || tours[TourTypes.INVESTOR];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      if (onFinish) onFinish();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#4f46e5', // Indigo 600
          backgroundColor: '#1f2937', // Gray 800
          textColor: '#f3f4f6', // Gray 100
          arrowColor: '#1f2937',
          overlayColor: 'rgba(0, 0, 0, 0.6)',
        },
        tooltipContainer: {
          textAlign: 'left',
          borderRadius: '12px',
        },
        buttonNext: {
          backgroundColor: '#4f46e5',
          borderRadius: '8px',
          fontWeight: 600,
        },
        buttonBack: {
          color: '#9ca3af',
        },
        buttonSkip: {
          color: '#9ca3af',
        }
      }}
    />
  );
};

export default GuidedTour;

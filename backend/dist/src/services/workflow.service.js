import prisma from '../config/prisma';
export class WorkflowService {
    /**
     * Seed default rules if the database has none.
     */
    async seedDefaultRules() {
        const count = await prisma.workflowRule.count();
        if (count > 0)
            return;
        console.log('[WorkflowService] Seeding default workflow rules...');
        // 1. Auto Onboarding Welcome Email Rule
        await prisma.workflowRule.create({
            data: {
                name: 'Auto Onboarding Welcome Email & Tasks',
                triggerEvent: 'ON_BOARDING_STARTED',
                isActive: true,
                conditions: { role: 'EMPLOYEE' },
                actions: {
                    create: [
                        {
                            actionType: 'CREATE_NOTIFICATION',
                            parameters: {
                                title: 'Welcome to the Team! 🚀',
                                message: 'Your onboarding portal is now active. Please sign your NDA and upload your ID proof to get started.',
                                type: 'SYSTEM'
                            }
                        },
                        {
                            actionType: 'CREATE_TASK',
                            parameters: { title: 'Upload Government ID', description: 'Aadhaar or Passport', dueDateOffsetDays: 2, documentRequired: true }
                        },
                        {
                            actionType: 'CREATE_TASK',
                            parameters: { title: 'Upload Resume', description: 'Latest updated resume', dueDateOffsetDays: 2, documentRequired: true }
                        },
                        {
                            actionType: 'CREATE_TASK',
                            parameters: { title: 'Sign Offer Letter', description: 'Signed and dated offer letter', dueDateOffsetDays: 2, documentRequired: true }
                        },
                        {
                            actionType: 'CREATE_TASK',
                            parameters: { title: 'Upload Educational Certificates', description: 'Highest degree certificate', dueDateOffsetDays: 3, documentRequired: true }
                        },
                        {
                            actionType: 'CREATE_TASK',
                            parameters: { title: 'Upload PAN Card', description: 'For payroll processing', dueDateOffsetDays: 2, documentRequired: true }
                        },
                        {
                            actionType: 'CREATE_TASK',
                            parameters: { title: 'Upload Aadhaar Card', description: 'For identity verification', dueDateOffsetDays: 2, documentRequired: true }
                        },
                        {
                            actionType: 'CREATE_TASK',
                            parameters: { title: 'Upload Bank Details', description: 'Cancelled cheque or passbook for salary', dueDateOffsetDays: 3, documentRequired: true }
                        },
                        {
                            actionType: 'CREATE_TASK',
                            parameters: { title: 'Upload Address Proof', description: 'Utility bill or rent agreement', dueDateOffsetDays: 3, documentRequired: true }
                        },
                        {
                            actionType: 'CREATE_TASK',
                            parameters: { title: 'Upload Passport Photo', description: 'Recent passport size photo for ID card', dueDateOffsetDays: 2, documentRequired: true }
                        },
                        {
                            actionType: 'CREATE_TASK',
                            parameters: { title: 'Sign NDA', description: 'Non-disclosure agreement', dueDateOffsetDays: 2, documentRequired: true }
                        }
                    ]
                }
            }
        });
        // 2. Missing Document Reminder Rule
        await prisma.workflowRule.create({
            data: {
                name: 'Missing Onboarding Documents Alert',
                triggerEvent: 'DOCUMENT_MISSING',
                isActive: true,
                conditions: { delayDays: 3 },
                actions: {
                    create: [
                        {
                            actionType: 'CREATE_NOTIFICATION',
                            parameters: {
                                title: 'Onboarding Action Required ⚠️',
                                message: 'You have pending onboarding documents. Please sign the NDA and upload ID proof to avoid delays.',
                                type: 'SYSTEM'
                            }
                        }
                    ]
                }
            }
        });
        // 3. Payroll Activation Automation Rule
        await prisma.workflowRule.create({
            data: {
                name: 'Auto Payroll Activation upon Onboarding Completion',
                triggerEvent: 'ONBOARDING_COMPLETED',
                isActive: true,
                actions: {
                    create: [
                        {
                            actionType: 'ACTIVATE_PAYROLL',
                            parameters: {
                                baseSalary: 80000,
                                allowances: 500,
                                deductions: 150
                            }
                        },
                        {
                            actionType: 'CREATE_NOTIFICATION',
                            parameters: {
                                title: 'Payroll Activated ✅',
                                message: 'Your onboarding is complete. Payroll has been automatically initialized for your account.',
                                type: 'PAYROLL'
                            }
                        }
                    ]
                }
            }
        });
        // 4. Probation Review Reminder Rule
        await prisma.workflowRule.create({
            data: {
                name: 'Probation Review Alert (90 Days)',
                triggerEvent: 'PROBATION_COMPLETION',
                isActive: true,
                actions: {
                    create: [
                        {
                            actionType: 'CREATE_NOTIFICATION',
                            parameters: {
                                title: 'Probation Review Due 📈',
                                message: 'Employee is nearing 90 days. Please schedule their probation and performance review.',
                                type: 'SYSTEM'
                            }
                        }
                    ]
                }
            }
        });
    }
    async getRules() {
        await this.seedDefaultRules();
        return await prisma.workflowRule.findMany({
            include: { actions: true }
        });
    }
    async toggleRule(ruleId, isActive) {
        return await prisma.workflowRule.update({
            where: { id: ruleId },
            data: { isActive },
            include: { actions: true }
        });
    }
    /**
     * Trigger and execute actions for a specific event
     */
    async executeEvent(event, context) {
        await this.seedDefaultRules();
        console.log(`[WorkflowService] Processing event: ${event} for user: ${context.userId}`);
        // Fetch active rules matching the trigger event
        const rules = await prisma.workflowRule.findMany({
            where: { triggerEvent: event, isActive: true },
            include: { actions: true }
        });
        for (const rule of rules) {
            console.log(`[WorkflowService] Evaluating Rule: "${rule.name}"`);
            // Execute actions
            for (const action of rule.actions) {
                await this.runAction(action, context);
            }
        }
    }
    async runAction(action, context) {
        const params = action.parameters;
        console.log(`[WorkflowService] Running Action: ${action.actionType}`, params);
        try {
            if (action.actionType === 'CREATE_NOTIFICATION') {
                await prisma.notification.create({
                    data: {
                        userId: context.userId,
                        title: params.title,
                        message: params.message,
                        type: params.type || 'SYSTEM',
                        isRead: false
                    }
                });
            }
            else if (action.actionType === 'CREATE_TASK' && context.employeeProfileId) {
                // Find or create an onboarding checklist for the user
                let checklist = await prisma.onboardingChecklist.findFirst({
                    where: { employeeId: context.employeeProfileId }
                });
                if (!checklist) {
                    checklist = await prisma.onboardingChecklist.create({
                        data: {
                            employeeId: context.employeeProfileId,
                            title: 'Default Onboarding Checklist',
                            description: 'Automatically created onboarding tasks.',
                            status: 'IN_PROGRESS'
                        }
                    });
                }
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + (params.dueDateOffsetDays || 3));
                await prisma.onboardingTask.create({
                    data: {
                        checklistId: checklist.id,
                        title: params.title,
                        description: params.description,
                        status: 'PENDING',
                        dueDate,
                        documentRequired: params.documentRequired || false
                    }
                });
            }
            else if (action.actionType === 'ACTIVATE_PAYROLL' && context.employeeProfileId) {
                const currentMonth = new Date().getMonth() + 1;
                const currentYear = new Date().getFullYear();
                const base = params.baseSalary || 5000;
                const allowances = params.allowances || 0;
                const deductions = params.deductions || 0;
                const netPay = base + allowances - deductions;
                await prisma.payroll.upsert({
                    where: {
                        employeeId_month_year: {
                            employeeId: context.employeeProfileId,
                            month: currentMonth,
                            year: currentYear
                        }
                    },
                    update: {
                        basicSalary: base,
                        allowances,
                        deductions,
                        netPay,
                        status: 'DRAFT'
                    },
                    create: {
                        employeeId: context.employeeProfileId,
                        month: currentMonth,
                        year: currentYear,
                        basicSalary: base,
                        allowances,
                        deductions,
                        netPay,
                        status: 'DRAFT'
                    }
                });
            }
        }
        catch (err) {
            console.error(`[WorkflowService] Action execution failed for type ${action.actionType}:`, err.message);
        }
    }
}
export default new WorkflowService();
//# sourceMappingURL=workflow.service.js.map
import employeeBootstrapService from './employeeBootstrap.service';
import employeeService from './employee.service';
export class EmployeeProvisioningService {
    /**
     * Generates a unique 6-digit employee ID.
     */
    generateEmployeeId() {
        return `EMP-${Math.floor(Math.random() * 900000) + 100000}`;
    }
    /**
     * Generates a secure temporary password.
     */
    generateTempPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
    /**
     * Full provisioning flow: Creates user, creates profile, bootstraps HR modules.
     */
    async provisionEmployee(data) {
        const employeeId = this.generateEmployeeId();
        const tempPassword = this.generateTempPassword();
        // 1. Core creation using the existing EmployeeService
        const profile = await employeeService.createEmployee({
            fullName: data.fullName,
            email: data.email,
            password: tempPassword,
            role: data.role,
            employeeId,
            departmentId: data.departmentId,
            designationId: data.designationId,
            managerId: data.managerId,
            joinDate: data.joinDate,
        });
        // 2. Automatically bootstrap the required HR records (Payroll, Onboarding, etc.)
        await this.bootstrapEmployeeModules(profile.id);
        // TODO: Phase 6 Email automation: send out tempPassword and welcome email
        return { profile, tempPassword };
    }
    /**
     * Ensures all required modules are initialized for the new employee.
     */
    async bootstrapEmployeeModules(employeeProfileId) {
        await employeeBootstrapService.initializeHRRecords(employeeProfileId);
    }
}
export default new EmployeeProvisioningService();
//# sourceMappingURL=employeeProvisioning.service.js.map
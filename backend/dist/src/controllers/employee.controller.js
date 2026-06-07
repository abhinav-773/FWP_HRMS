import employeeService from '../services/employee.service';
import employeeProvisioningService from '../services/employeeProvisioning.service';
export const getEmployees = async (req, res) => {
    try {
        const employees = await employeeService.getAllEmployees(req.query);
        res.json({ data: employees });
    }
    catch (error) {
        console.error('getEmployees error:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
};
export const getEmployeeById = async (req, res) => {
    try {
        const employee = await employeeService.getEmployeeById(req.params.id);
        if (!employee)
            return res.status(404).json({ error: 'Employee not found' });
        res.json({ data: employee });
    }
    catch (error) {
        console.error('getEmployeeById error:', error);
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
};
export const createEmployee = async (req, res) => {
    try {
        const result = await employeeProvisioningService.provisionEmployee(req.body);
        res.status(201).json({
            data: result.profile,
            tempPassword: result.tempPassword, // Return temp password to UI for demo purposes
            message: 'Employee created and provisioned successfully'
        });
    }
    catch (error) {
        console.error('createEmployee error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email or Employee ID already exists' });
        }
        res.status(500).json({ error: 'Failed to create employee' });
    }
};
export const updateEmployee = async (req, res) => {
    try {
        const updatedEmployee = await employeeService.updateEmployee(req.params.id, req.body);
        res.json({ data: updatedEmployee, message: 'Employee updated successfully' });
    }
    catch (error) {
        console.error('updateEmployee error:', error);
        if (error.message === 'Employee not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to update employee' });
    }
};
//# sourceMappingURL=employee.controller.js.map
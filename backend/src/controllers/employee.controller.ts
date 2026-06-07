import { Request, Response } from 'express';
import employeeService from '../services/employee.service';
import employeeProvisioningService from '../services/employeeProvisioning.service';

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await employeeService.getAllEmployees(req.query);
    res.json({ data: employees });
  } catch (error) {
    console.error('getEmployees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id as string);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json({ data: employee });
  } catch (error) {
    console.error('getEmployeeById error:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const result = await employeeProvisioningService.provisionEmployee(req.body);
    res.status(201).json({ 
      data: result.profile, 
      tempPassword: result.tempPassword, // Return temp password to UI for demo purposes
      message: 'Employee created and provisioned successfully' 
    });
  } catch (error: any) {
    console.error('createEmployee error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email or Employee ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const updatedEmployee = await employeeService.updateEmployee(req.params.id as string, req.body);
    res.json({ data: updatedEmployee, message: 'Employee updated successfully' });
  } catch (error: any) {
    console.error('updateEmployee error:', error);
    if (error.message === 'Employee not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

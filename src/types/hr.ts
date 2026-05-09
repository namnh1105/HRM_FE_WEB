export type EmploymentStatus = 'ACTIVE' | 'INACTIVE';

export type CreateEmployeeRequest = {
    fullName: string;
    email: string;
    employmentStatus?: EmploymentStatus;
    phone?: string;
    userId?: string;
};

export type UpdateEmployeeRequest = Partial<CreateEmployeeRequest>;

export type CreateWorkShiftRequest = {
    name: string;
    startTime: string;
    endTime: string;
    enabled?: boolean;
};

export type UpdateWorkShiftRequest = Partial<CreateWorkShiftRequest>;

export type CreateContractRequest = {
    code: string;
    employeeId: string;
    type: string;
    startDate: string;
    endDate?: string;
    status?: string;
};

export type UpdateContractRequest = Partial<CreateContractRequest>;

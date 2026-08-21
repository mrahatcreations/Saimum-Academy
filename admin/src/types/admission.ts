export interface Person {
  id: string;
  fullNameEn: string;
  fullNameBn: string;
  photoUrl?: string;
  phone: string;
  email?: string;
  dob: string;
  gender: 'MALE' | 'FEMALE';
  bloodGroup?: string;
  nidBirthCert?: string;
  presentAddress: {
    division?: string;
    district: string;
    thana: string;
    addressLine: string;
  };
  permanentAddress: {
    division?: string;
    district: string;
    thana: string;
    addressLine: string;
  };
  fatherName: string;
  fatherPhone?: string;
  fatherOccupation?: string;
  motherName: string;
  motherPhone?: string;
  motherOccupation?: string;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  academicInstitution?: string;
  currentClass?: string;
  previousCulturalTraining?: string;
}

export type AdmissionStatus = 
  | 'PENDING_VIVA' 
  | 'VIVA_SCHEDULED' 
  | 'SELECTED'
  | 'REJECTED'
  | 'WORKSHOP'
  | 'REGULAR_STUDENT';

export interface AdmissionSession {
  id: string;
  title: string;
  sessionCode: string;
  year: number;
  startDate: string;
  endDate: string;
  applicationFee: number;
  isActive: boolean;
  status: 'ACTIVE' | 'CLOSED' | 'UPCOMING' | string;
  targetBranches?: string[];
  targetSubjects?: string[];
  targetBatches?: string[];
  regPrefix?: string;
  regStartNumber?: number;
  regCounter?: number;
  totalApplicants?: number;
  createdAt?: string;
}

export interface Registration {
  id: string;
  registrationNo: string;
  personId: string;
  sessionId?: string;
  sessionTitle?: string;
  sessionCode?: string;
  person: Person;
  branchId: string;
  branchName: string;
  branchType: 'PHYSICAL' | 'ONLINE';
  departmentId: string;
  departmentName: string;
  subjectId: string;
  subjectName: string;
  applicationYear: number;
  appliedDate: string;
  status: AdmissionStatus;
  viva?: {
    scheduledDate: string;
    scheduledTime: string;
    room: string;
    examinerPanel: string;
    score?: number;
    notes?: string;
  };
  vivaSchedule?: {
    date: string;
    time: string;
    room: string;
    examinerPanel?: string;
    score?: number;
    notes?: string;
  };
  vivaEvaluation?: {
    marks: number;
    notes: string;
    evaluatedBy: string;
    evaluatedAt: string;
  };
  payment: {
    status: 'PAID' | 'UNPAID' | string;
    amount: number;
    method: 'bKash' | 'Nagad' | 'SSLCommerz' | 'Cash / Desk' | string;
    transactionId: string;
    paidAt: string;
  };
  history?: {
    id?: string;
    registrationNo?: string;
    year: number;
    subject?: string;
    subjectId?: string;
    subjectName?: string;
    branch?: string;
    branchName?: string;
    status: string;
    result?: string;
    vivaDate?: string;
    vivaTime?: string;
    vivaRoom?: string;
    vivaScore?: number;
  }[];
}

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
  totalApplicants?: number;
}

export interface Registration {
  id: string;
  registrationNo: string;
  personId: string;
  sessionId?: string;
  sessionTitle?: string;
  person: {
    id: string;
    fullNameEn: string;
    fullNameBn?: string;
    phone: string;
    email?: string;
    dateOfBirth?: string;
    gender: 'MALE' | 'FEMALE';
    bloodGroup?: string;
    photoUrl?: string;
    fatherName?: string;
    fatherPhone?: string;
    motherName?: string;
    presentAddressLine?: string;
    presentAddressDistrict?: string;
    presentAddressDivision?: string;
    academicInstitution?: string;
    currentClass?: string;
    previousCulturalTraining?: string;
  };
  branchName?: string;
  departmentName?: string;
  subjectName?: string;
  status: 'PENDING_VIVA' | 'VIVA_SCHEDULED' | 'SELECTED' | 'REJECTED' | 'WORKSHOP' | 'REGULAR_STUDENT';
  vivaDate?: string;
  vivaTime?: string;
  vivaRoom?: string;
  vivaExaminer?: string;
  vivaScore?: number;
  paymentStatus: string;
  paymentAmount: number;
  paymentMethod: string;
  paymentTrxId?: string;
  appliedDate?: string;
  createdAt?: string;
}

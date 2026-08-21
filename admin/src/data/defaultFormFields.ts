import type { FormFieldConfig } from '../types/formBuilder';

export const defaultFormFields: FormFieldConfig[] = [
  // 1. Program Selection
  {
    id: 'fld-001',
    section: 'PROGRAM',
    fieldName: 'branch',
    labelEn: 'Branch Selection',
    fieldType: 'SELECT',
    options: ['Dhaka Central (Physical)', 'Mirpur Branch (Physical)', 'Online Academy (Zoom)'],
    helpText: 'Select candidate physical campus or online academy',
    isEnabled: true,
    isRequired: true,
    isSystemField: true,
    sortOrder: 1
  },
  {
    id: 'fld-002',
    section: 'PROGRAM',
    fieldName: 'department',
    labelEn: 'Department',
    fieldType: 'SELECT',
    options: ['Music Department', 'Drama & Theatre Department', 'Recitation Department'],
    helpText: 'Academic department of the selected program',
    isEnabled: true,
    isRequired: true,
    isSystemField: true,
    sortOrder: 2
  },
  {
    id: 'fld-003',
    section: 'PROGRAM',
    fieldName: 'subject',
    labelEn: 'Master Subject / Course',
    fieldType: 'SELECT',
    options: ['Vocal Music', 'Junior Music', 'Acting & Drama', 'Recitation & Elocution'],
    helpText: 'Primary subject or discipline',
    isEnabled: true,
    isRequired: true,
    isSystemField: true,
    sortOrder: 3
  },

  // 2. Personal Information
  {
    id: 'fld-004',
    section: 'PERSONAL',
    fieldName: 'fullNameEn',
    labelEn: 'Full Name (English)',
    fieldType: 'TEXT',
    placeholder: 'Enter full legal name in English',
    helpText: 'Primary name used on certificates and admit slips',
    isEnabled: true,
    isRequired: true,
    isSystemField: true,
    sortOrder: 4
  },
  {
    id: 'fld-005',
    section: 'PERSONAL',
    fieldName: 'fullNameBn',
    labelEn: 'Full Name (Bengali)',
    fieldType: 'TEXT',
    placeholder: 'বাংলা নাম (ঐচ্ছিক)',
    helpText: 'Optional native script representation',
    isEnabled: true,
    isRequired: false,
    isSystemField: false,
    sortOrder: 5
  },
  {
    id: 'fld-006',
    section: 'PERSONAL',
    fieldName: 'phone',
    labelEn: 'Mobile Number',
    fieldType: 'TEXT',
    placeholder: '01XXXXXXXXX',
    helpText: 'Used for admission SMS and notifications',
    isEnabled: true,
    isRequired: true,
    isSystemField: true,
    sortOrder: 6
  },
  {
    id: 'fld-007',
    section: 'PERSONAL',
    fieldName: 'dob',
    labelEn: 'Date of Birth',
    fieldType: 'DATE',
    helpText: 'Applicant age is automatically calculated from DOB',
    isEnabled: true,
    isRequired: true,
    isSystemField: true,
    sortOrder: 7
  },
  {
    id: 'fld-008',
    section: 'PERSONAL',
    fieldName: 'gender',
    labelEn: 'Gender',
    fieldType: 'RADIO',
    options: ['Male', 'Female'],
    helpText: 'Gender identification',
    isEnabled: true,
    isRequired: true,
    isSystemField: true,
    sortOrder: 8
  },
  {
    id: 'fld-009',
    section: 'PERSONAL',
    fieldName: 'photo',
    labelEn: 'Passport Size Photo',
    fieldType: 'FILE',
    helpText: 'JPG or PNG format, max file size 2MB',
    isEnabled: true,
    isRequired: true,
    isSystemField: false,
    sortOrder: 9
  },
  {
    id: 'fld-010',
    section: 'PERSONAL',
    fieldName: 'bloodGroup',
    labelEn: 'Blood Group',
    fieldType: 'SELECT',
    options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    helpText: 'Emergency blood group specification',
    isEnabled: true,
    isRequired: false,
    isSystemField: false,
    sortOrder: 10
  },
  {
    id: 'fld-011',
    section: 'PERSONAL',
    fieldName: 'nidBirthCert',
    labelEn: 'Birth Registration / NID Number',
    fieldType: 'TEXT',
    placeholder: 'Enter 17-digit birth certificate or NID no.',
    helpText: 'Official identification number',
    isEnabled: true,
    isRequired: false,
    isSystemField: false,
    sortOrder: 11
  },

  // 3. Guardian & Family
  {
    id: 'fld-012',
    section: 'GUARDIAN',
    fieldName: 'fatherName',
    labelEn: "Father's Full Name",
    fieldType: 'TEXT',
    placeholder: "Enter father's name",
    helpText: 'Legal father name',
    isEnabled: true,
    isRequired: true,
    isSystemField: false,
    sortOrder: 12
  },
  {
    id: 'fld-013',
    section: 'GUARDIAN',
    fieldName: 'fatherPhone',
    labelEn: "Father's Mobile Number",
    fieldType: 'TEXT',
    placeholder: '01XXXXXXXXX',
    helpText: 'Primary contact for student updates',
    isEnabled: true,
    isRequired: false,
    isSystemField: false,
    sortOrder: 13
  },
  {
    id: 'fld-014',
    section: 'GUARDIAN',
    fieldName: 'motherName',
    labelEn: "Mother's Full Name",
    fieldType: 'TEXT',
    placeholder: "Enter mother's name",
    helpText: 'Legal mother name',
    isEnabled: true,
    isRequired: true,
    isSystemField: false,
    sortOrder: 14
  },
  {
    id: 'fld-015',
    section: 'GUARDIAN',
    fieldName: 'presentAddress',
    labelEn: 'Present Residential Address',
    fieldType: 'TEXTAREA',
    placeholder: 'House no, road, area, thana, district',
    helpText: 'Current residing address with geographic coordinates',
    isEnabled: true,
    isRequired: true,
    isSystemField: false,
    sortOrder: 15
  },
  {
    id: 'fld-015_perm',
    section: 'GUARDIAN',
    fieldName: 'permanentAddress',
    labelEn: 'Permanent Address',
    fieldType: 'TEXTAREA',
    placeholder: 'Permanent village, thana, and district',
    helpText: 'Permanent origin address',
    isEnabled: true,
    isRequired: true,
    isSystemField: false,
    sortOrder: 16
  },

  // 4. Academic & Background
  {
    id: 'fld-016',
    section: 'ACADEMIC',
    fieldName: 'academicInstitution',
    labelEn: 'School / College / Institution Name',
    fieldType: 'TEXT',
    placeholder: 'Enter school, college, or madrasah name',
    helpText: 'Current educational institution',
    isEnabled: true,
    isRequired: true,
    isSystemField: false,
    sortOrder: 17
  },
  {
    id: 'fld-017',
    section: 'ACADEMIC',
    fieldName: 'currentClass',
    labelEn: 'Current Class / Academic Grade',
    fieldType: 'SELECT',
    options: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'HSC / College', 'Honours / University'],
    helpText: 'Current academic level',
    isEnabled: true,
    isRequired: true,
    isSystemField: false,
    sortOrder: 18
  },
  {
    id: 'fld-018',
    section: 'ACADEMIC',
    fieldName: 'previousCulturalTraining',
    labelEn: 'Previous Cultural & Training Experience',
    fieldType: 'TEXTAREA',
    placeholder: 'Describe any past music, drama, recitation, or stage experience...',
    helpText: 'Prior artistic experience or training background',
    isEnabled: true,
    isRequired: false,
    isSystemField: false,
    sortOrder: 19
  },

  // 5. Custom Dynamic Fields
  {
    id: 'fld-019',
    section: 'CUSTOM',
    fieldName: 'tshirtSize',
    labelEn: 'Workshop T-Shirt Size',
    fieldType: 'SELECT',
    options: ['Kids (32)', 'Kids (34)', 'S (36)', 'M (38)', 'L (40)', 'XL (42)', 'XXL (44)'],
    helpText: 'Used for workshop starter kit and uniform sizing',
    isEnabled: true,
    isRequired: false,
    isSystemField: false,
    sortOrder: 20
  },
  {
    id: 'fld-020',
    section: 'CUSTOM',
    fieldName: 'referralSource',
    labelEn: 'How did you hear about Saimum Academy?',
    fieldType: 'SELECT',
    options: ['Social Media / Facebook', 'Banner / Poster', 'Friends & Family / Artist Member', 'Official Website', 'Other'],
    helpText: 'Marketing and outreach referral attribution',
    isEnabled: true,
    isRequired: false,
    isSystemField: false,
    sortOrder: 21
  }
];

export type FormSection = 'PROGRAM' | 'PERSONAL' | 'GUARDIAN' | 'ACADEMIC' | 'CUSTOM';

export type FieldType = 
  | 'TEXT' 
  | 'NUMBER' 
  | 'DATE' 
  | 'SELECT' 
  | 'RADIO' 
  | 'TEXTAREA' 
  | 'FILE' 
  | 'CHECKBOX';

export interface FormFieldConfig {
  id: string;
  section: FormSection;
  fieldName: string;
  labelEn: string;
  labelBn?: string;
  fieldType: FieldType;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  isEnabled: boolean;
  isRequired: boolean;
  isSystemField: boolean;
  sortOrder: number;
}

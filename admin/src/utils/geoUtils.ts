import divisionsData from '../data/geo/divisions.json';
import districtsData from '../data/geo/districts.json';
import upazilasData from '../data/geo/upazilas.json';

export interface Division {
  id: string;
  name: string;
  bn_name: string;
  lat?: string;
  long?: string;
}

export interface District {
  id: string;
  division_id: string;
  name: string;
  bn_name: string;
  lat?: string;
  long?: string;
}

export interface Upazila {
  id: string;
  district_id: string;
  name: string;
  bn_name: string;
}

export const divisions: Division[] = divisionsData.divisions;
export const districts: District[] = districtsData.districts;
export const upazilas: Upazila[] = upazilasData.upazilas;

export function getDivisions(): Division[] {
  return divisions;
}

export function getDistrictsByDivisionId(divisionId: string): District[] {
  return districts.filter(d => d.division_id === divisionId);
}

export function getUpazilasByDistrictId(districtId: string): Upazila[] {
  return upazilas.filter(u => u.district_id === districtId);
}

export function findDivisionByName(name: string): Division | undefined {
  const q = name.toLowerCase().trim();
  return divisions.find(d => d.name.toLowerCase() === q || d.bn_name === name.trim());
}

export function findDistrictByName(name: string): District | undefined {
  const q = name.toLowerCase().trim();
  return districts.find(d => d.name.toLowerCase() === q || d.bn_name === name.trim());
}

export function findUpazilaByName(name: string, districtId?: string): Upazila | undefined {
  const q = name.toLowerCase().trim();
  return upazilas.find(u => {
    const matchName = u.name.toLowerCase() === q || u.bn_name === name.trim();
    if (districtId) {
      return matchName && u.district_id === districtId;
    }
    return matchName;
  });
}

'use client';

import React, { useState } from 'react';
import { CustomSelect } from './CustomSelect';
import styles from './BangladeshAddressPicker.module.css';

interface AddressData {
  division: string;
  district: string;
  thana: string;
  addressLine: string;
}

interface AddressPickerProps {
  value: AddressData;
  onChange: (value: AddressData) => void;
}

const DIVISIONS_DATA: Record<string, { districts: Record<string, string[]> }> = {
  'Dhaka': {
    districts: {
      'Dhaka': ['Dhanmondi', 'Mirpur', 'Uttara', 'Mohammadpur', 'Gulshan', 'Badda', 'Motijheel', 'Old Dhaka', 'Savar', 'Keraniganj'],
      'Gazipur': ['Gazipur Sadar', 'Tongi', 'Kaliakair', 'Kapasia', 'Sreepur'],
      'Narayanganj': ['Narayanganj Sadar', 'Bandar', 'Rupganj', 'Sonargaon', 'Araihazar']
    }
  },
  'Chattogram': {
    districts: {
      'Chattogram': ['Kotwali', 'Panchlaish', 'Pahartali', 'Halishahar', 'Agrabad', 'Hathazari', 'Sitakunda', 'Patiya'],
      'Coxs Bazar': ['Coxs Bazar Sadar', 'Ramu', 'Chakaria', 'Teknaf', 'Ukhia'],
      'Cumilla': ['Cumilla Sadar', 'Laksam', 'Daudkandi', 'Debidwar', 'Chandina']
    }
  },
  'Rajshahi': {
    districts: {
      'Rajshahi': ['Boalia', 'Motihar', 'Rajpara', 'Shah Makhdum', 'Paba', 'Godagari'],
      'Bogura': ['Bogura Sadar', 'Sherpur', 'Shibganj', 'Kahaloo', 'Dhunat'],
      'Pabna': ['Pabna Sadar', 'Ishwardi', 'Sujanagar', 'Bera', 'Santhia']
    }
  },
  'Sylhet': {
    districts: {
      'Sylhet': ['Sylhet Sadar', 'Beanibazar', 'Golapganj', 'Zakiganj', 'Biswanath', 'Fenchuganj'],
      'Moulvibazar': ['Moulvibazar Sadar', 'Sreemangal', 'Kulaura', 'Rajnagar']
    }
  },
  'Khulna': {
    districts: {
      'Khulna': ['Khulna Sadar', 'Sonadanga', 'Khalishpur', 'Daulatpur', 'Dumuria', 'Rupsha'],
      'Jashore': ['Jashore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha']
    }
  },
  'Barishal': {
    districts: {
      'Barishal': ['Barishal Sadar', 'Bakerganj', 'Babuganj', 'Wazirpur', 'Banaripara']
    }
  },
  'Rangpur': {
    districts: {
      'Rangpur': ['Rangpur Sadar', 'Badarganj', 'Gangachara', 'Kaunia', 'Mithapukur'],
      'Dinajpur': ['Dinajpur Sadar', 'Birganj', 'Biral', 'Fulbari', 'Parbatipur']
    }
  },
  'Mymensingh': {
    districts: {
      'Mymensingh': ['Mymensingh Sadar', 'Muktagachha', 'Fulbaria', 'Trishal', 'Bhaluka']
    }
  }
};

export function BangladeshAddressPicker({ value, onChange }: AddressPickerProps) {
  const [division, setDivision] = useState(value.division || 'Dhaka');
  const [district, setDistrict] = useState(value.district || 'Dhaka');
  const [thana, setThana] = useState(value.thana || 'Dhanmondi');

  const divisionOptions = Object.keys(DIVISIONS_DATA).map(d => ({ value: d, label: d }));
  
  const currentDistricts = DIVISIONS_DATA[division]?.districts || {};
  const districtOptions = Object.keys(currentDistricts).map(d => ({ value: d, label: d }));

  const currentThanas = currentDistricts[district] || [];
  const thanaOptions = currentThanas.map(t => ({ value: t, label: t }));

  const handleDivisionChange = (newDiv: string) => {
    setDivision(newDiv);
    const firstDistrict = Object.keys(DIVISIONS_DATA[newDiv]?.districts || {})[0] || '';
    const firstThana = DIVISIONS_DATA[newDiv]?.districts[firstDistrict]?.[0] || '';
    setDistrict(firstDistrict);
    setThana(firstThana);
    onChange({
      division: newDiv,
      district: firstDistrict,
      thana: firstThana,
      addressLine: value.addressLine
    });
  };

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist);
    const firstThana = currentDistricts[newDist]?.[0] || '';
    setThana(firstThana);
    onChange({
      division,
      district: newDist,
      thana: firstThana,
      addressLine: value.addressLine
    });
  };

  const handleThanaChange = (newThana: string) => {
    setThana(newThana);
    onChange({
      division,
      district,
      thana: newThana,
      addressLine: value.addressLine
    });
  };

  const handleLineChange = (line: string) => {
    onChange({
      division,
      district,
      thana,
      addressLine: line
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid3}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Division</label>
          <CustomSelect
            options={divisionOptions}
            value={division}
            onChange={handleDivisionChange}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>District</label>
          <CustomSelect
            options={districtOptions}
            value={district}
            onChange={handleDistrictChange}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Thana / Upazila</label>
          <CustomSelect
            options={thanaOptions.length > 0 ? thanaOptions : [{ value: thana, label: thana || 'Sadar' }]}
            value={thana}
            onChange={handleThanaChange}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>House / Road / Village Address Details</label>
        <input
          type="text"
          className={styles.textInput}
          placeholder="e.g. House #14, Road #5, Block C"
          value={value.addressLine || ''}
          onChange={e => handleLineChange(e.target.value)}
        />
      </div>
    </div>
  );
}

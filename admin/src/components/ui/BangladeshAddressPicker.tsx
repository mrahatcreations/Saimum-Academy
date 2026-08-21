import { useState, useEffect } from 'react';
import { 
  getDivisions, 
  getDistrictsByDivisionId, 
  getUpazilasByDistrictId, 
  findDistrictByName
} from '../../utils/geoUtils';
import type { District, Upazila } from '../../utils/geoUtils';
import { MapPin } from 'lucide-react';
import { CustomSelect } from './CustomSelect';
import styles from './BangladeshAddressPicker.module.css';

export interface AddressValue {
  division?: string;
  district: string;
  thana: string;
  addressLine: string;
}

interface BangladeshAddressPickerProps {
  label: string;
  value: AddressValue;
  onChange: (newValue: AddressValue) => void;
  required?: boolean;
}

export default function BangladeshAddressPicker({
  label,
  value,
  onChange,
  required = false
}: BangladeshAddressPickerProps) {
  const allDivisions = getDivisions();

  // Find initial Division ID and District ID if existing names are passed
  const initialDistrictObj = findDistrictByName(value.district || 'Dhaka');
  const initialDivisionId = initialDistrictObj ? initialDistrictObj.division_id : '3'; // Dhaka division id = 3

  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(initialDivisionId);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(initialDistrictObj ? initialDistrictObj.id : '1'); // Dhaka district id = 1

  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [availableUpazilas, setAvailableUpazilas] = useState<Upazila[]>([]);

  // Synchronize when value.district changes externally (e.g. In Edit Modal or Auto-Lookup)
  useEffect(() => {
    if (value.district) {
      const distObj = findDistrictByName(value.district);
      if (distObj) {
        if (distObj.division_id !== selectedDivisionId) {
          setSelectedDivisionId(distObj.division_id);
        }
        if (distObj.id !== selectedDistrictId) {
          setSelectedDistrictId(distObj.id);
        }
      }
    }
  }, [value.district]);

  // Update districts when division changes
  useEffect(() => {
    const districts = getDistrictsByDivisionId(selectedDivisionId);
    setAvailableDistricts(districts);

    if (districts.length > 0) {
      // Check if current district is in this division
      const stillValid = districts.some(d => d.id === selectedDistrictId);
      if (!stillValid) {
        setSelectedDistrictId(districts[0].id);
      }
    } else {
      setSelectedDistrictId('');
      setAvailableUpazilas([]);
    }
  }, [selectedDivisionId]);

  // Update upazilas when district changes
  useEffect(() => {
    if (!selectedDistrictId) {
      setAvailableUpazilas([]);
      return;
    }

    const upazilas = getUpazilasByDistrictId(selectedDistrictId);
    setAvailableUpazilas(upazilas);

    // Get current district object to sync name with parent
    const currentDist = availableDistricts.find(d => d.id === selectedDistrictId);
    const divObj = allDivisions.find(d => d.id === selectedDivisionId);

    if (currentDist) {
      // If thana not valid in new upazilas, default to first
      const firstUpazilaName = upazilas.length > 0 ? upazilas[0].name : '';
      const isThanaValid = upazilas.some(u => u.name.toLowerCase() === (value.thana || '').toLowerCase());
      
      onChange({
        ...value,
        division: divObj?.name || 'Dhaka',
        district: currentDist.name,
        thana: isThanaValid ? value.thana : firstUpazilaName
      });
    }
  }, [selectedDistrictId]);

  const handleDivisionChange = (divId: string) => {
    setSelectedDivisionId(divId);
  };

  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
  };

  const handleUpazilaChange = (upazilaName: string) => {
    onChange({
      ...value,
      thana: upazilaName
    });
  };

  const handleAddressLineChange = (line: string) => {
    onChange({
      ...value,
      addressLine: line
    });
  };

  return (
    <div className={styles.addressContainer}>
      <div className={styles.addressHeader}>
        <div className={styles.headerIconBox}>
          <MapPin size={15} />
        </div>
        <div className={styles.headerTitle}>
          <span>{label}</span>
          {required && <span className={styles.requiredStar}>*</span>}
        </div>
      </div>

      {/* Cascading 3-Column Dropdowns: Division ➔ District ➔ Upazila */}
      <div className={styles.gridCascade}>
        <div className={styles.fieldWrapper}>
          <label className={styles.fieldLabel}>
            <span>Division</span>
          </label>
          <CustomSelect
            options={allDivisions.map(div => ({ value: div.id, label: div.name }))}
            value={selectedDivisionId}
            onChange={handleDivisionChange}
            variant="form"
            fullWidth
          />
        </div>

        <div className={styles.fieldWrapper}>
          <label className={styles.fieldLabel}>
            <span>District</span>
          </label>
          <CustomSelect
            options={availableDistricts.map(dist => ({ value: dist.id, label: dist.name }))}
            value={selectedDistrictId}
            onChange={handleDistrictChange}
            variant="form"
            fullWidth
          />
        </div>

        <div className={styles.fieldWrapper}>
          <label className={styles.fieldLabel}>
            <span>Thana / Upazila</span>
          </label>
          <CustomSelect
            options={availableUpazilas.map(upz => ({ value: upz.name, label: upz.name }))}
            value={value.thana || (availableUpazilas[0]?.name || '')}
            onChange={handleUpazilaChange}
            variant="form"
            fullWidth
          />
        </div>
      </div>

      {/* Detailed Address Line */}
      <div className={styles.fieldWrapper}>
        <label className={styles.fieldLabel}>
          <span>Street Address / House / Postcode</span>
        </label>
        <input 
          type="text" 
          className={styles.detailInput}
          placeholder="House no, road, area, village, or postal code..."
          value={value.addressLine || ''}
          onChange={e => handleAddressLineChange(e.target.value)}
        />
      </div>
    </div>
  );
}

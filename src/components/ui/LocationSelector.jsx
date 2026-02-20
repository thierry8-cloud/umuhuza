import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LOCATIONS } from '@/components/data/locations';

export default function LocationSelector({ 
  province, 
  district, 
  sector, 
  onProvinceChange, 
  onDistrictChange, 
  onSectorChange,
  required = false 
}) {
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    if (province && LOCATIONS[province]) {
      setDistricts(Object.keys(LOCATIONS[province]));
    } else {
      setDistricts([]);
    }
    onDistrictChange && onDistrictChange('');
    onSectorChange && onSectorChange('');
  }, [province]);

  useEffect(() => {
    if (province && district && LOCATIONS[province]?.[district]) {
      setSectors(LOCATIONS[province][district]);
    } else {
      setSectors([]);
    }
    onSectorChange && onSectorChange('');
  }, [district, province]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>Intara / Province {required && <span className="text-red-500">*</span>}</Label>
        <Select value={province} onValueChange={onProvinceChange}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Hitamo intara" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(LOCATIONS).map((prov) => (
              <SelectItem key={prov} value={prov}>{prov}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Akarere / District {required && <span className="text-red-500">*</span>}</Label>
        <Select value={district} onValueChange={onDistrictChange} disabled={!province}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Hitamo akarere" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((dist) => (
              <SelectItem key={dist} value={dist}>{dist}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Umurenge / Sector {required && <span className="text-red-500">*</span>}</Label>
        <Select value={sector} onValueChange={onSectorChange} disabled={!district}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Hitamo umurenge" />
          </SelectTrigger>
          <SelectContent>
            {sectors.map((sec) => (
              <SelectItem key={sec} value={sec}>{sec}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
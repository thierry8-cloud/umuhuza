import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const VEHICLE_MAKES = ['Toyota', 'Honda', 'Nissan', 'Mercedes-Benz', 'BMW', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Mitsubishi', 'Suzuki', 'Ford', 'Chevrolet', 'Jeep', 'Land Rover', 'Isuzu'];

export default function VehicleFilters({ filters, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm text-gray-600">Ubwoko bw'imodoka</Label>
        <Select value={filters.make || ''} onValueChange={(v) => handleChange('make', v)}>
          <SelectTrigger className="bg-white mt-1">
            <SelectValue placeholder="Hitamo ubwoko" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Byose</SelectItem>
            {VEHICLE_MAKES.map(make => (
              <SelectItem key={make} value={make}>{make}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm text-gray-600">Model</Label>
        <Input
          placeholder="e.g. RAV4, Civic"
          value={filters.model || ''}
          onChange={(e) => handleChange('model', e.target.value)}
          className="bg-white mt-1"
        />
      </div>

      <div>
        <Label className="text-sm text-gray-600">Umwaka</Label>
        <div className="flex gap-2 mt-1">
          <Select value={filters.minYear || ''} onValueChange={(v) => handleChange('minYear', v)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Kuva" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Byose</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.maxYear || ''} onValueChange={(v) => handleChange('maxYear', v)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Kugeza" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Byose</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-sm text-gray-600">Kilometre</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="number"
            placeholder="Min km"
            value={filters.minMileage || ''}
            onChange={(e) => handleChange('minMileage', e.target.value)}
            className="bg-white"
          />
          <Input
            type="number"
            placeholder="Max km"
            value={filters.maxMileage || ''}
            onChange={(e) => handleChange('maxMileage', e.target.value)}
            className="bg-white"
          />
        </div>
      </div>
    </div>
  );
}
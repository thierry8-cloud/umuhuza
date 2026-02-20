import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RealEstateFilters({ filters, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm text-gray-600">Ibyumba byo kuryamamo</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minBedrooms || ''}
            onChange={(e) => handleChange('minBedrooms', e.target.value)}
            className="bg-white"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxBedrooms || ''}
            onChange={(e) => handleChange('maxBedrooms', e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm text-gray-600">Ibyumba by'amazi</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minBathrooms || ''}
            onChange={(e) => handleChange('minBathrooms', e.target.value)}
            className="bg-white"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxBathrooms || ''}
            onChange={(e) => handleChange('maxBathrooms', e.target.value)}
            className="bg-white"
          />
        </div>
      </div>
    </div>
  );
}
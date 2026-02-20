import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CapacityFilters({ filters, onChange, category }) {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const capacityUnits = category === 'construction' 
    ? ['tons', 'cubic meters', 'horsepower', 'kW']
    : ['abantu', 'intebe', 'ameza'];

  const capacityLabel = category === 'construction' 
    ? 'Ubushobozi (Capacity)'
    : 'Ubushobozi (Abantu/Intebe)';

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm text-gray-600">{capacityLabel}</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minCapacity || ''}
            onChange={(e) => handleChange('minCapacity', e.target.value)}
            className="bg-white"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxCapacity || ''}
            onChange={(e) => handleChange('maxCapacity', e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm text-gray-600">Igipimo</Label>
        <Select value={filters.capacityUnit || ''} onValueChange={(v) => handleChange('capacityUnit', v)}>
          <SelectTrigger className="bg-white mt-1">
            <SelectValue placeholder="Hitamo igipimo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Byose</SelectItem>
            {capacityUnits.map(unit => (
              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
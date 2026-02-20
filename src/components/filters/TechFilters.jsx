import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PROCESSORS = ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'Apple M1', 'Apple M2', 'Apple M3', 'Snapdragon'];
const RAM_OPTIONS = [4, 8, 16, 32, 64, 128];
const STORAGE_OPTIONS = [64, 128, 256, 512, 1000, 2000];

export default function TechFilters({ filters, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm text-gray-600">RAM (GB)</Label>
        <div className="flex gap-2 mt-1">
          <Select value={filters.minRam || ''} onValueChange={(v) => handleChange('minRam', v)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Byose</SelectItem>
              {RAM_OPTIONS.map(ram => (
                <SelectItem key={ram} value={ram.toString()}>{ram} GB</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.maxRam || ''} onValueChange={(v) => handleChange('maxRam', v)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Max" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Byose</SelectItem>
              {RAM_OPTIONS.map(ram => (
                <SelectItem key={ram} value={ram.toString()}>{ram} GB</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-sm text-gray-600">Storage (GB)</Label>
        <div className="flex gap-2 mt-1">
          <Select value={filters.minStorage || ''} onValueChange={(v) => handleChange('minStorage', v)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Byose</SelectItem>
              {STORAGE_OPTIONS.map(storage => (
                <SelectItem key={storage} value={storage.toString()}>
                  {storage >= 1000 ? `${storage/1000} TB` : `${storage} GB`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.maxStorage || ''} onValueChange={(v) => handleChange('maxStorage', v)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Max" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Byose</SelectItem>
              {STORAGE_OPTIONS.map(storage => (
                <SelectItem key={storage} value={storage.toString()}>
                  {storage >= 1000 ? `${storage/1000} TB` : `${storage} GB`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-sm text-gray-600">Processor</Label>
        <Select value={filters.processor || ''} onValueChange={(v) => handleChange('processor', v)}>
          <SelectTrigger className="bg-white mt-1">
            <SelectValue placeholder="Hitamo processor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Byose</SelectItem>
            {PROCESSORS.map(proc => (
              <SelectItem key={proc} value={proc}>{proc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
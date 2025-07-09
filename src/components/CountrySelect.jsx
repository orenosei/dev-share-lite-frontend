'use client';

import React from 'react';
import countries from 'world-countries';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const CountrySelect = ({ value, onChange, className, placeholder, ...props }) => {
  // Sort countries by name
  const sortedCountries = countries
    .map(country => ({
      code: country.cca2,
      name: country.name.common,
      flag: country.flag
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Select value={value || ''} onValueChange={onChange} {...props}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder || 'Select country'} />
      </SelectTrigger>
      <SelectContent className="max-h-[200px] overflow-y-auto">
        {sortedCountries.map((country) => (
          <SelectItem key={country.code} value={country.name}>
            {country.flag} {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CountrySelect;

'use client';

import React from 'react';
import countries from 'world-countries';

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
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
      {...props}
    >
      <option value="">{placeholder || 'Select country'}</option>
      {sortedCountries.map((country) => (
        <option key={country.code} value={country.name}>
          {country.flag} {country.name}
        </option>
      ))}
    </select>
  );
};

export default CountrySelect;

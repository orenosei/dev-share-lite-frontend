'use client';

import React from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const PhoneNumberInput = ({ value, onChange, className, placeholder, ...props }) => {
  return (
    <div className={className}>
      <PhoneInput
        international
        countryCallingCodeEditable={false}
        defaultCountry="VN"
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Enter phone number"}
        className="phone-input"
        style={{
          '--PhoneInputCountryFlag-height': '1em',
          '--PhoneInputCountrySelectArrow-color': '#6b7280',
        }}
        {...props}
      />
      <style jsx global>{`
        .phone-input .PhoneInputInput {
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          width: 100%;
          outline: none;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          background: white;
          color: #111827;
        }
        
        .dark .phone-input .PhoneInputInput {
          border-color: #4b5563;
          background: #374151;
          color: #f9fafb;
        }
        
        .phone-input .PhoneInputInput:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .dark .phone-input .PhoneInputInput:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.2);
        }
        
        .phone-input .PhoneInputCountrySelect {
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          margin-right: 0.5rem;
          padding: 0.5rem;
          background: white;
          color: #111827;
        }
        
        .dark .phone-input .PhoneInputCountrySelect {
          border-color: #4b5563;
          background: #374151;
          color: #f9fafb;
        }
        
        .phone-input .PhoneInputCountrySelect:focus {
          border-color: #6366f1;
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .dark .phone-input .PhoneInputCountrySelect:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.2);
        }
        
        .phone-input {
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default PhoneNumberInput;

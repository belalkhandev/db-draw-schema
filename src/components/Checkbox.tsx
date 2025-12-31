import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  className = '',
  ...props
}) => {
  return (
    <label className="flex items-center space-x-3 cursor-pointer group">
      <input
        type="checkbox"
        className={`w-4 h-4 text-blue-600 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200 cursor-pointer ${className}`}
        {...props}
      />
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200">{label}</span>
    </label>
  );
};

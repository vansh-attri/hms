'use client';

import React from 'react';

// Button
interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
}) => {
  const base = 'font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
  } as const;
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-base', lg: 'px-6 py-3 text-lg' } as const;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant ?? 'primary']} ${sizes[size ?? 'md']} ${className}`}
    >
      {children}
    </button>
  );
};

// Card
interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, className = '' }) => (
  <div className={`bg-white/90 backdrop-blur rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

// Form fields
interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  labelSrOnly?: boolean;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  helpText,
  labelSrOnly = false,
  className = '',
}) => (
  <div className={`mb-4 ${className}`}>
    <label htmlFor={name} className={`block text-sm font-medium text-gray-700 mb-2 ${labelSrOnly ? 'sr-only' : ''}`}>
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 rounded-md shadow-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
        error ? 'border-red-500 focus:ring-red-500 border-2' : 'border border-gray-300 focus:ring-blue-500 focus:border-blue-500'
      }`}
      required={required}
    />
    {helpText && !error && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

interface SelectFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string | number; label: string }[];
  error?: string;
  required?: boolean;
  helpText?: string;
  labelSrOnly?: boolean;
  className?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  helpText,
  labelSrOnly = false,
  className = '',
}) => (
  <div className={`mb-4 ${className}`}>
    <label htmlFor={name} className={`block text-sm font-medium text-gray-700 mb-2 ${labelSrOnly ? 'sr-only' : ''}`}>
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 rounded-md shadow-sm text-black focus:outline-none focus:ring-2 ${
        error ? 'border-red-500 focus:ring-red-500 border-2' : 'border border-gray-300 focus:ring-blue-500 focus:border-blue-500'
      }`}
      required={required}
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {helpText && !error && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

interface TextAreaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  helpText?: string;
  labelSrOnly?: boolean;
  className?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  rows = 3,
  helpText,
  labelSrOnly = false,
  className = '',
}) => (
  <div className={`mb-4 ${className}`}>
    <label htmlFor={name} className={`block text-sm font-medium text-gray-700 mb-2 ${labelSrOnly ? 'sr-only' : ''}`}>
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 resize-y text-black ${
        error ? 'border-red-500 focus:ring-red-500 border-2' : 'border border-gray-300 focus:ring-blue-500 focus:border-blue-500'
      }`}
      required={required}
    />
    {helpText && !error && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

// Checkbox Field
interface CheckboxFieldProps {
  label: string | React.ReactNode;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helpText?: string;
  className?: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  name,
  checked,
  onChange,
  helpText,
  className = '',
}) => (
  <div className={`mb-4 ${className}`}>
    <label className="flex items-start gap-3 text-sm text-gray-700">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span>{label}</span>
    </label>
    {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
  </div>
);

// Layout helpers
export const FormGrid: React.FC<{
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}> = ({ children, cols = 2, className = '' }) => {
  const map: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  return <div className={`grid ${map[cols]} gap-4 ${className}`}>{children}</div>;
};

export const FormSection: React.FC<{ title?: string; description?: string; children: React.ReactNode; className?: string }>
  = ({ title, description, children, className = '' }) => (
  <section className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 ${className}`}>
    {(title || description) && (
      <header className="mb-3">
        {title && <h2 className="text-base font-semibold text-gray-900">{title}</h2>}
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </header>
    )}
    {children}
  </section>
);


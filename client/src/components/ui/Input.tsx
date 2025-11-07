import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string };

export default function Input({ label, ...props }: Props) {
  return (
    <label className="block space-y-1">
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <input {...props} className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${props.className || ''}`} />
    </label>
  );
}

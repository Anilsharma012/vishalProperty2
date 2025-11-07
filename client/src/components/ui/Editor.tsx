import React, { useRef, useEffect } from 'react';

type Props = { value: string; onChange: (v: string) => void };

export default function Editor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value; }, [value]);
  return (
    <div
      ref={ref}
      className="min-h-[150px] border rounded p-2"
      contentEditable
      onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
    />
  );
}

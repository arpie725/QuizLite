'use client';
import { useState } from 'react';

interface IToggleSwitchProps {
  onChange?: (value: boolean) => void;
  defaultChecked?: boolean;
}

const ToggleSwitch = ({ onChange, defaultChecked }: IToggleSwitchProps) => {
  const [isChecked, setIsChecked] = useState<boolean>(defaultChecked ?? false);
  const handleCheckboxChange = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    onChange?.(newCheckedState);
  };

  return (
    <>
      <label className='flex cursor-pointer select-none items-center'>
        <div className='relative'>
          <input
            type='checkbox'
            checked={isChecked}
            onChange={handleCheckboxChange}
            className='sr-only'
          />
          <div
            className={`box block h-8 w-14 rounded-full ${
              isChecked ? 'bg-cyan-500' : 'bg-cyan-500/70'
            }`}
          />
          <div
            className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full transition ${
              isChecked ? 'bg-white' : 'translate-x-full bg-white/70'
            }`}
          />
        </div>
      </label>
    </>
  );
};

export default ToggleSwitch;

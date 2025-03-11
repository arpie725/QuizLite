import { DisplayCard } from '@/components/DisplayCard';
import Set from '@/models/Set';
import { twMerge } from 'tailwind-merge';
import { PopupConfirmation } from './PopupConfirmation';
import { useEffect, useRef } from 'react';
import ToggleSwitch from '@/components/ui/toggle-switch';

interface NewSetCardProps {
  newTitle: string;
  isPublic: boolean;
  newSetError: string | null;
  onTitleChange: (title: string) => void;
  onPublicToggle: () => void;
  onCreate: () => void;
  onCancel: () => void;
}

export const NewSetCard = ({
  newTitle,
  isPublic,
  newSetError,
  onTitleChange,
  onPublicToggle,
  onCreate,
  onCancel,
}: NewSetCardProps) => {
  const newSetRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newSetRef.current) {
      newSetRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      const timer = setTimeout(() => {
        newSetRef.current?.focus();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <DisplayCard className='border-2 border-lime-500/50 animate-breathe-border-lime'>
      <div>
        {/* ispublic toggle switch */}
        <div className='p-2 flex justify-end items-center gap-4'>
          <p className='font-geist text-zinc-300'>
            {isPublic ? 'public' : 'private'}
          </p>
          <ToggleSwitch onChange={onPublicToggle} />
        </div>
        {/* input for set title */}
        <div className='absolute-center w-full px-4'>
          <input
            ref={newSetRef}
            className='w-full bg-zinc-200 rounded outline-none focus:outline focus:outline-fuchsia-500/50 caret-black text-zinc-700 font-mono font-semibold placeholder-zinc-500 p-2 text-xl'
            value={newTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder='Title...'
          />
          <p className='mt-2 font-geist text-red-500 text-center h-4'>
            {newSetError}
          </p>
        </div>
        {/* cancel and save options */}
        <div className='w-full px-4 absolute bottom-1 flex justify-between py-4 gap-4 transition duration-500 opacity-100 pointer-events-auto'>
          <button
            onClick={onCancel}
            className='flex justify-center items-center px-2 py-1 rounded bg-zinc-500 font-semibold font-geist text-red-500 text-xl transition-opacity hover:opacity-80'
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            className='flex justify-center items-center px-2 py-1 rounded bg-zinc-500 font-semibold font-geist text-green-500 text-xl transition-opacity hover:opacity-80'
          >
            Create
          </button>
        </div>
      </div>
    </DisplayCard>
  );
};

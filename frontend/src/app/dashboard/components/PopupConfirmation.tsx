import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { useState } from 'react';

// source: https://headlessui.com/react/dialog 

interface PopupConfirmationProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  setId: number;
}

export const PopupConfirmation = ({
  isOpen,
  setIsOpen,
  title,
  setId,
}: PopupConfirmationProps) => {
  // create a function that makes API call to delete the setId
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className='relative z-50'
    >
      <div className='fixed inset-0 flex w-screen items-center justify-center p-4 font-geist'>
        <DialogPanel className='max-w-lg space-y-4 rounded-2xl border-2 bg-zinc-500 px-12 py-6'>
          <DialogTitle className='font-bold font-geist text-2xl border-b border-zinc-400'>
            Delete study set
          </DialogTitle>
          <Description className='text-zinc-200 font-sans'>
            This will{' '}
            <span className='font-sans text-red-500 text-xl'>permanently</span>{' '}
            delete your study set
          </Description>
          <p className='text-zinc-200 font-sans'>
            Are you sure you want to delete '
            <span className='text-lime-500 text-lg font-bold '>{title}</span>
            '?
          </p>
          <div className='flex gap-4 text-2xl justify-between'>
            <button
              className='hover:underline'
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              className='text-red-500 hover:underline'
              onClick={() => setIsOpen(false)}
            >
              Delete
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

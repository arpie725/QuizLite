import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert, CirclePlus, PlusIcon } from 'lucide-react';
import { IconPlus } from '@tabler/icons-react';
import axios from 'axios';

import { cn } from '@/lib/utils';
import Tag from '@/models/Tag';
import Set from '@/models/Set';
import TagData from '@/models/TagData';
import { twMerge } from 'tailwind-merge';
import { setDefaultAutoSelectFamily } from 'net';

interface ModalProps {
  modalSize?: 'sm' | 'lg';
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  handleSubmit: (copiedTitle: string) => void;
  set: Set;
  copyingError: string | null;
  setCopyingError: (value: string | null) => void;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function copySetModal({
  modalSize = 'lg',
  isOpen,
  setIsOpen,
  handleSubmit,
  set,
  copyingError,
  setCopyingError,
}: ModalProps) {
  const [newCopyTitle, setNewCopyTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNewCopyTitle('Copy of ' + set.title);
  }, []);

  return (
    <div>
      <AnimatePresence>
        {isOpen && (
          <div className='fixed inset-0 z-50 flex cursor-pointer items-center justify-center overflow-y-scroll bg-slate-900/20 p-8 backdrop-blur'>
            <motion.div
              initial={{ scale: 0, rotate: '180deg' }}
              animate={{
                scale: 1,
                rotate: '0deg',
                transition: {
                  type: 'spring',
                  bounce: 0.25,
                },
              }}
              exit={{ scale: 0, rotate: '180deg' }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'relative w-full max-w-lg cursor-default overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 p-6 text-white shadow-2xl',
                {
                  'max-w-sm': modalSize === 'sm',
                }
              )}
            >
              <div className='flex flex-col gap-3'>
                <div className='flex flex-col gap-2'>
                  <div className='flex items-center gap-4'>
                    <h1 className='font-geist text-xl'>New Title:</h1>
                    <p className='font-sans text-red-500 font-bold text-xl'>
                      {copyingError}
                    </p>
                  </div>
                  <input
                    value={newCopyTitle}
                    onChange={(e) => setNewCopyTitle(e.target.value)}
                    placeholder='New Title...'
                    className='user-input-text-light user-input-bg-light'
                  />
                </div>
                <div className='flex gap-2 font-mono'>
                  <button
                    onClick={() => {
                      setCopyingError(null);
                      setNewCopyTitle('Copy of ' + set.title);
                      setIsOpen(false);
                    }}
                    className='border border-dashed w-full rounded bg-transparent py-2 font-semibold text-white text-xl transition-colors hover:bg-white/30'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmit(newCopyTitle)}
                    className='w-full rounded bg-white py-2 font-semibold text-indigo-600 text-xl transition-opacity hover:opacity-80'
                  >
                    Create Copy
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

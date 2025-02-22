import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert, CirclePlus, PencilIcon, PlusIcon } from 'lucide-react';
import { IconPlus } from '@tabler/icons-react';
import axios from 'axios';

import { cn } from '@/lib/utils';
import Tag from '@/models/Tag';
import Card from '@/models/Card';
import TagData from '@/models/TagData';
import { twMerge } from 'tailwind-merge';
import { setDefaultAutoSelectFamily } from 'net';

interface ModalProps {
  modalSize?: 'sm' | 'lg';
  isOpen: boolean;
  card: Card;
  setIsOpen: (value: boolean) => void;
  handleSubmit: () => void;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function EditQAModal({
  modalSize = 'lg',
  isOpen,
  card,
  setIsOpen,
  handleSubmit,
}: ModalProps) {
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [curCard, setCurCard] = useState<Card>();
  const [refetch, setRefetch] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setCurCard(card);
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
  }, [refetch, isOpen]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    // make API call to save the tags to the current set
    // close the modal
  };

  return (
    <div className=''>
      <AnimatePresence>
        {isOpen && (
          <div
            onDoubleClick={() => setIsOpen(false)}
            className='fixed rounded-xl inset-0 z-50 flex cursor-pointer items-center justify-center overflow-y-hidden bg-slate-900/20 p-8 backdrop-blur'
          >
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
              <div className='absolute top-0 right-2'>
                {/* save / cancel buttons */}
                <div className='flex gap-4 text-lg'>
                  <button
                    className='font-geist text-zinc-300 hover:text-zinc-100 transition duration-150'
                    onClick={() => {
                      console.log('TODO: update the question / answer');
                    }}
                  >
                    save
                  </button>
                  <button
                    className='font-geist text-zinc-300 hover:text-zinc-100 transition duration-150'
                    onClick={() => {
                      console.log('TODO: close the modal (nothing happens)');
                      setIsOpen(false);
                    }}
                  >
                    cancel
                  </button>
                </div>
              </div>
              <div className='flex flex-col gap-3'>
                <div className='flex items-center justify-start gap-4'>
                  <PencilIcon className='text-white size-6' />
                  <h3 className='text-lg font-geist font-bold'>
                    Editing Question / Answer
                  </h3>
                </div>
                <div className='flex flex-col'>
                  {/* update question and answer */}
                  <div className='flex-col items-center'>
                    <h1 className='font-geist text-xl font-bold text-zinc-300'>
                      question
                    </h1>
                    <textarea
                      value={editQuestion}
                      placeholder={'edit question...'}
                      className='caret-black text-zinc-700 font-mono font-semibold user-input-bg-light h-18 w-full resize-none overflow-hidden'
                      onChange={(e) => setEditQuestion(e.target.value)}
                    />
                  </div>
                  <div className='flex-col items-center'>
                    <h1 className='font-geist text-xl font-bold text-zinc-300'>
                      answer
                    </h1>
                    <textarea
                      value={editAnswer}
                      placeholder={'edit answer...'}
                      className='caret-black text-zinc-700 font-mono font-semibold user-input-bg-light h-24 w-full resize-none overflow-hidden'
                      onChange={(e) => setEditAnswer(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

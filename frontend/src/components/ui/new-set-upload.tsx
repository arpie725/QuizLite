import { cn } from '@/lib/utils';
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { IconPlus } from '@tabler/icons-react';

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const NewSetUpload = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children?: React.ReactNode;
}) => {
  return (
    <div className='w-full'>
      <motion.div
        onClick={onClick} // Call the onClick prop when clicked
        whileHover='animate'
        className='p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden'
      >
        <div className='flex flex-col items-center justify-center'>
          {children ? ( // Render children if provided
            children
          ) : (
            // Default button content
            <>
              <p className='relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base'>
                Create a Study Set
              </p>
              <p className='mb-6 relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2'>
                Click to create your first study set!
              </p>
              <motion.div
                layoutId='file-upload'
                variants={mainVariant}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  'mb-6 relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md',
                  'shadow-[0px_10px_50px_rgba(0,0,0,0.1)]'
                )}
              >
                <IconPlus className='h-4 w-4 text-neutral-600 dark:text-neutral-300' />
              </motion.div>
              {/* Default Icon */}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

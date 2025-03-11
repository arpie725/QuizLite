import { DisplayCard } from '@/components/DisplayCard';
import Set from '@/models/Set';
import { twMerge } from 'tailwind-merge';
import { PopupConfirmation } from './PopupConfirmation';
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface SetCardProps {
  set: Set;
  title: string;
  isEditing: boolean;
  editingSetId: number;
  deletingSetId: number;
  setDeletingSetId: (setId: number) => void;
  isPopupOpen: boolean;
  onRename: (setId: number, setTitle: string) => void;
  onDelete: (setId: number) => void;
  onEditStart: (setId: number, title: string) => void;
  onEditEnd: () => void;
  setIsPopupOpen: (isOpen: boolean) => void;
  onFavoriteToggle: (setId: number, isFavorite: boolean) => void;
  onTitleChange: (title: string) => void;
  onNavigate: (setId: number) => void;
  editingSetError: string | null;
  setEditingSetError: (text: string | null) => void;
}

export const SetCard = ({
  set,
  title,
  isEditing,
  editingSetId,
  deletingSetId,
  setDeletingSetId,
  isPopupOpen,
  onRename,
  onEditStart,
  onEditEnd,
  setIsPopupOpen,
  onFavoriteToggle,
  onTitleChange,
  onNavigate,
  onDelete,
  editingSetError,
  setEditingSetError,
}: SetCardProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const h3Ref = useRef<HTMLHeadingElement>(null);

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTitleChange(e.target.value);
    setEditingSetError(null);
    resizeTextArea();
  };

  const resizeTextArea = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onRename(set.id, set.title);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onTitleChange(set.title);
      onEditEnd();
    }
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      const textLength = textarea.value.length;
      textarea.focus();
      textarea.setSelectionRange(textLength, textLength);
      resizeTextArea();
      setTimeout(() => {
        textarea.scrollTop = textarea.scrollHeight;
      }, 0);
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing && h3Ref.current) {
      const h3ref = h3Ref.current;
      setTimeout(() => {
        h3ref.scrollTop = 0;
      }, 0);
    }
  }, [isEditing, title]);

  useEffect(() => {
    resizeTextArea();
  }, [title]);

  const handleDoneClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isEditing) {
      if (title.trim() === '') {
        onTitleChange(set.title); // Revert to original title if empty
        onEditEnd(); // Exit editing mode
      } else {
        onRename(set.id, set.title); // Proceed with rename
      }
    } else {
      onEditStart(set.id, set.title); // Start editing
    }
  };

  return (
    <DisplayCard
      key={set.id}
      className={twMerge(
        !isEditing &&
          'hover:bg-zinc-600 hover:border-fuchsia-500/50 transition duration:250',
        isEditing &&
          editingSetId == set.id &&
          'bg-zinc-600 border-fuchsia-500/50 animate-breathe-border-fuchsia'
      )}
    >
      {deletingSetId === set.id && (
        <PopupConfirmation
          key={set.id}
          isOpen={isPopupOpen}
          setIsOpen={setIsPopupOpen}
          title={set.title}
          setId={set.id}
          onSetDeleted={() => {
            onDelete(set.id);
            setIsPopupOpen(false);
          }}
        />
      )}
      <div className='absolute top-2 left-2'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 -960 960 960'
          width='32'
          // use twMerge
          // later, you set the fill color based on the set.isFavorite ? fill-yellow-200 hover:fill-zinc-400 : fill-zinc-400 hover:fill-yellow-200
          className={twMerge(
            'transition duration-150 cursor-pointer',
            set.isFavorite
              ? 'fill-yellow-200 hover:fill-zinc-400'
              : 'fill-zinc-400 hover:fill-yellow-200'
          )}
          onClick={() => onFavoriteToggle(set.id, set.isFavorite)}
        >
          <path d='m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z' />
        </svg>
      </div>
      <div className='flex-grow flex justify-center items-center mx-2'>
        {isEditing && editingSetId === set.id ? (
          <div className='flex flex-col'>
            <textarea
              ref={textareaRef}
              value={title}
              spellCheck='false'
              onChange={handleTextAreaChange}
              onKeyDown={handleKeyDown}
              className='flex font-set-title caret-white text-center resize-none focus:outline-none focus:ring-0 transition duration-150 bg-transparent overflow-hidden w-full h-auto max-h-40'
            />
            <AnimatePresence>
              {editingSetError && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className='mt-2 font-geist text-red-500 text-center text-sm font-bold'
                >
                  {editingSetError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <h3
            ref={h3Ref}
            className='flex justify-center font-set-title text-center overflow-hidden break-words w-full h-auto max-h-40 hover:underline transition duration-150 cursor-pointer'
            onClick={() => onNavigate(set.id)}
          >
            {set.title}
          </h3>
        )}
      </div>

      <div
        className={twMerge(
          'invisible flex w-5/6 justify-between self-end mx-auto mb-4 transition duration-150',
          isEditing && editingSetId === set.id && 'visible',
          !isEditing && 'group-hover:visible'
        )}
      >
        <button
          className={twMerge(
            'hover:underline font-geist text-xl',
            isEditing ? 'text-lime-500' : 'text-orange-500'
          )}
          onClick={handleDoneClick}
        >
          {isEditing ? 'Done' : 'Rename'}
        </button>
        <button
          className='text-red-500 hover:underline font-geist text-xl'
          onClick={(e) => {
            e.stopPropagation();
            isEditing
              ? (onTitleChange(''),
                textareaRef.current && textareaRef.current.focus(),
                setEditingSetError(null))
              : (setIsPopupOpen(true), setDeletingSetId(set.id));
          }}
        >
          {isEditing ? 'Clear' : 'Delete'}
        </button>
      </div>
    </DisplayCard>
  );
};

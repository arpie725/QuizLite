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
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  set: Set;
  setIsOpen: (value: boolean) => void;
  handleSubmit: () => void;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const token = localStorage.getItem('token');

export default function Modal({
  modalSize = 'lg',
  isOpen,
  tags,
  set,
  setTags,
  setIsOpen,
  handleSubmit,
}: ModalProps) {
  const [newTagInput, setNewTagInput] = useState('');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [refetch, setRefetch] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    // get all the tags from the user
    const fetchAllTags = async () => {
      setLoading(true);
      try {
        const { data: res } = await axios.get(`${apiUrl}/user/tags`, {
          headers: {
            Authorization: token,
          },
        });
        const tags_: Tag[] = res.data.tags;
        const alltags = tags_.map((tagData: TagData) => new Tag(tagData));
        alltags.sort((a, b) => {
          const ac = tags.some((tag) => tag.id === a.id);
          const bc = tags.some((tag) => tag.id === b.id);
          if (ac && !bc) return -1;
          if (!ac && bc) return 1;
          return b.id - a.id;
        });
        setAllTags(alltags);
      } catch (er) {
        console.log('ERROR fetching all tags: ', er);
      } finally {
        setLoading(false);
      }
    };
    fetchAllTags();
  }, [refetch, isOpen]);

  const handleCheckboxChange = async (id: number, checked: boolean) => {
    if (checked) {
      const tagToAdd = allTags.find((tag) => tag.id === id);
      if (tagToAdd) {
        const newTags = [...tags, tagToAdd];
        setTags(newTags);
      }
    } else {
      const newTags = tags.filter((tag) => tag.id !== id);
      setTags(newTags);
    }
  };

  const handleSave = async () => {
    // make API call to save the tags to the current set
    // close the modal
    try {
      await axios.post(
        `${apiUrl}/study-set/${set.id}/update-tags`,
        { tags },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      setIsOpen(false);
    } catch (er) {
      console.log('ERROR saving tagIds to set: ', er);
    }
  };

  const handleNewTag = async () => {
    // make API call to create a new tag
    // make sure the name is unique!
    try {
      const trimmedInput = newTagInput.trim();
      const existingTag = allTags.find(
        (tag) => tag.name.toLowerCase() === trimmedInput.toLowerCase()
      );
      if (existingTag) {
        // if already exists, just add the tag to the tags list
        if (
          !tags.some(
            (tag) => tag.name.toLowerCase() === trimmedInput.toLowerCase()
          )
        ) {
          setTags([...tags, existingTag]);
        }
        // clear the input
        setNewTagInput('');
        throw new Error('Tag already exists');
      }
      // make api call to add this tag
      const { data: res } = await axios.post(
        `${apiUrl}/tag/`,
        { name: trimmedInput },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      // add this new Tag to the tags array
      const newTag = res.data.tag;
      setTags([...tags, newTag]);
      setRefetch(refetch * -1);
      // clear the input
      setNewTagInput('');
    } catch (er) {
      console.log('ERROR creating a new tag: ', er);
    }
  };

  return (
    <div>
      <IconPlus
        className='size-4 text-extrabold text-fuchsia-500 group-hover:text-fuchsia-400 transition duration-150'
        onClick={() => setIsOpen(true)}
      />

      <AnimatePresence>
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            className='fixed inset-0 z-50 flex cursor-pointer items-center justify-center overflow-y-scroll bg-slate-900/20 p-8 backdrop-blur'
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
              <div className='flex flex-col gap-3'>
                <div className='flex items-center justify-start gap-4'>
                  <CirclePlus
                    className='text-white'
                    size={48}
                  />
                  <h3 className='text-2xl'>
                    Updating{' '}
                    <span className='underline font-extrabold'>
                      {set?.title}
                    </span>{' '}
                    Tags
                  </h3>
                </div>
                <div className='mt-2 flex gap-4'>
                  <input
                    value={newTagInput}
                    placeholder={'new tag name...'}
                    className='user-input-text-light user-input-bg-light'
                    onChange={(e) => setNewTagInput(e.target.value)}
                  ></input>
                  <button
                    className='px-2 rounded bg-white font-semibold text-indigo-600 transition-opacity hover:opacity-80'
                    onClick={handleNewTag}
                  >
                    Create Tag
                  </button>
                </div>
                {/* Display all the user's tags and box the ones that are already used in this set */}
                <div className='border-t border-b max-h-48 overflow-scroll'>
                  {/* map over all the users' tags */}
                  {allTags.map(({ id, name }) => (
                    <label
                      key={id}
                      className='flex items-center'
                    >
                      <input
                        type='checkbox'
                        checked={tags.some((tag) => tag.id === id)}
                        className='mr-2 size-5 accent-fuchsia-500'
                        onChange={(e) =>
                          handleCheckboxChange(id, e.target.checked)
                        }
                      />
                      <span className='text-3xl font-geist text-white'>
                        {name}
                      </span>
                    </label>
                  ))}
                </div>

                <div className='flex gap-2'>
                  <button
                    onClick={() => setIsOpen(false)}
                    className='border border-dashed w-full rounded bg-transparent py-2 font-semibold text-white text-xl transition-colors hover:bg-white/30'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className='w-full rounded bg-white py-2 font-semibold text-indigo-600 text-xl transition-opacity hover:opacity-80'
                  >
                    Save
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

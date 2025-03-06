'use client';
import Card from '@/models/Card';
import CardData from '@/models/CardData';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Set from '@/models/Set';
import Tag from '@/models/Tag';
import TagData from '@/models/TagData';
import { TagComponent } from '@/components/Tag';
import { IconPencil, IconPlus } from '@tabler/icons-react';
import TagModal from '@/components/ui/tag-modal';
import CopySetModal from '@/components/ui/copy-set-modal';
import ToggleSwitch from '@/components/ui/toggle-switch';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const tagColors = [
  'cyan',
  'lime',
  'violet',
  'emarld',
  'indigo',
  'teal',
  'purple',
  'slate',
];

interface SetTitleTagsSectionProps {
  setId: number;
  isOwner: boolean;
  author?: string;
}

export const SetTitleTagsSection = ({
  setId,
  isOwner,
  author,
}: SetTitleTagsSectionProps) => {
  const router = useRouter();

  const [set, setSet] = useState<Set>();
  const [tags, setTags] = useState<Tag[]>([]);
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isCopyingSet, setIsCopyingSet] = useState(false);
  const [copyingError, setCopyingError] = useState<string | null>(null);
  const [existsError, setExistsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchTitle = async () => {
      setLoading(true);
      try {
        const { data: res } = await axios.get(
          `${apiUrl}/study-set/${setId}/cards`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        console.log(res);
        // get data from response
        const cardsArray = res.data.cards;
        const cards = cardsArray.map((card: CardData) => new Card(card));
        const cardcount = res.data.cardCount;
        const set = res.data.set;
        const title = set.title;
        const ispublic = set.isPublic;
        // set data into useState variables to be displayed onto the page
        setSet(set);
        setTitle(title);
        setIsPublic(ispublic);
      } catch (er) {
        console.log('Error fetching cards:', er);
        setError(`ERROR: ${(er as any).response.data.message}`);
      } finally {
        setLoading(false);
      }
    };
    const fetchTags = async () => {
      setLoading(true);
      try {
        const { data: res } = await axios.get(
          `${apiUrl}/study-set/${setId}/tags`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        const tagsData: TagData[] = res.data.set.tags;
        const tags = tagsData.map((tagData: TagData) => new Tag(tagData));
        setTags(tags);
      } catch (er) {
        console.log('Error fetching tags: ', er);
        setError(`Error: ${(er as any).response.data.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
    fetchTitle();
  }, []);

  const inputWidth = isEditingTitle
    ? undefined
    : `${spanRef.current?.offsetWidth}px`;

  const handleTitleEdit = async () => {
    // make API call to change the title of the set
    // if no change, just exit
    const token = localStorage.getItem('token');
    if (set && title.trim() === set.title) {
      setIsEditingTitle(false);
      return;
    }
    try {
      if (!set) {
        throw new Error('Set is undefined!');
      }
      const { data: res } = await axios.put(
        `${apiUrl}/study-set/${set.id}`,
        {
          title,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      const updatedSet = res.data.set;
      setSet(updatedSet);
      // set isEditing to false
      setIsEditingTitle(false);
      setExistsError(false);
    } catch (er) {
      console.log('ERROR updating title of the set ', er);
      if (
        axios.isAxiosError(er) &&
        er.response?.data.errorType === 'DuplicateEntryError'
      ) {
        setExistsError(true);
      } else {
        setIsEditingTitle(false);
        if (set) {
          setTitle(set.title);
        }
      }
    }
  };

  const togglePrivacy = async () => {
    const token = localStorage.getItem('token');
    try {
      if (!set) {
        throw new Error('Set is undefined!');
      }
      const newIsPublic = !isPublic;
      const { data: res } = await axios.put(
        `${apiUrl}/study-set/${set.id}`,
        {
          isPublic: newIsPublic,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      setIsPublic(newIsPublic);
      console.log(res);
    } catch (er) {
      console.log('ERROR toggling privacy of set: ', er);
    }
  };

  const handleCopySet = async (copiedTitle: string) => {
    const token = localStorage.getItem('token');
    // create a copy of this set to the user
    console.log('Create a copy with this title: ' + copiedTitle);

    try {
      const { data: res } = await axios.post(
        `${apiUrl}/study-set/copy/${setId}`,
        {
          title: copiedTitle,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(res);
      const new_setId = res.data.set.id;
      // close the modal
      setIsCopyingSet(false);
      // take the user to this newly created set
      router.push(`/set/${new_setId}`);
    } catch (er) {
      console.log('Error making copy of the set: ', er);
      if (axios.isAxiosError(er) && er.response) {
        setCopyingError(er.response.data.message);
      } else {
        setCopyingError('An unknown error occurred');
      }
    }
  };

  return (
    <section className='border border-dashed mt-24 '>
      <div className='border container'>
        {/* display all tags belonging to the current set */}
        <div className='flex justify-between'>
          <div className='flex flex-col gap-8'>
            <div className='left-2 top-2 relative'>
              <div className='flex gap-4'>
                <h1 className='text-zinc-300 font-sans font-bold text-xl'>
                  Tags:
                </h1>
                <div className='flex gap-2 justify-center items-center'>
                  {tags.map(({ id, name }) => (
                    <TagComponent
                      key={id}
                      color={tagColors.at(id % tagColors.length)}
                    >
                      {name}
                    </TagComponent>
                  ))}
                  {isOwner && (
                    <TagComponent
                      onClick={() => {
                        setIsAddingTag(true);
                      }}
                      className='cursor-pointer group'
                    >
                      {set && (
                        <TagModal
                          modalSize='lg'
                          isOpen={isAddingTag}
                          setIsOpen={setIsAddingTag}
                          handleSubmit={() => {}}
                          tags={tags}
                          setTags={setTags}
                          set={set}
                        />
                      )}
                      <span className='ml-2 hidden group-hover:inline transition duration-150'>
                        Add Tag
                      </span>
                    </TagComponent>
                  )}
                </div>
              </div>
            </div>
            <div className='flex'>
              <div className='flex gap-4 p-4'>
                <span
                  ref={spanRef}
                  className='absolute invisible font-sans text-5xl font-bold text-zinc-200 p-2'
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {title}
                </span>
                <input
                  ref={inputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  readOnly={!isEditingTitle}
                  className={twMerge(
                    'flex text-zinc-200 font-sans text-5xl p-2 font-bold transition duration-250',
                    isEditingTitle
                      ? 'bg-zinc-700 rounded px-2 outline-none focus:outline focus:outline-fuchsia-500/50'
                      : 'bg-transparent cursor-default outline-none p-2'
                  )}
                  style={!isEditingTitle ? { width: inputWidth } : undefined}
                />
                {!isEditingTitle && isOwner && (
                  <IconPencil
                    className='text-zinc-300 size-6 cursor-pointer hover:text-zinc-100 hover:rotate-2 hover:scale-125 transition duration-150'
                    onClick={() => {
                      setIsEditingTitle(true);
                      setTimeout(() => {
                        if (inputRef.current) {
                          inputRef.current.focus();
                        }
                      });
                    }}
                  />
                )}
                {isEditingTitle && (
                  <div className='flex py-4 justify-center items-center'>
                    <button
                      onClick={handleTitleEdit}
                      className='flex justify-center items-center px-2 py-1 rounded bg-white font-semibold font-geist text-black-500 text-xl transition-opacity hover:opacity-80'
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* display public toggle + option to edit the set title */}
          {isOwner ? (
            <div className='flex relative top-2 gap-8'>
              <div className='flex justify-center items-center gap-4'>
                <h3 className='font-geist text-xl text-zinc-300'>
                  {isPublic ? 'Public set' : 'Private set'}
                </h3>
                <ToggleSwitch
                  defaultChecked={isPublic}
                  onChange={togglePrivacy}
                />
              </div>
            </div>
          ) : (
            <div className='flex flex-col justify-center items-center top-2 gap-8'>
              <span className='font-geist text-zinc-300 text-md'>
                Created by: <span className='font-bold italic'>{author}</span>
              </span>
              <button
                onClick={() => setIsCopyingSet(true)}
                className='px-2 py-2 bg-teal-500 rounded font-geist font-bold text-zinc-800 hover:bg-teal-500/75'
              >
                Copy Set
              </button>
            </div>
          )}
          {isCopyingSet && set && (
            <CopySetModal
              isOpen={isCopyingSet}
              setIsOpen={setIsCopyingSet}
              handleSubmit={handleCopySet}
              set={set}
              copyingError={copyingError}
              setCopyingError={setCopyingError}
            />
          )}
        </div>
      </div>
    </section>
  );
};

'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import React from 'react';
import axios from 'axios';
import { DisplayCardBackground } from '@/components/DisplayCardBackground';
import { DisplayCard } from '@/components/DisplayCard';
import { motion, AnimatePresence } from 'framer-motion';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface PublicSet {
  id: string;
  title: string;
  user: {
    username: string;
  };
}

export const PublicSetsSection = () => {
  const router = useRouter();

  const [tags, setTags] = useState<{ name: string; publicSetCount: number }[]>(
    []
  );
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedTagSetCount, setSelectedTagSetCount] = useState(0);
  const [isTagClicked, setIsTagClicked] = useState(false);
  const [publicSets, setPublicSets] = useState<PublicSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const publicSetsRef = useRef<HTMLDivElement>(null);

  const handleClick = async (tagName: string) => {
    const token = localStorage.getItem('token');
    setIsTagClicked(false);
    try {
      // make api call to get all PUBLIC sets with the tag
      const { data: res } = await axios.get(
        `${apiUrl}/tag/public-sets/${tagName}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      const public_sets = res.data.sets;
      const setcount = res.data.setCount;
      const tagname = res.data.tagName;
      setPublicSets(public_sets);
      setSelectedTag(tagname);
      setSelectedTagSetCount(setcount);
      setIsTagClicked(true);
    } catch (er) {
      // console.log('Error retrieving all sets with the tag: ' + tagName);
    }
  };

  // load this once
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchDistinctTags = async () => {
      setLoading(true);
      try {
        const { data: res } = await axios.get(`${apiUrl}/tag/all-tags`, {
          headers: {
            Authorization: `${token}`,
          },
        });
        const tags = res.data.tags;
        const sortedTags = tags.sort(
          (a: { name: string }, b: { name: string }) =>
            a.name.localeCompare(b.name)
        );
        setTags(sortedTags);
      } catch (er) {
        setError(`ERROR: ${(er as any).response.data.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchDistinctTags();
  }, []);

  useEffect(() => {
    if (isTagClicked && publicSetsRef.current) {
      publicSetsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [isTagClicked]);

  if (loading) {
    return <div className='login-text'>LOADING</div>;
  }

  if (error) {
    return <div className='login-text'>ERROR</div>;
  }

  return (
    <section className='mt-12 mb-24'>
      <div className='container'>
        <h1 className='mt-12 login-text border-b max-w-sm mx-auto text-center'>
          Explore all tags
        </h1>
        <DisplayCardBackground className='mt-6 [mask-image:linear-gradient(to_top,transparent,black_10%,black_90%,transparent)]'>
          {/* Display all the tags */}
          <div className='p-6 grid grid-cols-3 max-h-72'>
            {tags.map(({ name, publicSetCount }, index) => (
              <div
                key={name}
                className='w-full flex items-center justify-center'
              >
                <DisplayCard
                  key={name}
                  className='w-fit h-fit px-2 py-4 bg-neutral-700 transition-transform duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-2 hover:-rotate-3'
                  publicSetCount={publicSetCount}
                  onClick={() => handleClick(name)}
                >
                  <h1 className='font-geist text-lg text-zinc-200'>{name}</h1>
                </DisplayCard>
              </div>
            ))}
          </div>
        </DisplayCardBackground>
        <AnimatePresence>
          {isTagClicked && (
            <div className='mt-12'>
              {/* Dispaying the tag and set count */}
              <div className='mt-2 px-4 font-geist text-zinc-300'>
                <p>
                  <span className='text-xl'>
                    Showing {selectedTagSetCount} set
                    <span>{selectedTagSetCount > 1 ? 's' : ''}</span> with tag:{' '}
                    <span className='font-bold text-3xl'>{selectedTag}</span>
                  </span>
                </p>
              </div>
              {/* Displaying the actual sets */}
              <div
                ref={publicSetsRef}
                className='mt-8 grid md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-x-hidden overflow-y-scroll no-scrollbar'
              >
                {publicSets.map(({ id, title, user }) => (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className='w-full flex items-center justify-center'
                  >
                    <DisplayCard
                      key={id}
                      className='relative group cursor-pointer w-72 h-72 hover:bg-zinc-600 hover:border-fuchsia-500/50 tranisiton duration:250'
                      onClick={() => {
                        router.push(`/set/${id}`);
                      }}
                    >
                      <div className='px-2 flex w-full h-full items-center justify-center'>
                        <h1 className='flex font-geist text-center text-zinc-300 text-2xl group-hover:underline'>
                          {title}
                        </h1>
                      </div>
                      <h1 className='absolute bottom-2 right-2 font-geist text-zinc-300 text-sm'>
                        Author: {user.username}
                      </h1>
                    </DisplayCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

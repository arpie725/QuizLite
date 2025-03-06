'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import React from 'react';
import axios from 'axios';
import { DisplayCardBackground } from '@/components/DisplayCardBackground';
import { DisplayCard } from '@/components/DisplayCard';
import Tag from '@/models/Tag';

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

  const [tags, setTags] = useState<[]>([]);
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
    console.log(
      'TODO: show the user all the public study sets that have that specific tag'
    );
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
      console.log(res);
      console.log(res.data.sets);
      const public_sets = res.data.sets;
      const setcount = res.data.setCount;
      const tagname = res.data.tagName;
      setPublicSets(public_sets);
      setSelectedTag(tagname);
      setSelectedTagSetCount(setcount);
      setIsTagClicked(true);
    } catch (er) {
      console.log('Error retrieving all sets with the tag: ' + tagName);
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
        setTags(tags);
      } catch (er) {
        console.log('Error fetching distinct tags: ', er);
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
        block: 'center',
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
    <section className='mt-12 border border-dashed mb-[1000px]'>
      <div className='container border'>
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
        {isTagClicked && (
          <div className=' border mt-12'>
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
              className='mt-8 grid md:grid-cols-3 lg:grid-cols-4 max-h-96 overflow-x-hidden overflow-y-scroll no-scrollbar'
            >
              {publicSets.map(({ id, title, user }) => (
                <div
                  key={id}
                  className='w-full flex items-center justify-center'
                >
                  <DisplayCard
                    key={id}
                    className='relative group cursor-pointer w-48 h-48 hover:bg-zinc-600 hover:border-fuchsia-500/50 tranisiton duration:250'
                    onClick={() => {
                      router.push(`/set/${id}`);
                    }}
                  >
                    <h1 className='absolute-center font-geist text-zinc-300 text-2xl group-hover:underline'>
                      {title}
                    </h1>
                    <h1 className='absolute bottom-2 right-2 font-geist text-zinc-300 text-sm'>
                      Author: {user.username}
                    </h1>
                  </DisplayCard>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import React from 'react';
import axios from 'axios';
import { DisplayCardBackground } from '@/components/DisplayCardBackground';
import { DisplayCard } from '@/components/DisplayCard';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const PublicSetsSection = () => {
  const [tags, setTags] = useState<[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    console.log(
      'TODO: show the user all the public study sets that have that specific tag'
    );
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
        <DisplayCardBackground className=' [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]'>
          {/* Display all the tags */}
          <div className='mt-6 flex flex-none gap-6 items-center justify-center'>
            {tags.map(({ name, publicSetCount }, index) => (
              <DisplayCard
                key={name}
                className='w-fit h-fit px-2 py-4 bg-neutral-700 transition-transform duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-2 hover:-rotate-3'
                publicSetCount={publicSetCount}
                onClick={handleClick}
              >
                <h1 className='font-geist text-lg text-zinc-200'>{name}</h1>
              </DisplayCard>
            ))}
          </div>
        </DisplayCardBackground>
      </div>
    </section>
  );
};

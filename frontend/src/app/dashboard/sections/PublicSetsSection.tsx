'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const PublicSetsSection = () => {
  const [tags, setTags] = useState<[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <section className='mb-[1000px]'>
      <div className='container'>
        <h1 className='login-text'>Public Sets Section</h1>
        {tags.map(({ name, publicSetCount }, index) => (
          <div
            key={index}
            className='login-text'
          >
            tag: {name}, number of sets: {publicSetCount}
          </div>
        ))}

        
      </div>
    </section>
  );
};

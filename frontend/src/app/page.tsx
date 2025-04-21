'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('no token found!');
      router.push('/auth');
    }
    // if valid token, navigate to the dashboard
    if (token) {
      router.push('/dashboard');
    }
  }, []);
  return <div></div>;
}

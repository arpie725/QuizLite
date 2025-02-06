//
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('no token found!');
      router.push('/');
    }
    // TODO: use token to get data from server
    // make sure to check if the token is a valid token (jwt.verify in server)
  }, []);

  return (
    <div>
      <h1 className='text-5xl login-text'>Dashboard!</h1>
    </div>
  );
};

export default Dashboard;

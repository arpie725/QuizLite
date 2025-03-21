'use client';
import { useEffect, useState } from 'react';
import { AuthForm } from './components/AuthForm';
import { useRouter } from 'next/navigation';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      // route to the dashboard
      router.push('/dashboard');
    }
  }, []);

  return (
    <div className='absolute-center'>
      <div className='flex-col border-4 rounded-2xl border-zinc-500/50'>
        <div className='px-8 py-4 flex font-geist justify-between items-center'>
          <h1 className='text-6xl text-fuchsia-500'>
            Quiz<span className='text-gray-400'>lite:</span>
          </h1>
          <h1 className='text-xl text-gray-400'>
            {isLogin ? 'Login' : 'Register'}
          </h1>
        </div>
        <AuthForm
          isLogin={isLogin}
          setIsLogin={setIsLogin}
        />
      </div>
    </div>
  );
};

export default AuthPage;

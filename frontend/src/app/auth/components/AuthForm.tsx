'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from '@/api/auth.js';
import {
  DuplicateEntryError,
  InvalidParamsError,
  NotFoundError,
  UnauthorizedError,
} from '@/utils/errors.js';

interface AuthFormProps {
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
}

export const AuthForm = ({ isLogin, setIsLogin }: AuthFormProps) => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      // decide whether to login or register a user
      isLogin
        ? await loginUser(username, password)
        : await registerUser(username, password);
      // successful login or register should redirect to dashboard
      router.push('/dashboard');
    } catch (er) {
      if (
        er instanceof UnauthorizedError ||
        er instanceof NotFoundError ||
        er instanceof InvalidParamsError ||
        er instanceof DuplicateEntryError
      ) {
        setErrorMessage(er.message);
        console.log(`[EXPECTED]: ${er}`);
        return;
      }
      // unexpected error
      console.log(`[UNEXPECTED]: ${er}`);
    }
  };

  return (
    <section className='flex justify-center items-center'>
      <div className='w-fit p-24'>
        <div className='flex flex-col'>
          {/* form */}
          <form onSubmit={handleSubmit}>
            <div className='flex flex-col gap-8'>
              {/* username */}
              <div className='flex flex-col gap-2'>
                <label
                  htmlFor='username'
                  className='login-text'
                >
                  Username
                </label>
                <input
                  id='username'
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className='max-w-sm user-input-bg user-input-text'
                />
              </div>
              {/* password */}
              <div className='flex flex-col gap-2'>
                <label
                  htmlFor='password'
                  className='login-text'
                >
                  Password
                </label>
                <input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='max-w-sm user-input-bg user-input-text'
                />
              </div>
              {/* buttons */}
              <div className='flex flex-col'>
                <button
                  type='submit'
                  className='bg-purple-pink max-w-sm py-2 text-white text-3xl font-semibold font-geist outline-none'
                >
                  {isLogin ? 'Login' : 'Register'}
                </button>
                <div className='h-6'>
                  {errorMessage && (
                    <span className='text-red-500 max-w-sm text-xs font-mono'>
                      ERROR: {errorMessage}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </form>
          <button
            className='flex w-fit mx-auto text-fuchsia-300 text-lg font-geist font-semibold opacity-50 hover:opacity-100 transition duration-300 outline-none'
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMessage('');
            }}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </section>
  );
};

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

export const AuthForm = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

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
      if (er instanceof UnauthorizedError) {
        // TODO: display incorrect password to client
        console.log('Incorrect password');
      }
      if (er instanceof NotFoundError) {
        // TODO: display username not found to client
        console.log('Username not found');
      }
      if (er instanceof InvalidParamsError) {
        // TODO: invalid params (empty user / pass)
        // NOTE: should not go to this ever
        console.log('Username or password cannot be empty');
      }
      if (er instanceof DuplicateEntryError) {
        // TODO: display duplicate username already exists to client
        console.log('Username already exists');
      }
    }
  };

  return (
    <section className='flex justify-center items-center'>
      <div className='w-fit border border-dashed p-24'>
        <div className='flex flex-col gap-8'>
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
              <div className='flex flex-col gap-4'>
                <button
                  type='submit'
                  className='bg-purple-pink max-w-sm py-2 text-white text-3xl font-semibold font-geist outline-none'
                >
                  {isLogin ? 'Login' : 'Register'}
                </button>
              </div>
            </div>
          </form>
          <button
            className='flex mt-4 w-fit mx-auto text-fuchsia-300 text-lg font-geist font-semibold opacity-50 hover:opacity-100 transition duration-300 outline-none'
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </section>
  );
};

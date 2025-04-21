'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DisplayCard } from '@/components/DisplayCard';

const aboutData = [
  {
    title: 'What is QuizLite?',
    bp: [
      'A user-driven study tool designed to help people create, manage, and share flashcards',
      'With a focus on simplicity, QuizLite offers bare-bones flashcards that can be categorized by title and tags, making it easy to organize and find relevant study sets',
    ],
  },
  {
    title: 'Tech Used',
    bp: [
      'Frontend: React + TailwindCSS',
      'Backend: Node.js server with JWT Authorization and Prisma ORM',
      'Database: PostgreSQL',
    ],
  },
  {
    title: 'Study Sets',
    bp: [
      'Study sets hold a group of flashcards together',
      'Sets can be categorized by user-created tags',
      'Sets can be made public to allow all users to view and make a copy of the set if desired',
    ],
  },
  {
    title: 'Flashcards',
    bp: [
      'Flashcards contain a question and answer',
      'Each flashcard can be flagged as correct or incorrect',
    ],
  },
];

export default function About() {
  return (
    <section className='py-12'>
      <div className='container '>
        <div className='border-b border-zinc-500'>
          <h1 className='font-geist text-fuchsia-500 text-5xl'>
            How to Use Quizlite?
          </h1>
        </div>
        <div className='mt-12'>
          {aboutData.map((data, idx) => (
            <div key={idx}>
              <DisplayCard className='py-4 px-8 w-500'>
                <div className='flex flex-col gap-8'>
                  <h1 className='font-geist font-semibold text-zinc-500 text-5xl border-b-4 border-dashed border-zinc-500/50'>
                    {data.title}
                  </h1>
                  <div>
                    {data.bp.map((desc, idx) => (
                      <div key={idx}>
                        <li className='text-zinc-300 text-lg font-geist font-semibold tracking-wide'>
                          {desc}
                        </li>
                      </div>
                    ))}
                  </div>
                </div>
              </DisplayCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

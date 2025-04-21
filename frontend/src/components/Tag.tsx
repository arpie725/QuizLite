import type { ComponentPropsWithoutRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const TagComponent = (
  props: ComponentPropsWithoutRef<'div'> & {
    color?: string;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
  }
) => {
  const { children, color, className, onClick } = props;
  return (
    <div
      className={twMerge(
        'px-3 py-1.5 font-geist font-bold tracking-wider text-xs bg-fuchsia-500/15 text-fuchsia-500 inline-flex rounded-full',
        color === 'cyan' && 'text-cyan-500 bg-cyan-500/15',
        color === 'lime' && 'text-lime-500 bg-lime-500/15',
        color === 'violet' && 'text-violet-500 bg-violet-500/15',
        color === 'emerald' && 'text-emerald-500 bg-emerald-500/15',
        color === 'indigo' && 'text-indigo-500 bg-indigo-500/15',
        color === 'teal' && 'text-teal-500 bg-teal-500/15',
        color === 'purple' && 'text-purple-500 bg-purple-500/15',
        color === 'slate' && 'text-slate-300 bg-slate-300/15',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

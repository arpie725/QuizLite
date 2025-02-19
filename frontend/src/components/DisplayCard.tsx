import { twMerge } from 'tailwind-merge';

export const DisplayCard = ({
  className,
  children,
  publicSetCount,
  onClick,
}: {
  className?: string;
  children: React.ReactNode;
  publicSetCount?: number;
  onClick?: () => void;
}) => {
  return (
    <div
      className={twMerge(
        'border-2 border-[rgba(255,255,255,0.10)] bg-[rgba(40,40,40,0.70)] bg-gray-700 shadow-[2px_4px_16px_0px_rgba(248,248,248,0.06)_inset] flex -z-5 relative group flex-col rounded-xl m-6 flex-shrink-0 w-72 h-72 transition duration-150',
        className
      )}
      onClick={onClick}
    >
      {publicSetCount !== undefined && (
        <div className='font-mono absolute -top-3 -right-3 bg-fuchsia-300 rounded-full px-2 py-0.5 text-md font-extrabold text-zinc-800'>
          {publicSetCount}
        </div>
      )}
      {children}
    </div>
  );
};

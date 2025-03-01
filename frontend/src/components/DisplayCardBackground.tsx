import { twMerge } from 'tailwind-merge';

export const DisplayCardBackground = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={twMerge(
        'bg-grid-small-fuchsia-500/[0.4] rounded-3xl -z-10 no-scrollbar overflow-x-hidden overflow-y-scroll max-h-[666px] max-w-3xl lg:max-w-full mx-auto lg:min-h-[300px]',
        className
      )}
    >
      {children}
    </div>
  );
};

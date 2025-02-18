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
        'bg-grid-small-fuchsia-500/[0.4] rounded-3xl -z-10 overflow-hidden max-w-3xl lg:max-w-full mx-auto lg:min-h-[300px]',
        className
      )}
    >
      {children}
    </div>
  );
};

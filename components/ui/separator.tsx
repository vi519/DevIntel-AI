import { HTMLAttributes } from 'react';
import clsx from 'clsx';

export default function Separator({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={clsx('my-8 border-slate-200', className)} {...props} />;
}

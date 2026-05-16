import { HTMLAttributes } from 'react';
import clsx from 'clsx';

export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('card-glass rounded-[2rem] border border-slate-200 p-6 shadow-glass', className)} {...props} />;
}

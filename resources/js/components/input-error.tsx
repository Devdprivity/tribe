import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

export default function InputError({ message, className = '', ...props }: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <p {...props} className={cn('text-sm text-red-400 bg-red-500/20 rounded-lg px-3 py-2 border border-red-400/30', className)}>
            {message}
        </p>
    ) : null;
}

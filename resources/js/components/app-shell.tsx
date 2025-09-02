import { PropsWithChildren } from 'react';

interface AppShellProps {
    children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="flex h-full w-full">
            {children}
        </div>
    );
}

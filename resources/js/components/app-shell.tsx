import { PropsWithChildren } from 'react';

interface AppShellProps {
    children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="flex min-h-screen w-full">
            {children}
        </div>
    );
}

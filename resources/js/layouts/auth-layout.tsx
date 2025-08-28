import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-svh bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {children}
            </div>
        </div>
    );
}

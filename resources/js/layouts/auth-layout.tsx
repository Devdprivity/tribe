import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-svh flex items-center justify-center p-4 auth-layout">
            <div className="w-full max-w-lg">
                {children}
            </div>
        </div>
    );
}

import AppLogoIcon from '@/components/app-logo-icon';
import { Code2, Users, Briefcase } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col bg-gray-100 dark:bg-gray-900 lg:flex-row">
            {/* Panel de contenido social */}
            <div className="flex w-full flex-col justify-center p-8 lg:w-1/2 lg:p-20">
                <div className="mb-12">
                    <div className="flex items-center gap-4 text-4xl font-bold text-primary lg:text-6xl">
                        <AppLogoIcon className="size-12 fill-current lg:size-16" />
                        Tribe
                    </div>
                    <h2 className="mt-4 text-2xl font-medium text-muted-foreground lg:text-3xl">
                        La red social donde los desarrolladores construyen el futuro juntos
                    </h2>
                </div>

                <div className="hidden space-y-8 lg:block">
                    <div className="grid gap-6">
                        <div className="flex items-center gap-4 rounded-xl bg-card p-6 shadow-sm">
                            <Users className="size-12 text-primary" />
                            <div>
                                <h3 className="text-xl font-medium">Comunidad Vibrante</h3>
                                <p className="text-muted-foreground">Conecta con +5,000 desarrolladores activos</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-xl bg-card p-6 shadow-sm">
                            <Code2 className="size-12 text-primary" />
                            <div>
                                <h3 className="text-xl font-medium">Conocimiento Compartido</h3>
                                <p className="text-muted-foreground">Accede a +10,000 snippets de código</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-xl bg-card p-6 shadow-sm">
                            <Briefcase className="size-12 text-primary" />
                            <div>
                                <h3 className="text-xl font-medium">Oportunidades Laborales</h3>
                                <p className="text-muted-foreground">Conecta con +500 empresas tech</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel de formulario */}
            <div className="flex w-full items-center justify-center p-8 lg:w-1/2 lg:bg-background lg:p-20">
                <div className="w-full max-w-[440px] rounded-2xl bg-background p-8 shadow-xl lg:p-10">
                    <div className="mb-8 text-center lg:hidden">
                        <div className="flex justify-center">
                            <AppLogoIcon className="size-12 fill-current text-primary" />
                        </div>
                    </div>

                    <div className="mb-8 space-y-2 text-center">
                        <h1 className="text-2xl font-semibold">{title}</h1>
                        <p className="text-muted-foreground">{description}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}

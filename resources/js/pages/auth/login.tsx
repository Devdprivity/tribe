import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Github, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="¡Bienvenido de nuevo!"
            description="Inicia sesión para conectar con la comunidad"
        >
            <Head title="Iniciar Sesión" />

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Correo electrónico"
                            className="h-14 rounded-xl text-lg"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-2">
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Contraseña"
                            className="h-14 rounded-xl text-lg"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <Button type="submit" size="lg" className="h-14 rounded-xl text-lg font-semibold" tabIndex={3} disabled={processing}>
                        {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                        Iniciar Sesión
                    </Button>

                    {canResetPassword && (
                        <TextLink href={route('password.request')} className="text-center text-sm" tabIndex={4}>
                            ¿Olvidaste tu contraseña?
                        </TextLink>
                    )}
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            O continúa con
                        </span>
                    </div>
                </div>

                <div className="grid gap-3">
                    <Button
                        variant="outline"
                        className="relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-zinc-900 text-lg font-medium text-white transition hover:bg-zinc-800"
                        type="button"
                        onClick={() => window.location.href = '/auth/github'}
                    >
                        <Github className="absolute left-4 h-6 w-6" />
                        <span className="flex-1">GitHub</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-blue-600 text-lg font-medium text-white transition hover:bg-blue-500"
                        type="button"
                        onClick={() => window.location.href = '/auth/google'}
                    >
                        <Mail className="absolute left-4 h-6 w-6" />
                        <span className="flex-1">Google</span>
                    </Button>
                </div>

                <div className="flex items-center justify-between border-t pt-6">
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={5}
                        />
                        <Label htmlFor="remember" className="text-sm">Recordarme</Label>
                    </div>

                    <TextLink href={route('register')} className="text-sm font-medium" tabIndex={6}>
                        Crear cuenta nueva
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}

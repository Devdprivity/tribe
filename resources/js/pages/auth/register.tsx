import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Github, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="¡Únete a la comunidad!"
            description="Crea tu cuenta y comienza a conectar"
        >
            <Head title="Registro" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Nombre completo"
                            className="h-14 rounded-xl text-lg"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
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
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Contraseña"
                            className="h-14 rounded-xl text-lg"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="space-y-2">
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Confirmar contraseña"
                            className="h-14 rounded-xl text-lg"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" size="lg" className="h-14 rounded-xl text-lg font-semibold" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                        Crear cuenta
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            O regístrate con
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

                <div className="border-t pt-6 text-center">
                    <TextLink href={route('login')} className="text-sm font-medium" tabIndex={6}>
                        ¿Ya tienes una cuenta? Inicia sesión
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}

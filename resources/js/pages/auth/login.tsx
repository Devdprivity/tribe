import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Github, Mail, Code, Sparkles, Eye, EyeOff } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

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
    const [showPassword, setShowPassword] = useState(false);
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
            title="¡Bienvenido de vuelta, Developer!"
            description="Conecta con la comunidad de creadores del futuro"
        >
            <Head title="Iniciar Sesión - Tribe" />

            {/* Hero Section with Animated Elements */}
            <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-8 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
                <div className="relative z-10">
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 p-3">
                            <Code className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-white">
                        Conecta con el Futuro
                    </h1>
                    <p className="text-sm text-slate-300">
                        Únete a la comunidad de desarrolladores que están construyendo el mañana
                    </p>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-2 -left-2 h-4 w-4 rounded-full bg-purple-400/30 animate-pulse" />
                <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-blue-400/20 animate-pulse delay-1000" />
                <div className="absolute top-1/2 -right-4 h-3 w-3 rounded-full bg-green-400/40 animate-pulse delay-500" />
            </div>

            {status && (
                <div className="mb-6 rounded-xl bg-green-500/10 p-4 text-center text-sm font-medium text-green-400 border border-green-500/20">
                    {status}
                </div>
            )}

            <form className="space-y-6" onSubmit={submit}>
                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                        Correo electrónico
                    </Label>
                    <div className="relative">
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="tu@email.com"
                            className="h-14 rounded-xl border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                        />
                        <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    </div>
                    <InputError message={errors.email} />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                        Contraseña
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="h-14 rounded-xl border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200 pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                            className="border-slate-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                        />
                        <Label htmlFor="remember" className="text-sm text-slate-300 cursor-pointer">
                            Recordarme
                        </Label>
                    </div>

                    {canResetPassword && (
                        <TextLink 
                            href={route('password.request')} 
                            className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors" 
                            tabIndex={4}
                        >
                            ¿Olvidaste tu contraseña?
                        </TextLink>
                    )}
                </div>

                {/* Login Button */}
                <Button 
                    type="submit" 
                    size="lg" 
                    className="h-14 w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-lg font-semibold text-white shadow-lg hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 transform hover:scale-[1.02]" 
                    tabIndex={3} 
                    disabled={processing}
                >
                    {processing ? (
                        <div className="flex items-center gap-2">
                            <LoaderCircle className="h-5 w-5 animate-spin" />
                            Conectando...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            Iniciar Sesión
                        </div>
                    )}
                </Button>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full bg-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-900 px-4 text-slate-400 font-medium">
                            O continúa con
                        </span>
                    </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid gap-3">
                    <Button
                        variant="outline"
                        className="relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-xl border-slate-700 bg-slate-800/50 text-lg font-medium text-white transition-all duration-200 hover:bg-slate-700/50 hover:border-slate-600 hover:scale-[1.02] group"
                        type="button"
                        onClick={() => window.location.href = '/auth/github'}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        <Github className="relative z-10 h-6 w-6" />
                        <span className="relative z-10">GitHub</span>
                    </Button>
                    
                    <Button
                        variant="outline"
                        className="relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-xl border-slate-700 bg-slate-800/50 text-lg font-medium text-white transition-all duration-200 hover:bg-slate-700/50 hover:border-slate-600 hover:scale-[1.02] group"
                        type="button"
                        onClick={() => window.location.href = '/auth/google'}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        <Mail className="relative z-10 h-6 w-6" />
                        <span className="relative z-10">Google</span>
                    </Button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center pt-4">
                    <p className="text-slate-400 text-sm">
                        ¿No tienes cuenta?{' '}
                        <TextLink 
                            href={route('register')} 
                            className="font-semibold text-purple-400 hover:text-purple-300 transition-colors" 
                            tabIndex={6}
                        >
                            Únete a Tribe
                        </TextLink>
                    </p>
                </div>
            </form>

            {/* Footer Stats */}
            <div className="mt-8 rounded-xl bg-slate-800/30 p-6 text-center">
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <div className="text-2xl font-bold text-purple-400">10K+</div>
                        <div className="text-slate-400">Developers</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-400">500+</div>
                        <div className="text-slate-400">Proyectos</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-400">24/7</div>
                        <div className="text-slate-400">Activo</div>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}

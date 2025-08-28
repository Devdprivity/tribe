import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Github, Mail, Code, Sparkles, Eye, EyeOff, Users, FileCode, Building2 } from 'lucide-react';
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

            {/* Main Login Container */}
            <div className="relative mx-auto max-w-md w-full">
                {/* Hero Section */}
                <div className="text-center mb-8">
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-4 shadow-2xl">
                                <Code className="h-10 w-10 text-white" />
                            </div>
                            {/* Glow Effect */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 blur-xl opacity-30 animate-pulse" />
                        </div>
                    </div>
                    
                    <h1 className="mb-3 text-3xl font-bold text-white">
                        Conecta con el Futuro
                    </h1>
                    <p className="text-slate-300 text-lg">
                        Únete a la comunidad de desarrolladores que están construyendo el mañana
                    </p>
                </div>

                {/* Status Message */}
                {status && (
                    <div className="mb-6 rounded-2xl bg-green-500/10 p-4 text-center text-sm font-medium text-green-400 border border-green-500/20 backdrop-blur-sm">
                        {status}
                    </div>
                )}

                {/* Login Form */}
                <div className="rounded-3xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 shadow-2xl">
                    <form className="space-y-6" onSubmit={submit}>
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                                Correo electrónico
                            </Label>
                            <div className="relative group">
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
                                    className="h-14 rounded-2xl border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 group-hover:border-slate-500"
                                />
                                <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-hover:text-purple-400 transition-colors duration-300" />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                                Contraseña
                            </Label>
                            <div className="relative group">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="h-14 rounded-2xl border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 pr-12 group-hover:border-slate-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors duration-300"
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
                                    className="border-slate-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 hover:border-purple-500 transition-colors duration-300"
                                />
                                <Label htmlFor="remember" className="text-sm text-slate-300 cursor-pointer hover:text-white transition-colors duration-300">
                                    Recordarme
                                </Label>
                            </div>

                            {canResetPassword && (
                                <TextLink 
                                    href={route('password.request')} 
                                    className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors duration-300" 
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
                            className="h-14 w-full rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-lg font-semibold text-white shadow-xl hover:shadow-2xl hover:from-purple-700 hover:via-blue-700 hover:to-cyan-600 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
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
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full bg-slate-600" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-800 px-4 text-slate-400 font-medium">
                                O continúa con
                            </span>
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid gap-3">
                        <Button
                            variant="outline"
                            className="relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border-slate-600 bg-slate-700/30 text-lg font-medium text-white transition-all duration-300 hover:bg-slate-600/50 hover:border-slate-500 hover:scale-[1.02] group"
                            type="button"
                            onClick={() => window.location.href = '/auth/github'}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <Github className="relative z-10 h-6 w-6" />
                            <span className="relative z-10">GitHub</span>
                        </Button>
                        
                        <Button
                            variant="outline"
                            className="relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border-slate-600 bg-slate-700/30 text-lg font-medium text-white transition-all duration-300 hover:bg-slate-600/50 hover:border-slate-500 hover:scale-[1.02] group"
                            type="button"
                            onClick={() => window.location.href = '/auth/google'}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <Mail className="relative z-10 h-6 w-6" />
                            <span className="relative z-10">Google</span>
                        </Button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center pt-6">
                        <p className="text-slate-400 text-sm">
                            ¿No tienes cuenta?{' '}
                            <TextLink 
                                href={route('register')} 
                                className="font-semibold text-purple-400 hover:text-purple-300 transition-colors duration-300" 
                                tabIndex={6}
                            >
                                Únete a Tribe
                            </TextLink>
                        </p>
                    </div>
                </div>

                {/* Community Stats */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="mb-2 flex justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20">
                                <Users className="h-6 w-6 text-purple-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-purple-400">10K+</div>
                        <div className="text-xs text-slate-400">Developers</div>
                    </div>
                    <div className="text-center">
                        <div className="mb-2 flex justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20">
                                <FileCode className="h-6 w-6 text-blue-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-400">500+</div>
                        <div className="text-xs text-slate-400">Proyectos</div>
                    </div>
                    <div className="text-center">
                        <div className="mb-2 flex justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/20">
                                <Building2 className="h-6 w-6 text-green-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-green-400">24/7</div>
                        <div className="text-xs text-slate-400">Activo</div>
                    </div>
                </div>

                {/* Floating Elements for Visual Appeal */}
                <div className="absolute -top-4 -left-4 h-3 w-3 rounded-full bg-purple-400/40 animate-pulse" />
                <div className="absolute -bottom-4 -right-4 h-4 w-4 rounded-full bg-blue-400/30 animate-pulse delay-1000" />
                <div className="absolute top-1/2 -right-6 h-2 w-2 rounded-full bg-cyan-400/50 animate-pulse delay-500" />
            </div>
        </AuthLayout>
    );
}

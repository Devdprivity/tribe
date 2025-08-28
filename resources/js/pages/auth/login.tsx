import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Github, Mail, Sparkles, Eye, EyeOff } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLogoIcon from '@/components/app-logo-icon';
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

            {/* Main Container with Two Columns */}
            <div className="flex w-full max-w-7xl mx-auto">
                {/* Left Side - Tribe Logo and Branding */}
                <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
                    <div className="text-center">
                        <div className="mb-8">
                            <AppLogoIcon className="h-32 w-32 text-white mx-auto" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Tribe
                        </h1>
                        <p className="text-xl text-gray-300 max-w-md">
                            La red social donde los desarrolladores construyen el futuro juntos
                        </p>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        {/* Login Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Conecta con el Futuro
                            </h2>
                            <p className="text-gray-400">
                                Únete a la comunidad de desarrolladores que están construyendo el mañana
                            </p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="mb-6 rounded-xl bg-green-500/10 p-4 text-center text-sm font-medium text-green-400 border border-green-500/20">
                                {status}
                            </div>
                        )}

                        {/* Login Form Card */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
                            <form className="space-y-6" onSubmit={submit}>
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-white">
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
                                            className="h-12 rounded-xl border-gray-600 bg-white/10 text-white placeholder:text-gray-400 focus:border-white focus:ring-2 focus:ring-white/20 transition-all duration-200"
                                        />
                                        <Mail className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium text-white">
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
                                            className="h-12 rounded-xl border-gray-600 bg-white/10 text-white placeholder:text-gray-400 focus:border-white focus:ring-2 focus:ring-white/20 transition-all duration-200 pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                                            className="border-gray-600 data-[state=checked]:bg-white data-[state=checked]:border-white"
                                        />
                                        <Label htmlFor="remember" className="text-sm text-gray-300 cursor-pointer hover:text-white transition-colors duration-200">
                                            Recordarme
                                        </Label>
                                    </div>

                                    {canResetPassword && (
                                        <TextLink 
                                            href={route('password.request')} 
                                            className="text-sm font-medium text-white hover:text-gray-300 transition-colors duration-200" 
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
                                    className="h-12 w-full rounded-xl bg-white text-black text-base font-semibold hover:bg-gray-100 focus:ring-2 focus:ring-white/50 transition-all duration-200" 
                                    tabIndex={3} 
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="flex items-center gap-2">
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                            Conectando...
                                        </div>
                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4" />
                                            Iniciar Sesión
                                        </div>
                                    )}
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <Separator className="w-full bg-gray-600" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white/10 px-4 text-gray-400 font-medium">
                                        O continúa con
                                    </span>
                                </div>
                            </div>

                            {/* Social Login Buttons */}
                            <div className="grid gap-3">
                                <Button
                                    variant="outline"
                                    className="h-12 w-full rounded-xl border-gray-600 bg-white/5 text-white hover:bg-white/10 hover:border-white transition-all duration-200"
                                    type="button"
                                    onClick={() => window.location.href = '/auth/github'}
                                >
                                    <Github className="h-5 w-5 mr-2" />
                                    GitHub
                                </Button>
                                
                                <Button
                                    variant="outline"
                                    className="h-12 w-full rounded-xl border-gray-600 bg-white/5 text-white hover:bg-white/10 hover:border-white transition-all duration-200"
                                    type="button"
                                    onClick={() => window.location.href = '/auth/google'}
                                >
                                    <Mail className="h-5 w-5 mr-2" />
                                    Google
                                </Button>
                            </div>

                            {/* Sign Up Link */}
                            <div className="text-center pt-6">
                                <p className="text-gray-400 text-sm">
                                    ¿No tienes cuenta?{' '}
                                    <TextLink 
                                        href={route('register')} 
                                        className="font-semibold text-white hover:text-gray-300 transition-colors duration-200" 
                                        tabIndex={6}
                                    >
                                        Únete a Tribe
                                    </TextLink>
                                </p>
                            </div>
                        </div>

                        {/* Community Stats */}
                        <div className="mt-8 grid grid-cols-3 gap-4">
                            <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="text-2xl font-bold text-white">10K+</div>
                                <div className="text-xs text-gray-400">Developers</div>
                            </div>
                            <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="text-2xl font-bold text-white">500+</div>
                                <div className="text-xs text-gray-400">Proyectos</div>
                            </div>
                            <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="text-2xl font-bold text-white">24/7</div>
                                <div className="text-xs text-gray-400">Activo</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}

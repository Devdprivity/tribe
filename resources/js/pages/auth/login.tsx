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

            {/* Single Unified Login Container */}
            <div className="relative w-full flex items-center justify-center">
                {/* Floating Code Snippets - Left Side */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-40 pointer-events-none w-80">
                    {/* Login Component Code - Left Side */}
                    <div className="text-xs text-emerald-400/60 font-mono">
                        <span className="typing-animation-left">import { '{' } Head, useForm { '}' } from '@inertiajs/react';<br/>
                        import { '{' } LoaderCircle, Github, Mail, Sparkles, Eye, EyeOff { '}' } from 'lucide-react';<br/>
                        import { '{' } FormEventHandler, useState { '}' } from 'react';<br/><br/>
                        import InputError from '@/components/input-error';<br/>
                        import TextLink from '@/components/text-link';<br/>
                        import { '{' } Button { '}' } from '@/components/ui/button';<br/>
                        import { '{' } Checkbox { '}' } from '@/components/ui/checkbox';<br/>
                        import { '{' } Input { '}' } from '@/components/ui/input';<br/>
                        import { '{' } Label { '}' } from '@/components/ui/label';<br/>
                        import { '{' } Separator { '}' } from '@/components/ui/separator';<br/>
                        import AppLogoIcon from '@/components/app-logo-icon';<br/>
                        import AuthLayout from '@/layouts/auth-layout';<br/><br/>
                        type LoginForm = { '{' }<br/>
                        {'  '}email: string;<br/>
                        {'  '}password: string;<br/>
                        {'  '}remember: boolean;<br/>
                        { '}' };<br/><br/>
                        interface LoginProps { '{' }<br/>
                        {'  '}status?: string;<br/>
                        {'  '}canResetPassword: boolean;<br/>
                        { '}' }</span>
                    </div>
                </div>

                {/* Floating Code Snippets - Right Side */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-40 pointer-events-none w-80">
                    {/* Login Component Code - Right Side */}
                    <div className="text-xs text-blue-400/60 font-mono">
                        <span className="typing-animation-right">export default function Login({ '{' } status, canResetPassword { '}' }: LoginProps) { '{' }<br/>
                        {'  '}const [showPassword, setShowPassword] = useState(false);<br/>
                        {'  '}const { '{' } data, setData, post, processing, errors, reset { '}' } = useForm&lt;Required&lt;LoginForm&gt;&gt;({ '{' }<br/>
                        {'    '}email: '',<br/>
                        {'    '}password: '',<br/>
                        {'    '}remember: false,<br/>
                        {'  '}{ '}' });<br/><br/>
                        {'  '}const submit: FormEventHandler = (e) =&gt; { '{' }<br/>
                        {'    '}e.preventDefault();<br/>
                        {'    '}post(route('login'), { '{' }<br/>
                        {'      '}onFinish: () =&gt; reset('password'),<br/>
                        {'    '}{ '}' });<br/>
                        {'  '}{ '}' };<br/><br/>
                        {'  '}return (<br/>
                        {'    '}&lt;AuthLayout&gt;<br/>
                        {'      '}&lt;Head title="Iniciar Sesión - Tribe" /&gt;</span>
                    </div>
                </div>

                {/* Floating Developer Emojis - Left Side */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-48 pointer-events-none">
                    <div className="text-2xl mb-8 opacity-80">👨🏻‍💻</div>
                    <div className="text-xl opacity-80">💻</div>
                </div>

                {/* Floating Developer Emojis - Right Side */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-48 pointer-events-none">
                    <div className="text-2xl mb-8 opacity-80">👩‍💻</div>
                    <div className="text-xl opacity-80">🚀</div>
                </div>

                {/* Main Login Card */}
                <div className="relative z-10 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-8 shadow-2xl border border-purple-500/20 backdrop-blur-sm">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="mb-4 flex justify-center">
                            <div className="relative">
                                <div className="flex h-16 w-16 items-center justify-center rounded-3xl p-3">
                                    <AppLogoIcon className="h-15 w-15 text-white fill-current" />
                                </div>
                            </div>
                        </div>
                        
                        <h1 className="mb-2 text-2xl font-bold text-white">
                            Conecta con el Futuro
                        </h1>
                        <p className="text-slate-300 text-base">
                            Únete a la comunidad de desarrolladores que están construyendo el mañana
                        </p>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="mb-4 rounded-2xl bg-emerald-500/10 p-3 text-center text-sm font-medium text-emerald-400 border border-emerald-500/20">
                            {status}
                        </div>
                    )}

                    {/* Login Form */}
                    <form className="space-y-4" onSubmit={submit}>
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
                                    className="h-12 rounded-2xl border-slate-600 bg-slate-800/50 text-white placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 group-hover:border-purple-500"
                                />
                                <Mail className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-hover:text-violet-400 transition-colors duration-300" />
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
                                    className="h-12 rounded-2xl border-slate-600 bg-slate-800/50 text-white placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 pr-12 group-hover:border-purple-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-400 transition-colors duration-300"
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
                                    className="border-slate-600 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 hover:border-violet-500 transition-colors duration-300"
                                />
                                <Label htmlFor="remember" className="text-sm text-slate-300 cursor-pointer hover:text-white transition-colors duration-300">
                                    Recordarme
                                </Label>
                            </div>

                            {canResetPassword && (
                                <TextLink 
                                    href={route('password.request')} 
                                    className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors duration-300" 
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
                            className="h-12 w-full rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-emerald-500 text-base font-semibold text-white shadow-xl hover:shadow-2xl hover:from-violet-700 hover:via-purple-700 hover:to-emerald-600 focus:ring-2 focus:ring-violet-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
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
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full bg-slate-600" />
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
                            className="relative flex h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border-slate-600 bg-slate-800/30 text-base font-medium text-white transition-all duration-300 hover:bg-slate-700/50 hover:border-purple-500 hover:scale-[1.02] group"
                            type="button"
                            onClick={() => window.location.href = '/auth/github'}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <Github className="relative z-10 h-5 w-5" />
                            <span className="relative z-10">GitHub</span>
                        </Button>
                        
                        <Button
                            variant="outline"
                            className="relative flex h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border-slate-600 bg-slate-800/30 text-base font-medium text-white transition-all duration-300 hover:bg-slate-700/50 hover:border-emerald-500 hover:scale-[1.02] group"
                            type="button"
                            onClick={() => window.location.href = '/auth/google'}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <Mail className="relative z-10 h-5 w-5" />
                            <span className="relative z-10">Google</span>
                        </Button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center pt-4">
                        <p className="text-slate-400 text-sm">
                            ¿No tienes cuenta?{' '}
                            <TextLink 
                                href={route('register')} 
                                className="font-semibold text-violet-400 hover:text-violet-300 transition-colors duration-300" 
                                tabIndex={6}
                            >
                                Únete a Tribe
                            </TextLink>
                        </p>
                    </div>

                    {/* Community Stats Integrated */}
                    <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
                        <div className="text-center">
                            <div className="text-xl font-bold text-violet-400">10K+</div>
                            <div className="text-xs text-slate-400">Developers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-purple-400">500+</div>
                            <div className="text-xs text-slate-400">Proyectos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-emerald-400">24/7</div>
                            <div className="text-xs text-slate-400">Activo</div>
                        </div>
                    </div>
                </div>

                {/* Additional Floating Elements */}
                <div className="absolute -top-4 -left-4 h-3 w-3 rounded-full bg-violet-400/40 animate-pulse" />
                <div className="absolute -bottom-4 -right-4 h-4 w-4 rounded-full bg-purple-400/30 animate-pulse delay-1000" />
                <div className="absolute top-1/2 -right-6 h-2 w-2 rounded-full bg-emerald-400/50 animate-pulse delay-500" />
            </div>
        </AuthLayout>
    );
}

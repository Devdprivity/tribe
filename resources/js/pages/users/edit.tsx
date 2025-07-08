import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface User {
    id: number;
    username: string;
    full_name: string;
    email: string;
    bio?: string;
    avatar?: string;
    level: 'junior' | 'mid' | 'senior' | 'lead';
    years_experience: number;
    location?: string;
    website?: string;
    github_username?: string;
    linkedin_profile?: string;
    is_open_to_work: boolean;
}

interface Props {
    user: User;
}

export default function UserEdit({ user }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        username: user.username,
        full_name: user.full_name,
        bio: user.bio || '',
        level: user.level,
        years_experience: user.years_experience,
        location: user.location || '',
        website: user.website || '',
        github_username: user.github_username || '',
        linkedin_profile: user.linkedin_profile || '',
        is_open_to_work: user.is_open_to_work,
        avatar: user.avatar || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/users/${user.id}`);
    };

    return (
        <>
            <Head title="Editar Perfil" />

            <div className="max-w-2xl mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Editar Perfil</h1>
                    <p className="text-muted-foreground">
                        Actualiza tu información personal y profesional
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información Básica */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Básica</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="username">Nombre de usuario</Label>
                                    <Input
                                        id="username"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        error={errors.username}
                                    />
                                    {errors.username && (
                                        <p className="text-sm text-red-500 mt-1">{errors.username}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="full_name">Nombre completo</Label>
                                    <Input
                                        id="full_name"
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        error={errors.full_name}
                                    />
                                    {errors.full_name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.full_name}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="bio">Biografía</Label>
                                <Textarea
                                    id="bio"
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    placeholder="Cuéntanos sobre ti, tu experiencia y lo que te apasiona..."
                                    rows={4}
                                />
                                {errors.bio && (
                                    <p className="text-sm text-red-500 mt-1">{errors.bio}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="avatar">URL del avatar</Label>
                                <Input
                                    id="avatar"
                                    type="url"
                                    value={data.avatar}
                                    onChange={(e) => setData('avatar', e.target.value)}
                                    placeholder="https://ejemplo.com/avatar.jpg"
                                />
                                {errors.avatar && (
                                    <p className="text-sm text-red-500 mt-1">{errors.avatar}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información Profesional */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Profesional</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="level">Nivel de experiencia</Label>
                                    <Select value={data.level} onValueChange={(value) => setData('level', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="junior">Junior (0-2 años)</SelectItem>
                                            <SelectItem value="mid">Mid-level (3-5 años)</SelectItem>
                                            <SelectItem value="senior">Senior (6+ años)</SelectItem>
                                            <SelectItem value="lead">Lead/Manager</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.level && (
                                        <p className="text-sm text-red-500 mt-1">{errors.level}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="years_experience">Años de experiencia</Label>
                                    <Input
                                        id="years_experience"
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={data.years_experience}
                                        onChange={(e) => setData('years_experience', parseInt(e.target.value))}
                                    />
                                    {errors.years_experience && (
                                        <p className="text-sm text-red-500 mt-1">{errors.years_experience}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="location">Ubicación</Label>
                                <Input
                                    id="location"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    placeholder="Ciudad, País"
                                />
                                {errors.location && (
                                    <p className="text-sm text-red-500 mt-1">{errors.location}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_open_to_work"
                                    checked={data.is_open_to_work}
                                    onCheckedChange={(checked) => setData('is_open_to_work', checked as boolean)}
                                />
                                <Label htmlFor="is_open_to_work">Disponible para nuevas oportunidades</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Enlaces y Redes Sociales */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Enlaces y Redes Sociales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="website">Sitio web personal</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    placeholder="https://tu-sitio.com"
                                />
                                {errors.website && (
                                    <p className="text-sm text-red-500 mt-1">{errors.website}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="github_username">Usuario de GitHub</Label>
                                <Input
                                    id="github_username"
                                    value={data.github_username}
                                    onChange={(e) => setData('github_username', e.target.value)}
                                    placeholder="tu-usuario-github"
                                />
                                {errors.github_username && (
                                    <p className="text-sm text-red-500 mt-1">{errors.github_username}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="linkedin_profile">Perfil de LinkedIn</Label>
                                <Input
                                    id="linkedin_profile"
                                    type="url"
                                    value={data.linkedin_profile}
                                    onChange={(e) => setData('linkedin_profile', e.target.value)}
                                    placeholder="https://linkedin.com/in/tu-perfil"
                                />
                                {errors.linkedin_profile && (
                                    <p className="text-sm text-red-500 mt-1">{errors.linkedin_profile}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botones de acción */}
                    <div className="flex items-center justify-between">
                        <Button variant="outline" type="button" asChild>
                            <a href={`/users/${user.id}`}>Cancelar</a>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

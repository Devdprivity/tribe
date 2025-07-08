import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Bookmark,
    Search,
    Filter,
    User,
    Calendar,
    Hash,
    Code2,
    FileImage,
    Link as LinkIcon
} from 'lucide-react';
import PostCard from '@/components/post-card';

interface User {
    id: number;
    username: string;
    full_name: string;
    avatar?: string;
}

interface Post {
    id: number;
    content: string;
    type: 'text' | 'code' | 'project' | 'link';
    hashtags: string[];
    likes_count: number;
    comments_count: number;
    created_at: string;
    user: User;
    is_liked: boolean;
    is_bookmarked: boolean;
}

interface Props {
    bookmarkedPosts: Post[];
    bookmarkedJobs: any[];
    bookmarkedUsers: User[];
}

export default function Bookmarks({ bookmarkedPosts, bookmarkedJobs, bookmarkedUsers }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('posts');
    const [filterType, setFilterType] = useState('all');

    const filteredPosts = bookmarkedPosts.filter(post => {
        const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFilter = filterType === 'all' || post.type === filterType;

        return matchesSearch && matchesFilter;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'code': return <Code2 className="h-4 w-4" />;
            case 'project': return <FileImage className="h-4 w-4" />;
            case 'link': return <LinkIcon className="h-4 w-4" />;
            default: return <Hash className="h-4 w-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'code': return 'Código';
            case 'project': return 'Proyecto';
            case 'link': return 'Enlace';
            default: return 'Texto';
        }
    };

    return (
        <AppLayout title="Favoritos" description="Tus posts, trabajos y usuarios guardados">
            <Head title="Favoritos" />

            <div className="w-full">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Bookmark className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">Favoritos</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Tus posts, trabajos y usuarios guardados
                    </p>
                </div>

                {/* Buscador */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Buscar en favoritos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="posts" className="flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            Posts ({bookmarkedPosts.length})
                        </TabsTrigger>
                        <TabsTrigger value="jobs" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Trabajos ({bookmarkedJobs.length})
                        </TabsTrigger>
                        <TabsTrigger value="users" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Usuarios ({bookmarkedUsers.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Filtros para posts */}
                    {activeTab === 'posts' && (
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Filtrar por:</span>
                            <div className="flex gap-2">
                                <Button
                                    variant={filterType === 'all' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilterType('all')}
                                >
                                    Todos
                                </Button>
                                <Button
                                    variant={filterType === 'code' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilterType('code')}
                                >
                                    <Code2 className="h-4 w-4 mr-1" />
                                    Código
                                </Button>
                                <Button
                                    variant={filterType === 'project' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilterType('project')}
                                >
                                    <FileImage className="h-4 w-4 mr-1" />
                                    Proyectos
                                </Button>
                                <Button
                                    variant={filterType === 'link' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilterType('link')}
                                >
                                    <LinkIcon className="h-4 w-4 mr-1" />
                                    Enlaces
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Contenido de Posts */}
                    <TabsContent value="posts" className="space-y-4">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-medium mb-2">
                                        {searchTerm ? 'No se encontraron posts' : 'No tienes posts guardados'}
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        {searchTerm
                                            ? 'Intenta con otros términos de búsqueda.'
                                            : 'Guarda posts que te interesen para encontrarlos fácilmente.'
                                        }
                                    </p>
                                    {!searchTerm && (
                                        <Button asChild>
                                            <a href="/posts">Explorar posts</a>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Contenido de Trabajos */}
                    <TabsContent value="jobs" className="space-y-4">
                        {bookmarkedJobs.length > 0 ? (
                            bookmarkedJobs.map((job) => (
                                <Card key={job.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
                                                <p className="text-muted-foreground mb-3">{job.company_name}</p>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{job.location}</span>
                                                    {job.remote_friendly && (
                                                        <Badge variant="outline">Remoto</Badge>
                                                    )}
                                                    <span>{job.salary_range}</span>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Ver detalles
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-medium mb-2">No tienes trabajos guardados</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Guarda ofertas de trabajo que te interesen.
                                    </p>
                                    <Button asChild>
                                        <a href="/jobs">Explorar trabajos</a>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Contenido de Usuarios */}
                    <TabsContent value="users" className="space-y-4">
                        {bookmarkedUsers.length > 0 ? (
                            bookmarkedUsers.map((user) => (
                                <Card key={user.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                {user.full_name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{user.full_name}</h3>
                                                <p className="text-muted-foreground">@{user.username}</p>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Ver perfil
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-medium mb-2">No tienes usuarios guardados</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Guarda perfiles de desarrolladores que te interesen.
                                    </p>
                                    <Button asChild>
                                        <a href="/users">Explorar usuarios</a>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
    Plus,
    ArrowLeft,
    DollarSign,
    Upload,
    X,
    FileText,
    Image,
    Code,
    Package,
    Tag,
    AlertCircle
} from 'lucide-react';

export default function CreateProduct() {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [deliveryMethod, setDeliveryMethod] = useState<'github' | 'zip' | 'git_access'>('github');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        price: '',
        category: '',
        tags: '',
        delivery_method: deliveryMethod,
        github_repo: '',
        github_release_tag: '',
        zip_file: null as File | null,
        git_repo_url: '',
        git_access_instructions: '',
        images: [] as File[],
        files: [] as File[],
        is_active: true
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages(prev => [...prev, ...files]);
        setData('images', [...data.images, ...files]);
    };

    const removeImage = (index: number) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        setSelectedImages(newImages);
        setData('images', newImages);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...prev, ...files]);
        setData('files', [...data.files, ...files]);
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        setData('files', newFiles);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/marketplace/create', {
            onSuccess: () => {
                router.visit('/marketplace/my-products');
            }
        });
    };

    const categories = [
        { value: 'web_development', label: 'Desarrollo Web' },
        { value: 'mobile_development', label: 'Desarrollo Móvil' },
        { value: 'desktop_application', label: 'Aplicación de Escritorio' },
        { value: 'api_service', label: 'API/Servicio' },
        { value: 'library_framework', label: 'Librería/Framework' },
        { value: 'plugin_extension', label: 'Plugin/Extensión' },
        { value: 'template_theme', label: 'Plantilla/Tema' },
        { value: 'script_utility', label: 'Script/Utilidad' },
        { value: 'game', label: 'Juego' },
        { value: 'other', label: 'Otro' }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Crear Producto" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Button
                                variant="outline"
                                onClick={() => router.visit('/marketplace/my-products')}
                                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                            <h1 className="text-3xl font-bold text-white">
                                Crear Nuevo Producto
                            </h1>
                        </div>
                        <p className="text-white/70">
                            Vende tu código, aplicaciones y servicios a la comunidad
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Información Básica
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">
                                        Nombre del Producto *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Ej: Sistema de Gestión de Inventarios"
                                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                    {errors.name && (
                                        <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">
                                        Descripción *
                                    </label>
                                    <Textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Describe detalladamente tu producto. Incluye características, tecnologías utilizadas, casos de uso, etc."
                                        className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-blue-500/50"
                                        rows={6}
                                    />
                                    {errors.description && (
                                        <p className="text-red-400 text-xs mt-1">{errors.description}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-white mb-2 block">
                                            Precio (USD) *
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.price}
                                                onChange={(e) => setData('price', e.target.value)}
                                                placeholder="0.00"
                                                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            />
                                        </div>
                                        {errors.price && (
                                            <p className="text-red-400 text-xs mt-1">{errors.price}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-white mb-2 block">
                                            Categoría *
                                        </label>
                                        <select
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        >
                                            <option value="">Selecciona una categoría</option>
                                            {categories.map((category) => (
                                                <option key={category.value} value={category.value}>
                                                    {category.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && (
                                            <p className="text-red-400 text-xs mt-1">{errors.category}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">
                                        Etiquetas
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-white/50" />
                                        <input
                                            type="text"
                                            value={data.tags}
                                            onChange={(e) => setData('tags', e.target.value)}
                                            placeholder="react, javascript, api, web (separadas por comas)"
                                            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                    <p className="text-white/60 text-xs mt-1">
                                        Separa las etiquetas con comas para facilitar la búsqueda
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivery Method */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Code className="h-5 w-5" />
                                    Método de Entrega
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-white mb-3 block">
                                        Selecciona cómo se entregará tu producto *
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="delivery_method"
                                                value="github"
                                                checked={deliveryMethod === 'github'}
                                                onChange={(e) => {
                                                    setDeliveryMethod(e.target.value as any);
                                                    setData('delivery_method', e.target.value);
                                                }}
                                                className="mt-1 text-blue-500"
                                            />
                                            <div>
                                                <p className="text-white font-medium">GitHub Release</p>
                                                <p className="text-white/70 text-sm">
                                                    Entrega a través de un release de GitHub
                                                </p>
                                            </div>
                                        </label>

                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="delivery_method"
                                                value="zip"
                                                checked={deliveryMethod === 'zip'}
                                                onChange={(e) => {
                                                    setDeliveryMethod(e.target.value as any);
                                                    setData('delivery_method', e.target.value);
                                                }}
                                                className="mt-1 text-blue-500"
                                            />
                                            <div>
                                                <p className="text-white font-medium">Archivo ZIP</p>
                                                <p className="text-white/70 text-sm">
                                                    Sube un archivo ZIP con tu producto
                                                </p>
                                            </div>
                                        </label>

                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="delivery_method"
                                                value="git_access"
                                                checked={deliveryMethod === 'git_access'}
                                                onChange={(e) => {
                                                    setDeliveryMethod(e.target.value as any);
                                                    setData('delivery_method', e.target.value);
                                                }}
                                                className="mt-1 text-blue-500"
                                            />
                                            <div>
                                                <p className="text-white font-medium">Acceso a Repositorio Git</p>
                                                <p className="text-white/70 text-sm">
                                                    Proporciona acceso a un repositorio Git privado
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* GitHub Delivery */}
                                {deliveryMethod === 'github' && (
                                    <div className="space-y-4 bg-white/5 border border-white/10 rounded-lg p-4">
                                        <h4 className="text-white font-medium">Configuración de GitHub</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-white mb-2 block">
                                                    Repositorio GitHub *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.github_repo}
                                                    onChange={(e) => setData('github_repo', e.target.value)}
                                                    placeholder="usuario/repositorio"
                                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                />
                                                {errors.github_repo && (
                                                    <p className="text-red-400 text-xs mt-1">{errors.github_repo}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-white mb-2 block">
                                                    Tag del Release *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.github_release_tag}
                                                    onChange={(e) => setData('github_release_tag', e.target.value)}
                                                    placeholder="v1.0.0"
                                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                />
                                                {errors.github_release_tag && (
                                                    <p className="text-red-400 text-xs mt-1">{errors.github_release_tag}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ZIP Delivery */}
                                {deliveryMethod === 'zip' && (
                                    <div className="space-y-4 bg-white/5 border border-white/10 rounded-lg p-4">
                                        <h4 className="text-white font-medium">Archivo ZIP</h4>
                                        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                                            <input
                                                type="file"
                                                accept=".zip"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setData('zip_file', file);
                                                    }
                                                }}
                                                className="hidden"
                                                id="zip-upload"
                                            />
                                            <label
                                                htmlFor="zip-upload"
                                                className="cursor-pointer flex flex-col items-center gap-2"
                                            >
                                                <Upload className="h-8 w-8 text-white/50" />
                                                <span className="text-white/70 text-sm">
                                                    Sube tu archivo ZIP
                                                </span>
                                                <span className="text-white/50 text-xs">
                                                    Máximo 100MB
                                                </span>
                                            </label>
                                        </div>
                                        {errors.zip_file && (
                                            <p className="text-red-400 text-xs mt-1">{errors.zip_file}</p>
                                        )}
                                    </div>
                                )}

                                {/* Git Access Delivery */}
                                {deliveryMethod === 'git_access' && (
                                    <div className="space-y-4 bg-white/5 border border-white/10 rounded-lg p-4">
                                        <h4 className="text-white font-medium">Acceso a Repositorio Git</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-white mb-2 block">
                                                    URL del Repositorio *
                                                </label>
                                                <input
                                                    type="url"
                                                    value={data.git_repo_url}
                                                    onChange={(e) => setData('git_repo_url', e.target.value)}
                                                    placeholder="https://github.com/usuario/repositorio.git"
                                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                />
                                                {errors.git_repo_url && (
                                                    <p className="text-red-400 text-xs mt-1">{errors.git_repo_url}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-white mb-2 block">
                                                    Instrucciones de Acceso *
                                                </label>
                                                <Textarea
                                                    value={data.git_access_instructions}
                                                    onChange={(e) => setData('git_access_instructions', e.target.value)}
                                                    placeholder="Proporciona las credenciales, claves SSH, o cualquier información necesaria para acceder al repositorio..."
                                                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-blue-500/50"
                                                    rows={4}
                                                />
                                                {errors.git_access_instructions && (
                                                    <p className="text-red-400 text-xs mt-1">{errors.git_access_instructions}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Images */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Image className="h-5 w-5" />
                                    Imágenes del Producto
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="cursor-pointer flex flex-col items-center gap-2"
                                    >
                                        <Image className="h-8 w-8 text-white/50" />
                                        <span className="text-white/70 text-sm">
                                            Sube imágenes de tu producto
                                        </span>
                                        <span className="text-white/50 text-xs">
                                            PNG, JPG, GIF (máx. 5MB cada una)
                                        </span>
                                    </label>
                                </div>

                                {/* Selected Images */}
                                {selectedImages.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {selectedImages.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={URL.createObjectURL(image)}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Additional Files */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Archivos Adicionales
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.txt,.md"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer flex flex-col items-center gap-2"
                                    >
                                        <Upload className="h-8 w-8 text-white/50" />
                                        <span className="text-white/70 text-sm">
                                            Sube documentación adicional
                                        </span>
                                        <span className="text-white/50 text-xs">
                                            PDF, DOC, TXT, MD (máx. 10MB cada uno)
                                        </span>
                                    </label>
                                </div>

                                {/* Selected Files */}
                                {selectedFiles.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-white/50" />
                                                    <span className="text-white text-sm">{file.name}</span>
                                                    <span className="text-white/50 text-xs">
                                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Terms and Conditions */}
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                                    <div className="space-y-2 text-sm text-white/70">
                                        <p className="font-medium text-white">Términos y Condiciones</p>
                                        <p>• Asegúrate de que tienes los derechos para vender este producto</p>
                                        <p>• El producto debe funcionar como se describe</p>
                                        <p>• Proporciona soporte adecuado a los compradores</p>
                                        <p>• Cumple con las políticas de la plataforma</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit Buttons */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit('/marketplace/my-products')}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || !data.name || !data.description || !data.price || !data.category}
                                className="flex-1 bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        Creando Producto...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Crear Producto
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

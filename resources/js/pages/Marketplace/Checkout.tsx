import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    CreditCard, 
    Shield, 
    CheckCircle, 
    Lock, 
    Star,
    Package,
    User,
    AlertCircle,
    Loader2
} from 'lucide-react';

interface Product {
    id: number;
    title: string;
    price: number;
    currency: string;
    images: string[];
    seller: {
        id: number;
        username: string;
        full_name: string;
    };
}

interface CheckoutData {
    product: Product;
    amount: number;
    currency: string;
    client_secret: string;
    purchase_id: number;
    order_number: string;
}

interface CheckoutProps {
    product: Product;
    client_secret: string;
    purchase_id: number;
    order_number: string;
    amount: number;
    currency: string;
}

declare global {
    interface Window {
        Stripe: any;
    }
}

export default function Checkout({ 
    product, 
    client_secret, 
    purchase_id, 
    order_number, 
    amount, 
    currency 
}: CheckoutProps) {
    const [stripe, setStripe] = useState<any>(null);
    const [elements, setElements] = useState<any>(null);
    const [cardElement, setCardElement] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load Stripe
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.onload = () => {
            const stripeInstance = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
            setStripe(stripeInstance);
            
            const elementsInstance = stripeInstance.elements({
                clientSecret: client_secret,
                appearance: {
                    theme: 'night',
                    variables: {
                        colorPrimary: '#3b82f6',
                        colorBackground: '#000000',
                        colorText: '#ffffff',
                        colorDanger: '#ef4444',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '8px',
                    },
                },
            });
            
            setElements(elementsInstance);
            
            const card = elementsInstance.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#ffffff',
                        '::placeholder': {
                            color: '#9ca3af',
                        },
                    },
                },
            });
            
            card.mount('#card-element');
            setCardElement(card);
            
            card.on('change', (event: any) => {
                if (event.error) {
                    setError(event.error.message);
                } else {
                    setError(null);
                }
            });
            
            setIsLoading(false);
        };
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, [client_secret]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!stripe || !elements || !cardElement) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (error) {
                setError(error.message);
                setIsProcessing(false);
            } else if (paymentIntent.status === 'succeeded') {
                // Redirect to success page
                router.visit(route('marketplace.payment.success', { order_number }));
            }
        } catch (err) {
            setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
                    <p className="text-white/70">Cargando checkout...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title={`Checkout - ${product.title}`} />
            
            <div className="min-h-screen bg-black">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-white/10">
                    <div className="max-w-4xl mx-auto px-6 py-6">
                        <div className="flex items-center gap-4 mb-4">
                            <Link href={route('marketplace.products.show', product.id)}>
                                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Volver al producto
                                </Button>
                            </Link>
                        </div>
                        
                        <h1 className="text-2xl font-bold text-white">Finalizar Compra</h1>
                        <p className="text-white/70">Orden #{order_number}</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Payment Form */}
                        <div>
                            <Card className="bg-white/5 border-white/10 apple-liquid-card">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Información de Pago
                                    </CardTitle>
                                    <CardDescription className="text-white/70">
                                        Ingresa los datos de tu tarjeta de crédito o débito
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">
                                                Datos de la Tarjeta
                                            </label>
                                            <div 
                                                id="card-element"
                                                className="p-4 border border-white/20 rounded-lg bg-white/5"
                                            />
                                            {error && (
                                                <div className="flex items-center gap-2 mt-2 text-red-400">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span className="text-sm">{error}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-white/70">
                                            <Shield className="h-4 w-4" />
                                            <span>Tu información está protegida con encriptación SSL</span>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isProcessing}
                                            className="w-full bg-blue-500/80 hover:bg-blue-500 text-white apple-liquid-button h-12"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Procesando Pago...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="h-4 w-4 mr-2" />
                                                    Pagar {currency} {amount.toFixed(2)}
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Security Info */}
                            <Card className="bg-white/5 border-white/10 apple-liquid-card mt-6">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-green-400 mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-white mb-2">Compra Segura</h3>
                                            <ul className="text-sm text-white/70 space-y-1">
                                                <li>• Encriptación SSL de 256 bits</li>
                                                <li>• Procesado por Stripe (PCI DSS compliant)</li>
                                                <li>• Protección contra fraude</li>
                                                <li>• Reembolso garantizado por 7 días</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Order Summary */}
                        <div>
                            <Card className="bg-white/5 border-white/10 apple-liquid-card sticky top-6">
                                <CardHeader>
                                    <CardTitle className="text-white">Resumen del Pedido</CardTitle>
                                </CardHeader>
                                
                                <CardContent className="space-y-6">
                                    {/* Product Info */}
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                                            {product.images.length > 0 ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-white/30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white mb-1">{product.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-white/70">
                                                <User className="h-3 w-3" />
                                                <span>{product.seller.username}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="space-y-3 border-t border-white/10 pt-4">
                                        <div className="flex justify-between text-white/80">
                                            <span>Precio del producto</span>
                                            <span>{currency} {product.price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-white/80">
                                            <span>Comisión de la plataforma</span>
                                            <span>{currency} {(amount - product.price).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-white/80">
                                            <span>Impuestos</span>
                                            <span>{currency} 0.00</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold text-white border-t border-white/10 pt-3">
                                            <span>Total</span>
                                            <span>{currency} {amount.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-white">Incluye:</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-white/80">
                                                <CheckCircle className="h-4 w-4 text-green-400" />
                                                <span>Acceso inmediato al producto</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-white/80">
                                                <CheckCircle className="h-4 w-4 text-green-400" />
                                                <span>Descarga ilimitada</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-white/80">
                                                <CheckCircle className="h-4 w-4 text-green-400" />
                                                <span>Soporte por 7 días</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-white/80">
                                                <CheckCircle className="h-4 w-4 text-green-400" />
                                                <span>Garantía de reembolso</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seller Info */}
                                    <div className="border-t border-white/10 pt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                                <span className="text-xs font-bold text-white">
                                                    {product.seller.username.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{product.seller.username}</div>
                                                <div className="text-xs text-white/70">Vendedor verificado</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

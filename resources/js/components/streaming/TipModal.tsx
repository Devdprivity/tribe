import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Heart, 
    X, 
    DollarSign,
    CreditCard,
    Gift,
    Star
} from 'lucide-react';

interface TipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSendTip: (amount: number, message?: string) => void;
    streamerName: string;
    streamerAvatar?: string;
}

export default function TipModal({ 
    isOpen, 
    onClose, 
    onSendTip, 
    streamerName,
    streamerAvatar 
}: TipModalProps) {
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const presetAmounts = [1, 5, 10, 25, 50, 100];

    const handlePresetClick = (presetAmount: number) => {
        setAmount(presetAmount.toString());
        setSelectedPreset(presetAmount);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
            setAmount(value);
            setSelectedPreset(null);
        }
    };

    const handleSendTip = async () => {
        const tipAmount = parseFloat(amount);
        if (tipAmount <= 0) return;

        setIsProcessing(true);
        
        try {
            await onSendTip(tipAmount, message);
            onClose();
            setAmount('');
            setMessage('');
            setSelectedPreset(null);
        } catch (error) {
            console.error('Error sending tip:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        if (!isProcessing) {
            onClose();
            setAmount('');
            setMessage('');
            setSelectedPreset(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
                onClick={handleClose}
            />
            <div className="relative max-w-md w-full">
                <Card className="bg-black/90 backdrop-blur-xl border border-white/20">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Heart className="h-5 w-5 text-red-500" />
                                Enviar Tip
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClose}
                                disabled={isProcessing}
                                className="text-white/70 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        {/* Streamer Info */}
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-medium">
                                    {streamerName.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <p className="text-white font-medium">{streamerName}</p>
                                <p className="text-white/60 text-sm">Streamer</p>
                            </div>
                        </div>

                        {/* Amount Selection */}
                        <div className="space-y-3">
                            <Label className="text-white font-medium">Cantidad del Tip</Label>
                            
                            {/* Preset Amounts */}
                            <div className="grid grid-cols-3 gap-2">
                                {presetAmounts.map((preset) => (
                                    <Button
                                        key={preset}
                                        variant={selectedPreset === preset ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePresetClick(preset)}
                                        className={`${
                                            selectedPreset === preset
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                                        }`}
                                    >
                                        ${preset}
                                    </Button>
                                ))}
                            </div>

                            {/* Custom Amount */}
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                <Input
                                    type="text"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    placeholder="0.00"
                                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/50"
                                />
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <Label className="text-white font-medium">Mensaje (opcional)</Label>
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="¡Excelente stream! 🎉"
                                className="bg-white/10 border-white/20 text-white placeholder-white/50"
                                maxLength={100}
                            />
                            <p className="text-xs text-white/50">
                                {message.length}/100 caracteres
                            </p>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                            <Label className="text-white font-medium">Método de Pago</Label>
                            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                                <CreditCard className="h-5 w-5 text-white/70" />
                                <span className="text-white text-sm">Tarjeta de Crédito</span>
                                <Badge variant="outline" className="text-xs">
                                    Stripe
                                </Badge>
                            </div>
                        </div>

                        {/* Total */}
                        {amount && (
                            <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-white font-medium">Total a pagar:</span>
                                    <span className="text-white font-bold text-lg">
                                        ${parseFloat(amount || '0').toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-xs text-white/70 mt-1">
                                    El tip se procesará de forma segura
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={isProcessing}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSendTip}
                                disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
                                className="flex-1 bg-red-500/80 hover:bg-red-500 text-white border-red-400/50"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Heart className="h-4 w-4 mr-2" />
                                        Enviar Tip
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Security Note */}
                        <div className="text-center">
                            <p className="text-xs text-white/50">
                                🔒 Pago seguro procesado por Stripe
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import CreateLiveStreamModal from '@/components/create-livestream-modal';

interface CreateLiveStreamContextType {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    isLoading: boolean;
    error: string | null;
}

const CreateLiveStreamContext = createContext<CreateLiveStreamContextType | undefined>(undefined);

export const useCreateLiveStream = () => {
    const context = useContext(CreateLiveStreamContext);
    if (!context) {
        throw new Error('useCreateLiveStream must be used within a CreateLiveStreamProvider');
    }
    return context;
};

interface CreateLiveStreamProviderProps {
    children: ReactNode;
}

export const CreateLiveStreamProvider: React.FC<CreateLiveStreamProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const openModal = useCallback(() => {
        console.log('Opening live stream modal');
        setError(null);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        console.log('Closing live stream modal');
        setIsOpen(false);
        setError(null);
        setIsLoading(false);
    }, []);

    const handleStreamCreated = useCallback((stream: any) => {
        console.log('Stream created successfully:', stream);
        setIsLoading(false);
        closeModal();
        
        // Redirigir después de cerrar el modal
        setTimeout(() => {
            if (stream.status === 'scheduled') {
                window.location.href = `/streaming/dashboard/${stream.id}`;
            } else {
                window.location.href = `/streaming/${stream.id}`;
            }
        }, 100);
    }, [closeModal]);

    const handleError = useCallback((errorMessage: string) => {
        console.error('Stream creation error:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
    }, []);

    const handleLoadingChange = useCallback((loading: boolean) => {
        setIsLoading(loading);
    }, []);

    return (
        <CreateLiveStreamContext.Provider value={{ 
            isOpen, 
            openModal, 
            closeModal, 
            isLoading, 
            error 
        }}>
            {children}
            {isOpen && (
                <CreateLiveStreamModal 
                    isOpen={isOpen} 
                    onClose={closeModal}
                    onStreamCreated={handleStreamCreated}
                    onError={handleError}
                    onLoadingChange={handleLoadingChange}
                />
            )}
        </CreateLiveStreamContext.Provider>
    );
};
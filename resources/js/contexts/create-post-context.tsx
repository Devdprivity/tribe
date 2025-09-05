import React, { createContext, useContext, useState, ReactNode } from 'react';
import CreatePostModal from '@/components/create-post-modal';

interface CreatePostContextType {
    openCreatePostModal: () => void;
    closeCreatePostModal: () => void;
    isCreatePostModalOpen: boolean;
}

const CreatePostContext = createContext<CreatePostContextType | undefined>(undefined);

interface CreatePostProviderProps {
    children: ReactNode;
}

export function CreatePostProvider({ children }: CreatePostProviderProps) {
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

    const openCreatePostModal = () => {
        console.log('Opening create post modal');
        console.log('Current state before:', isCreatePostModalOpen);
        setIsCreatePostModalOpen(true);
        console.log('State set to true');
    };

    const closeCreatePostModal = () => {
        console.log('Closing create post modal');
        setIsCreatePostModalOpen(false);
    };

    const handlePostCreated = (post: any) => {
        console.log('Post creado:', post);
        // Aquí podrías actualizar el estado global o recargar la página
        window.location.reload();
    };

    console.log('CreatePostProvider render - isCreatePostModalOpen:', isCreatePostModalOpen);

    return (
        <CreatePostContext.Provider value={{
            openCreatePostModal,
            closeCreatePostModal,
            isCreatePostModalOpen
        }}>
            {children}
            <CreatePostModal
                isOpen={isCreatePostModalOpen}
                onClose={closeCreatePostModal}
                onPostCreated={handlePostCreated}
            />
        </CreatePostContext.Provider>
    );
}

export function useCreatePost() {
    const context = useContext(CreatePostContext);
    if (context === undefined) {
        throw new Error('useCreatePost must be used within a CreatePostProvider');
    }
    return context;
}

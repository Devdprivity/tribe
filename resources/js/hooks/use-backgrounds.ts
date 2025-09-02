import { useState, useEffect } from 'react';

export interface BackgroundOption {
    id: string;
    name: string;
    path: string;
    description: string;
    category: 'nature' | 'abstract' | 'tech' | 'minimal' | 'gradient' | 'light' | 'dark' | 'geometric';
}

export const useBackgrounds = () => {
    const backgrounds: BackgroundOption[] = [
        {
            id: 'default',
            name: 'Fondo por Defecto',
            path: '/img/Theme/4k-resolution-5f0ynl6oa2mijckl.webp',
            description: 'Imagen de alta resolución por defecto',
            category: 'abstract'
        },
        {
            id: 'abstract-1',
            name: 'Abstracto Azul',
            path: '/img/Theme/4k-resolution-yuhxao6qc3x7865n.webp',
            description: 'Patrón abstracto en tonos azules',
            category: 'abstract'
        },
        {
            id: 'abstract-2',
            name: 'Abstracto Verde',
            path: '/img/Theme/4k-resolution-mgh6hc8idylqkhkc.webp',
            description: 'Patrón abstracto en tonos verdes',
            category: 'abstract'
        },
        {
            id: 'abstract-3',
            name: 'Abstracto Púrpura',
            path: '/img/Theme/4k-resolution-pvzqnhuuo6fqplkx.webp',
            description: 'Patrón abstracto en tonos púrpura',
            category: 'abstract'
        },
        {
            id: 'abstract-4',
            name: 'Abstracto Naranja',
            path: '/img/Theme/4k-resolution-7k79rf6zt26hjtz6.webp',
            description: 'Patrón abstracto en tonos naranja',
            category: 'abstract'
        },
        {
            id: 'abstract-5',
            name: 'Abstracto Rojo',
            path: '/img/Theme/4k-resolution-bp7tpijagzrxejth.webp',
            description: 'Patrón abstracto en tonos rojos',
            category: 'abstract'
        },
        {
            id: 'abstract-6',
            name: 'Abstracto Amarillo',
            path: '/img/Theme/4k-resolution-m7ugquyr7qvmtxim.webp',
            description: 'Patrón abstracto en tonos amarillos',
            category: 'abstract'
        },
        {
            id: 'abstract-7',
            name: 'Abstracto Rosa',
            path: '/img/Theme/4k-resolution-893cmcrazif8v7ai.webp',
            description: 'Patrón abstracto en tonos rosas',
            category: 'abstract'
        },
        {
            id: 'abstract-8',
            name: 'Abstracto Cian',
            path: '/img/Theme/4k-resolution-yuiszsq1uasfd9xj.webp',
            description: 'Patrón abstracto en tonos cian',
            category: 'abstract'
        },
        {
            id: 'developer-1',
            name: 'Desarrollador 1',
            path: '/img/Theme/wp1904108-developer-wallpapers.png',
            description: 'Wallpaper de desarrollador estilo gaming',
            category: 'tech'
        },
        {
            id: 'developer-2',
            name: 'Desarrollador 2',
            path: '/img/Theme/wp1904092-developer-wallpapers.png',
            description: 'Wallpaper de desarrollador minimalista',
            category: 'tech'
        },
        {
            id: 'developer-3',
            name: 'Desarrollador 3',
            path: '/img/Theme/wp1904079-developer-wallpapers.jpg',
            description: 'Wallpaper de desarrollador moderno',
            category: 'tech'
        },
        {
            id: 'developer-4',
            name: 'Desarrollador 4',
            path: '/img/Theme/wp1904065-developer-wallpapers.png',
            description: 'Wallpaper de desarrollador elegante',
            category: 'tech'
        },
        {
            id: 'developer-5',
            name: 'Desarrollador 5',
            path: '/img/Theme/wp1904059-developer-wallpapers.jpg',
            description: 'Wallpaper de desarrollador profesional',
            category: 'tech'
        },
        {
            id: 'dark-1',
            name: 'Dark',
            path: '/img/Theme/Dark-01.jpg',
            description: 'Fondo oscuro elegante y minimalista',
            category: 'dark'
        },
        {
            id: 'light-1',
            name: 'Light',
            path: '/img/Theme/Light-02.jpg',
            description: 'Fondo claro y luminoso',
            category: 'light'
        }
    ];

    return {
        backgrounds,
        loading: false
    };
};

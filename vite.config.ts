import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'


// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),

        VitePWA({
            registerType: 'autoUpdate',

            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}']
            },

            manifest: {
                name: 'React PWA (Vite)',
                short_name: 'ReactPWA',
                description: 'Um PWA feito com React, TypeScript e Vite',
                theme_color: '#3498db',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512-maskable.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ],
            },
        }),
    ],
})

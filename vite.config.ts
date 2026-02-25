import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'
import { VitePWA } from 'vite-plugin-pwa'


export default defineConfig({
    plugins: [
        react(),
        mkcert(),

        VitePWA({
            strategies: 'generateSW',
            registerType: 'autoUpdate',

            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern:/\/api\/events_list_cache/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'events-api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 3 * 24 * 60 * 60,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /\/health/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'health-cache',
                            networkTimeoutSeconds: 3,
                        },
                    },
                ],
            },

            manifest: {
                name: 'Calendario Anglo PWA 2025',
                short_name: 'CalendarioAnglo',
                description: 'Gerenciador de eventos academicos e pessoais',
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
            devOptions: {
                enabled: true
            }
        }),
    ],
    server:  {
        host:  true,
        port: 5173,
        allowedHosts: [
            'localhost',
            '127.0.0.1',
        ]
    }
})

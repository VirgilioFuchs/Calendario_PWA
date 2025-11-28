/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'zoom-in': 'zoomIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                'zoom-out': 'zoomOut 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                zoomIn: {
                    '0%': { opacity: '0', transform: 'scale(0.92)', filter: 'blur(2px)' },
                    '100%': { opacity: '1', transform: 'scale(1)', filter: 'blur(0)' },
                },
                zoomOut: {
                    '0%': { opacity: '0', transform: 'scale(1.08)', filter: 'blur(2px)' },
                    '100%': { opacity: '1', transform: 'scale(1)', filter: 'blur(0)' },
                },
            }
        },
    },
    plugins: [],
}
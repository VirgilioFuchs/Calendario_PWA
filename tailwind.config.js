/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                zoomIn: {
                    '0%': {opacity: '0', transform: 'scale(0.3)', filter: 'blur(10px)'},
                    '100%': {opacity: '1', transform: 'scale(1)', filter: 'blur(0)'},
                },
                zoomOut: {
                    '0%': {opacity: '0', transform: 'scale(3)', filter: 'blur(10px)'},
                    '100%': {opacity: '1', transform: 'scale(1)', filter: 'blur(0)'},
                },
            },
            animation: {
                'zoom-in': 'zoomIn 1.0s cubic-bezier(0.32, 0.72, 0, 1) forwards',
                'zoom-out': 'zoomOut 1.0s cubic-bezier(0.32, 0.72, 0, 1) forwards',
            },
        },
    },
    plugins: [],
}
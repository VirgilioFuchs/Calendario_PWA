/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
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
                slideUpFooter: {
                    '0%' : { transform: 'translateY(100%)'},
                    '100%' : { transform: 'translateY(0)'},
                },
                slideUpContent: {
                    '0%' : { transform: 'translateY(100%)', opacity: '0'},
                    '100%' : { transform: 'translateY(0)', opacity: '1'},
                },
                slideDownFooter: {
                    '0%' : { transform: 'translateY(0)'},
                    '100%' : { transform: 'translateY(100%)'},
                },
                slideDownContent: {
                    '0%' : { transform: 'translateY(0)', opacity: '1'},
                    '100%' : { transform: 'translateY(100%)', opacity: '0'},
                },
                slideInRight: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                slideInLeft: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
            },
            animation: {
                'zoom-in': 'zoomIn 1.0s cubic-bezier(0.32, 0.72, 0, 1) forwards',
                'zoom-out': 'zoomOut 1.0s cubic-bezier(0.32, 0.72, 0, 1) forwards',
                'slide-up-footer': 'slideUpFooter 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards',
                'slide-up-content': 'slideUpContent 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards',
                'slide-down-footer': 'slideDownFooter 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards',
                'slide-down-content': 'slideDownContent 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards',
                'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-in-left': 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            },
        },
    },
    plugins: [],
}
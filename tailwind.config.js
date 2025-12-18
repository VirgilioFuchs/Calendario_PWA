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
                // ===== ZOOM IN (YearView → MonthView) =====
                zoomIn: {
                    '0%': {
                        opacity: '0',
                        transform: 'scale(0.4)',
                        filter: 'blur(12px)',
                        borderRadius: '24px'
                    },
                    '50%': {
                        opacity: '0.8',
                        filter: 'blur(4px)'
                    },
                    '75%': {
                        transform: 'scale(1.02)',
                        filter: 'blur(1px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'scale(1)',
                        filter: 'blur(0)',
                        borderRadius: '0'
                    },
                },

                // ===== ZOOM OUT (MonthView → YearView) =====
                zoomOut:  {
                    '0%': {
                        opacity: '1',
                        transform: 'scale(1)',
                        filter: 'blur(0)',
                        borderRadius:  '0'
                    },
                    '40%': {
                        transform: 'scale(1.03)',
                        filter: 'blur(2px)'
                    },
                    '100%': {
                        opacity: '0',
                        transform:  'scale(0.4)',
                        filter: 'blur(12px)',
                        borderRadius: '24px'
                    },
                },

                // ===== FADE SCALE (Cards do YearView) =====
                fadeInScale: {
                    '0%': {
                        opacity:  '0',
                        transform: 'scale(0.85) translateY(20px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform:  'scale(1) translateY(0)'
                    },
                },

                // ===== SLIDE FOOTER =====
                slideUpFooter: {
                    '0%': {
                        transform: 'translateY(100%)',
                        opacity: '0'
                    },
                    '100%': {
                        transform: 'translateY(0)',
                        opacity:  '1'
                    },
                },
                slideDownFooter:  {
                    '0%': {
                        transform:  'translateY(0)',
                        opacity: '1'
                    },
                    '100%': {
                        transform: 'translateY(100%)',
                        opacity: '0'
                    },
                },

                // ===== SLIDE CONTENT =====
                slideUpContent: {
                    '0%': { transform: 'translateY(100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDownContent: {
                    '0%': { transform:  'translateY(0)', opacity: '1' },
                    '100%':  { transform: 'translateY(100%)', opacity: '0' },
                },

                // ===== SLIDE HORIZONTAL =====
                slideInRight: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                slideInLeft:  {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform:  'translateX(0)' },
                },
            },
            animation:  {
                // Zoom - Entrada lenta e suave, saída mais rápida
                'zoom-in':  'zoomIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'zoom-out': 'zoomOut 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',

                // Cards
                'fade-in-scale': 'fadeInScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',

                // Footer
                'slide-up-footer': 'slideUpFooter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-down-footer': 'slideDownFooter 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards',

                // Content
                'slide-up-content': 'slideUpContent 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-down-content': 'slideDownContent 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',

                // Horizontal
                'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-in-left': 'slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            },
        },
    },
    plugins:  [],
}
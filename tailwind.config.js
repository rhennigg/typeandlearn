/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Merriweather', 'serif'],
                display: ['Playfair Display', 'serif'],
            },
            colors: {
                background: {
                    light: '#F9F7F1', // Warm interactive paper
                    dark: '#0F172A',  // Deep slate
                },
                paper: '#F9F7F1',
                ink: {
                    DEFAULT: '#1F2937',
                    light: '#4B5563',
                },
                primary: {
                    DEFAULT: '#2563EB', // A refined blue
                    foreground: '#FFFFFF',
                },
                accent: {
                    DEFAULT: '#F59E0B', // Amber for highlights
                    faint: '#FEF3C7',
                }
            }
        },
    },
    plugins: [],
}

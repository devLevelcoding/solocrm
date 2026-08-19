/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:          '#0c0e14',
        surface:     '#141720',
        surface2:    '#1a1f2e',
        border:      '#222840',
        txt:         '#dce4f0',
        txt2:        '#6b7a96',
        accent:      '#f97316',
        'accent-dim':'#1c0e00',
        ok:          '#16a34a',
        danger:      '#dc2626',
      },
      fontFamily: {
        mono: ["'SF Mono'", 'Consolas', "'Cascadia Code'", 'monospace'],
      },
    },
  },
  plugins: [],
}

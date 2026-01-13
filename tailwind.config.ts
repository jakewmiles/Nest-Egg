import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0f1217',
        panel: '#151a22',
        accent: '#8bd3ff',
        success: '#4ade80',
        danger: '#f87171',
        muted: '#9aa4b2'
      }
    }
  },
  darkMode: 'class',
  plugins: []
};

export default config;

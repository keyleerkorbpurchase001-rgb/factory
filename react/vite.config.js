import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
// The photos, plan views, previews, brochures and spreadsheets stay in the repository root (public/ links to them).
export default defineConfig({plugins:[react()],server:{host:'127.0.0.1',port:5180,fs:{allow:['..']}},build:{chunkSizeWarningLimit:2000,outDir:'dist',emptyOutDir:true}});

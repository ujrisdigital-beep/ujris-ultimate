import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip', ext: '.gz' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    },
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: { toplevel: true },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-core';
          }
          // React Router
          if (id.includes('node_modules/react-router-dom')) {
            return 'react-router';
          }
          // Stripe
          if (id.includes('node_modules/@stripe') || id.includes('node_modules/stripe')) {
            return 'stripe';
          }
          // Large components - split into individual chunks
          if (id.includes('PresentationGenerator')) return 'presentation';
          if (id.includes('CaseStudyGenerator')) return 'case-study';
          if (id.includes('ShareableInfographic')) return 'infographics';
          if (id.includes('NegotiationSimulator')) return 'negotiation';
          if (id.includes('EvidenceHuntMode')) return 'evidence-hunt';
          if (id.includes('ICOComplaintGenerator')) return 'ico-generator';
          if (id.includes('MetadataShield')) return 'metadata';
          if (id.includes('CaseMatcher')) return 'case-matcher';
          if (id.includes('EvidenceGraph')) return 'evidence-graph';
          if (id.includes('LegalReasoningEngine')) return 'legal-reasoning';
          if (id.includes('HelperNetwork')) return 'helper-network';
          if (id.includes('DocumentMarketplace')) return 'marketplace';
          if (id.includes('EmergencyMode')) return 'emergency';
          if (id.includes('AdminDashboard')) return 'admin';
          if (id.includes('WarningSystem')) return 'warnings';
          // Personal case components
          if (id.includes('HearingRushPack')) return 'rush-pack';
          if (id.includes('ContradictionReport')) return 'contradictions';
          if (id.includes('EvidenceUploader')) return 'evidence-uploader';
          if (id.includes('TimelineView')) return 'timeline';
          if (id.includes('CaseDashboard')) return 'case-dashboard';
          // Group smaller components
          if (id.includes('VentoEstimator') || id.includes('EducationalHub') || id.includes('MediaGallery')) {
            return 'free-tools';
          }
          if (id.includes('CaseValueTracker') || id.includes('EvidenceBadgeSystem') || id.includes('ProgressStreaks')) {
            return 'justice-tools';
          }
          if (id.includes('WisdomCircle') || id.includes('SovereignShield') || id.includes('SubscriptionManager')) {
            return 'premium-tools';
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});

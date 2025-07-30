import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // 路径解析配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',

    // 生成源映射（生产环境可关闭以减小体积）
    sourcemap: false,

    // 构建优化
    minify: 'terser',

    // 分块策略
    rollupOptions: {
      output: {
        manualChunks: {
          // 将React相关库分离到单独的chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // 将UI库分离
          'ui-vendor': ['lucide-react'],

          // 将工具库分离
          'utils-vendor': ['zustand', '@tanstack/react-query']
        }
      }
    },

    // 资源处理
    assetsDir: 'assets',

    // 警告阈值
    chunkSizeWarningLimit: 1000
  },

  // 开发服务器配置
  server: {
    port: 5173,
    host: true,

    // 代理配置（如果需要）
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:3000',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, '')
    //   }
    // }
  },

  // 预览服务器配置
  preview: {
    port: 4173,
    host: true
  },

  // 基础路径（如果部署在子目录下需要设置）
  base: '/',

  // 环境变量前缀
  envPrefix: 'VITE_'
})

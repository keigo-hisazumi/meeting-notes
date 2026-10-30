import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// GitHub Pages では `/<リポジトリ名>/` 配下で配信されるため、ワークフローから渡されるベースパスを使う
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
});

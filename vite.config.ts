import { defineConfig } from 'vite';

// For GitHub Pages: if REPO_NAME is set, use it as base path
// Otherwise use root (for user/organization sites)
const getBasePath = () => {
  if (process.env.GITHUB_PAGES === 'true') {
    const repoName = process.env.REPO_NAME;
    return repoName ? `/${repoName}/` : '/';
  }
  return '/';
};

export default defineConfig({
  base: getBasePath(),
  server: {
    port: 3000,
    open: true
  }
});

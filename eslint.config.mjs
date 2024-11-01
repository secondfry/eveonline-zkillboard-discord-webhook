import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const config = tseslint.config(
  eslint.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['./data/*', './.prettierrc.mjs'],
  },
);

export default config;

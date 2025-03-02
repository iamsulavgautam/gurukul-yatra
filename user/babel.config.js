module.exports = {
  presets: [
    'babel-preset-expo',
    '@babel/preset-react', // Handles JSX for React
    '@babel/preset-typescript', // Handles TypeScript (.ts and .tsx)
  ],
  overrides: [
    {
      test: /\.(js|jsx|ts|tsx)$/, // Include .js, .jsx, .ts, .tsx files
      plugins: [
        [
          '@babel/plugin-transform-react-jsx',
          {
            runtime: 'automatic', // Ensure automatic JSX transform for React 18
          },
        ],
      ],
    },
  ],
};

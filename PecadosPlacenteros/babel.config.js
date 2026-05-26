module.exports = function (api) {
  // Detectar si estamos en entorno de test (Jest)
  const isTest = api.env('test');

  if (isTest) {
    // Config para Jest: sin babel-preset-expo (no disponible en Node puro)
    return {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript',
      ],
    };
  }

  // Config para Expo (Metro bundler): usa babel-preset-expo
  return {
    presets: ['babel-preset-expo'],
  };
};

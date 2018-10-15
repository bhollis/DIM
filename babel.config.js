module.exports = function(api) {
  api.cache(true);

  const isProduction = process.env.NODE_ENV === 'production';
  const plugins = [
    'lodash',
    'angularjs-annotate',
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { loose: true, useBuiltIns: true }],
    [
      '@babel/plugin-transform-runtime',
      {
        useESModules: true
      }
    ]
  ];

  if (isProduction) {
    // Optimize React, at the cost of debuggability
    plugins.push(
      '@babel/plugin-transform-react-constant-elements',
      '@babel/plugin-transform-react-inline-elements'
    );
  } else {
    // Configure hot reloading
    plugins.push('react-hot-loader/babel');
  }

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          loose: true,
          useBuiltIns: 'entry',
          shippedProposals: true
        }
      ],
      ['@babel/typescript'],
      ['@babel/preset-react', { useBuiltIns: true, loose: true }]
    ],
    plugins
  };
};

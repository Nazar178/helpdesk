const { createProxyMiddleware } = require('http-proxy-middleware');

const context = [
  '/api',
  '/Identity',
  '/weatherforecast',
  '/WeatherForecast'
];

module.exports = function (app) {
  const target = 'https://localhost:5001'; // backend .NET

  app.use(
    context,
    createProxyMiddleware({
      target,
      secure: false,
      changeOrigin: false
    })
  );
};

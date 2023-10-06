const express = require('express');

const docsRoute = require('./docs.route');
const ratesRoute = require('./rates.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/rates',
    route: ratesRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;

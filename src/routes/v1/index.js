const express = require('express');

const docsRoute = require('./docs.route');
const ratesRoute = require('./rates.route');
const paecelRoute = require('./parcel.route');
const taxRoute = require('./tax.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/rates',
    route: ratesRoute,
  },
  {
    path: '/parcel',
    route: paecelRoute,
  },
  {
    path: '/tax',
    route: taxRoute,
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

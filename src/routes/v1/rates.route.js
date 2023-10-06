const express = require('express');

const router = express.Router();

const { createConsola } = require('consola');

const logger = createConsola({
  // level: 4,
  // fancy: true | false
  formatOptions: {
    columns: 80,
    colors: true,
    compact: false,
    date: false,
  },
});

const resObject = {
  ok: true,
  data: {
    shipping_results: [
      {
        service_id: 10001,
        price: 10.55,
        method: 'Royal Mail Local',
        service_name: 'Standard',
      },
      {
        service_id: 10002,
        price: 20.99,
        method: 'Royal Mail Local',
        service_name: 'Express',
      },
    ],
  },
};

router
  .route('/')
  .get((req, res) => {
    logger.info(req.body);
    res.send(resObject);
  })
  .post((req, res) => {
    logger.info(req.body._embedded['fx:items']);
    res.send(resObject);
  });

module.exports = router;

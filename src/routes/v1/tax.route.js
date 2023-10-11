/* eslint-disable camelcase */
const express = require('express');

const { createConsola } = require('consola');

const { calculateTax } = require('../../services/taxes');

const router = express.Router();

const logger = createConsola({
  // level: 4,
  fancy: true,
  formatOptions: {
    columns: 80,
    colors: true,
    compact: false,
    date: false,
  },
});

router
  .route('/')
  .get((req, res) => {
    logger.info(req.body);
    res.send('what did you get?');
  })
  .post(async (req, res) => {
    const resObject = await calculateTax(req.body);
    logger.info('TAX', resObject);
    res.send(resObject);
  });

module.exports = router;

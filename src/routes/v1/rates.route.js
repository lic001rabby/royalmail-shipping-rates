/* eslint-disable camelcase */
const express = require('express');

const { createConsola } = require('consola');

const { prepareShipping } = require('../../services/shipping');

const router = express.Router();

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

router
  .route('/')
  .get((req, res) => {
    logger.info(req.body);
    res.send('what did you get?');
  })
  .post(async (req, res) => {
    logger.info(req.body);
    const resObject = await prepareShipping(req.body);
    res.send(resObject);
  });

module.exports = router;

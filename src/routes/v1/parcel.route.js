/* eslint-disable camelcase */
const express = require('express');

const { createOrder } = require('../../services/parcelorder');

const router = express.Router();


const { createConsola } = require('consola');
const { forEach } = require('../../config/logger');
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
    res.send('what did you get?');
  })
  .post(async (req, res) => {
    const resObject = await createOrder(req.body);
    res.send(resObject);
  });

module.exports = router;

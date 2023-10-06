const CalculateMethod = require('../../services/calculateMethod');

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

const prepareShipping = async (cartObject) => {
  const items = cartObject._embedded['fx:items'];
  const { origin_postal_code, item_count, total_weight } = cartObject._embedded['fx:shipment'];
  const { shipping_country, shipping_city, shipping_state, shipping_postal_code, total_order } = cartObject;
  logger.info('Prepare shipping', items);
  const calculatedMethods = new CalculateMethod();
  const shipping_results = await calculatedMethods.getMethods(shipping_country, total_order, total_weight);

  let formattedResults = shipping_results.map((item) => {
    return {
      service_id: item.id,
      price: item.methodPrice,
      method: "Royal Mail",
      service_name: item.shippingMethodNameClean,
    };
  });
  const responseObject = {
    ok: true,
    data: {
      shipping_results: formattedResults,
    },
  };
  return responseObject;
};

/* const resObject = {
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
 */
router
  .route('/')
  .get((req, res) => {
    logger.info(req.body);
    res.send("what did you get?");
  })
  .post(async (req, res) => {
    logger.info(req.body);
    const resObject = await prepareShipping(req.body);
    res.send(resObject);
  });

module.exports = router;

/* eslint-disable camelcase */
const express = require('express');
const CalculateMethod = require('../../services/calculateMethod');
const { calculateShipping, getPackageDetailsByBoxpacker, getPackageDetails } = require('../../services/calculator');

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
function sortRates(a, b) {
  if (a.cost === b.cost) return 0;
  return a.cost < b.cost ? -1 : 1;
}

const createPackage = (packageDetails) => {
  const { code, quantity, price, length, width, height, weight } = packageDetails;
  return {
    code,
    quantity,
    price,
    length,
    width,
    height,
    weight,
  };
};

const getMethods = async (boxes) => {
  const calculatedMethods = new CalculateMethod();
  return calculatedMethods.getMethods(country, value, weight);
};
const prepareShipping = async (cartObject) => {
  const items = cartObject._embedded['fx:items'];
  const packages = items.map((item) => {
    return createPackage(item);
  });
  logger.success('Prepare packages', packages);
  const boxes = getPackageDetailsByBoxpacker({ contents: packages });

  logger.success('Prepare boxes', boxes);
  const { origin_postal_code, item_count, total_weight } = cartObject._embedded['fx:shipment'];
  const { shipping_country, shipping_city, shipping_state, shipping_postal_code, total_order } = cartObject;
  logger.info('Prepare shipping', items);

  let shipping_results = [];

  const alt_boxes = getPackageDetails({
    contents: packages,
    total_weight,
    total_order,
    destination: { postal_code: shipping_postal_code, country: shipping_country },
  });
  logger.success('Prepare alt boxes', alt_boxes);

  const calculatedMethods = new CalculateMethod();
  let rates = {};

  if (alt_boxes.length === 1 && alt_boxes[0].size !== 'large') {
    const results = await calculatedMethods.getMethods(shipping_country, alt_boxes[0].value, alt_boxes[0].weight);
    shipping_results = shipping_results.concat(results);
    rates = results;
  } else {
    for (let i = 0; i < alt_boxes.length; i++) {
      if (alt_boxes[i].size === 'large') {
        continue;
      }
      const results = await calculatedMethods.getMethods(shipping_country, alt_boxes[i].value, alt_boxes[i].weight);
      shipping_results = shipping_results.concat(results);
      results.forEach((methodItem) => {
        const price = Number(methodItem.methodPrice);
        if (!rates[methodItem.shippingMethodName]) {
          rates[methodItem.shippingMethodName] = {};
          rates[methodItem.shippingMethodName].method = methodItem.shippingMethodName;
          rates[methodItem.shippingMethodName].service_id = methodItem.id;
          rates[methodItem.shippingMethodName].service_name = methodItem.shippingMethodNameClean;
          rates[methodItem.shippingMethodName].cost = price;
        } else {
          rates[methodItem.shippingMethodName].cost += price;
          rates[methodItem.shippingMethodName].multiple = true;
        }
      });
    }
  }

  logger.info('Shipping results', shipping_results);

  const sortedRates = Object.values(rates)
    .sort(sortRates)
    .filter((item) => {
      return item.multiple === true;
    });
  logger.info('Shipping results rates', sortedRates);
  const formattedResults = shipping_results.map((item) => {
    return {
      service_id: item.id,
      price: item.methodPrice,
      method: 'Royal Mail',
      service_name: item.shippingMethodNameClean,
    };
  });
  const responseObject = {
    ok: true,
    data: {
      shipping_results:
        alt_boxes.length === 1
          ? formattedResults
          : sortedRates.map((item) => {
            return {
              service_id: item.service_id,
              price: Number(item.cost).toFixed(2),
              method: item.method,
              service_name: item.service_name,
            };
          }),
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
    res.send('what did you get?');
  })
  .post(async (req, res) => {
    logger.info(req.body);
    const resObject = await prepareShipping(req.body);
    res.send(resObject);
  });

module.exports = router;

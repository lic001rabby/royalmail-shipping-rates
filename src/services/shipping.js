const CalculateMethod = require('./calculateMethod');
var ShippingResponse = require('foxy-shipping-endpoint');
const { calculateShipping, getPackageDetailsByBoxpacker, getPackageDetails } = require('./calculator');
const { createConsola } = require('consola');


const allowedMethods = {
  UK: [
    'UK_STANDARD_FIRST_CLASS_LETTER',
    'UK_STANDARD_FIRST_CLASS_LARGE_LETTER',
    'UK_STANDARD_FIRST_CLASS_SMALL_PARCEL',
    'UK_STANDARD_FIRST_CLASS_MEDIUM_PARCEL',
    'UK_STANDARD_SECOND_CLASS_LETTER',
    'UK_STANDARD_SECOND_CLASS_LARGE_LETTER',
    'UK_STANDARD_SECOND_CLASS_SMALL_PARCEL',
    'UK_STANDARD_SECOND_CLASS_MEDIUM_PARCEL',
    'UK_TRACKED_24_LARGE_LETTER',
    'UK_TRACKED_24_MEDIUM_PARCEL',
    'UK_TRACKED_24_SMALL_PARCEL',
    'UK_TRACKED_48_LARGE_LETTER',
    'UK_TRACKED_48_MEDIUM_PARCEL',
    'UK_TRACKED_48_SMALL_PARCEL',
  ],
  INTERNATIONAL: [
    'INTERNATIONAL_ECONOMY',
    'INTERNATIONAL_TRACKED_AND_SIGNED',
    'INTERNATIONAL_TRACKED',
    'INTERNATIONAL_SIGNED',
    'INTERNATIONAL_STANDARD',
  ],
};

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
function filterAllowedMethods(methods) {
  console.log(methods);
  const filteredMethods = methods.filter((item) => {
    if (item.countryCode === 'GB' && allowedMethods.UK.includes(item.shippingMethodName)) return true;

    // check if the shippingMethodName partially matches any of the items in the allowedMethods.INTERNATIONAL array
    if (
      item.countryCode !== 'GB' &&
      allowedMethods.INTERNATIONAL.some((method) => {
        return item.shippingMethodName.includes(method);
      })
    ) {
      return true;
    }
    return false;
  });
  return filteredMethods;
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
  //let shippingRates = new ShippingResponse(cartObject);
  logger.info('Prepare cart', cartObject);
  const items = cartObject._embedded['fx:items'];
  const packages = items.map((item) => {
    return createPackage(item);
  });
  logger.success('Prepare packages', packages);
  const boxes = getPackageDetailsByBoxpacker({ contents: packages });

  logger.success('Prepare boxes', boxes);
  const { total_weight } = cartObject._embedded['fx:shipment'];
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
          rates[methodItem.shippingMethodName].shippingMethodName = methodItem.shippingMethodName;
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

  let sortedRates = Object.values(rates)
    .sort(sortRates)
    .filter((item) => {
      return item.multiple === true;
    });
  logger.info('Shipping results rates', sortedRates);
  sortedRates = filterAllowedMethods(sortedRates);
  shipping_results = filterAllowedMethods(shipping_results);
  const formattedResults = shipping_results.map((item) => {
    return {
      service_id: item.id,
      price: item.methodPrice,
      method: 'Royal Mail',
      service_name: item.shippingMethodNameClean,
    };
  });
  let shippingRates = [];
  formattedResults.forEach((item) => {
    if (alt_boxes.length === 1 && alt_boxes[0].size === 'small' && item.service_name.includes('Medium')) {
    } else shippingRates.push(item);
  });

  logger.info('ShippingRates', shippingRates);
  //logger.info('Shipping results', formattedResults);
  let responseObject = {
    ok: true,
    data: {
      shipping_results:
        alt_boxes.length === 1
          ? shippingRates
          : sortedRates.map((item) => {
            return {
              service_id: item.service_id,
              price: Number(item.cost).toFixed(2),
              method: item.shippingMethodName,
              service_name: item.service_name,
            };
          }),
    },
  };
  if (formattedResults.length === 0 && sortedRates.length === 0) {
    responseObject = {
      ok: false,
      details:
        'Sorry, no shipping method is currently available for one or more items in your order. Please contact support.',
    };
  }
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
module.exports = {
  prepareShipping,
};

const { createConsola } = require('consola');

const fetch = require('node-fetch');
const config = require('../config/config');

let responseObject = {
  items: [
    {
      orderReference: 'test2',
      recipient: {
        address: {
          fullName: 'string',
          companyName: 'string',
          addressLine1: 'string',
          addressLine2: 'string',
          addressLine3: 'string',
          city: 'string',
          county: 'string',
          postcode: 'string',
          countryCode: 'GB',
        },
        phoneNumber: 'string',
        emailAddress: 'test1@example.com',
        addressBookReference: 'string',
      },
      sender: {
        tradingName: 'string',
        phoneNumber: 'string',
        emailAddress: 'test2@example.com',
      },
      billing: {
        address: {
          fullName: 'string',
          companyName: 'string',
          addressLine1: 'string',
          addressLine2: 'string',
          addressLine3: 'string',
          city: 'string',
          county: 'string',
          postcode: 'string',
          countryCode: 'GB',
        },
        phoneNumber: 'string',
        emailAddress: 'test3@example.com',
      },
      packages: [
        {
          weightInGrams: 1200,
          packageFormatIdentifier: 'smallParcel',
          customPackageFormatIdentifier: 'string',
          contents: [
            {
              name: 'string',
              SKU: 'string',
              quantity: 1,
              unitValue: 12,
              unitWeightInGrams: 600,
            },
            {
              name: 'string',
              SKU: 'string2',
              quantity: 1,
              unitValue: 12,
              unitWeightInGrams: 600,
            },
          ],
        },
      ],
      orderDate: '2019-08-24T14:15:22Z',
      subtotal: 22,
      shippingCostCharged: 2.7,
      total: 24.7,
      currencyCode: 'GBP',

      tags: [
        {
          key: 'orderType',
          value: 'test',
        },
      ],
      orderTax: 0,
    },
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

const preparePackage = (orderObject) => {
  const { id, customer_first_name, customer_last_name, customer_email, total_item_price, total_shipping, total_order, date_created } = orderObject;
  items.forEach((item) => {
    item.orderReference = id;
    item.recipient = {
      address: {
        fullName: `${customer_first_name} ${customer_last_name}`,
        companyName: 'string',
        addressLine1: 'string',
        addressLine2: 'string',
        addressLine3: 'string',
        city: 'string',
        county: 'string',
        postcode: 'string',
        countryCode: 'GB',
      },
      phoneNumber: 'string',
      emailAddress: customer_email,
      addressBookReference: 'string',
    };
    item.sender = {
      tradingName: 'string',
      phoneNumber: 'string',
    };
    item.billing = {
      address: {
        fullName: `${customer_first_name} ${customer_last_name}`,
        companyName: 'string',
        addressLine1: 'string',
        addressLine2: 'string',
        addressLine3: 'string',
        city: 'string',
        county: 'string',
        postcode: 'string',
        countryCode: 'GB',
      },
      phoneNumber: 'string',
      emailAddress: customer_email,
    };
    item.subtotal = total_item_price;
    item.shippingCostCharged = total_shipping;
    item.total = total_order;
  });
  logger.info('orderObject', orderObject);
  return responseObject;
};

const createOrder = async (orderBody) => {
  const shippingPackage = JSON.stringify(preparePackage(orderBody));
  logger.info('shippingPackage', shippingPackage);
  const rmResponse = await fetch('https://api.parcel.royalmail.com/api/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.royalmail.key}` },
    body: shippingPackage,
  });
  logger.info('responseObject', rmResponse);
  return rmResponse;
};

module.exports = {
  createOrder,
};

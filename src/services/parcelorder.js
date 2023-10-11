const { createConsola } = require('consola');

const fetch = require('node-fetch');
const config = require('../config/config');

const responseObject = {
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
const addItems = (orderObject) => {
  const packageItems = [];
  orderObject._embedded['fx:items'].forEach((item) => {
    if (item._embedded['fx:item_category'].code === 'shipped_products')
      packageItems.push({
        name: item.name,
        SKU: item.code,
        quantity: item.quantity,
        unitValue: item.price,
        unitWeightInGrams: item.weight * 1000,
      });
  });
  return packageItems;
};
const getAddress = (addressObject) => {
  return {
    fullName: `${addressObject.first_name} ${addressObject.last_name}`,
    companyName: addressObject.company,
    addressLine1: addressObject.address1,
    addressLine2: addressObject.address2,
    city: addressObject.city,
    county: addressObject.region,
    postcode: addressObject.customer_postal_code || addressObject.postal_code,
    countryCode: addressObject.customer_country || addressObject.country,
  };
};

const getPackageSize = (addressObject) => {
  const shippingServiceName = addressObject.shipping_service_description;
  let packageSize = 'undefined';
  if (shippingServiceName.includes('Small Parcel')) {
    packageSize = 'smallParcel';
  } else if (shippingServiceName.includes('Medium Parcel')) {
    packageSize = 'mediumParcel';
  } else if (shippingServiceName.includes('Large Letter')) {
    packageSize = 'largeLetter';
  }
  return packageSize;
};

const preparePackage = (orderObject) => {
  const { id, total_item_price, total_tax, total_shipping, total_order, customer_email, date_created } = orderObject;
  
  logger.info('orderObject', orderObject._embedded['fx:billing_addresses']);
  const packageItems = addItems(orderObject);
  const billingAddress = getAddress(orderObject._embedded['fx:billing_addresses'][0]);
  const shippingAddress = getAddress(orderObject._embedded['fx:shipments'][0]);
  const packageSize = getPackageSize(orderObject._embedded['fx:shipments'][0]);
  responseObject.items[0].recipient.address = shippingAddress;
  let totalWeight = 0;
  packageItems.forEach((item) => {
    console.log(item);
    totalWeight += item.unitWeightInGrams;
  });
  const item = {
    recipient: {
      address: shippingAddress,
      emailAddress: customer_email,
    },
    billing: {
      address: billingAddress,
      emailAddress: customer_email,
    },
    packages: [
      {
        weightInGrams: totalWeight + 150,
        packageFormatIdentifier: packageSize,
        contents: packageItems,
      },
    ],
    orderDate: date_created,
    subtotal: total_item_price,
    shippingCostCharged: total_shipping,
    total: total_order,
    currencyCode: 'GBP',
    orderTax: total_tax,
    orderReference: id,
  }



  responseObject.items[0] = item;
  console.log(responseObject);
  return responseObject;
}; 
    const createOrder = async (orderBody) => {
    const shippingPackage = JSON.stringify(preparePackage(orderBody));
  const rmResponse = await fetch('https://api.parcel.royalmail.com/api/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.royalmail.key}` },
    body: shippingPackage,
  });
  return rmResponse;
};

module.exports = {
  createOrder,
};

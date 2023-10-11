/* eslint-disable camelcase */
const SalesTax = require('sales-tax');

const taxResponse = {
  ok: true,
  details: '',
  name: 'Custom Taxes',
  expand_taxes: [],
  total_amount: 0.6,
  total_rate: 0.119,
};

const calculateTax = async (cartObject) => {
  const { shipping_country, total_item_price } = cartObject;
  console.log(cartObject);
  console.log('TOATL', total_item_price);
  const amountWithTax = await SalesTax.getAmountWithSalesTax(shipping_country, null, total_item_price);
  console.log(amountWithTax);

  taxResponse.expand_taxes = amountWithTax.details.map((tax) => {
    return {
      name: tax.type,
      rate: tax.rate,
      amount: tax.amount,
    };
  });
  amountWithTax.details.forEach((tax, index) => {
    if (index === 0) taxResponse.name = tax.type.toUpperCase();
    else taxResponse.name = `${taxResponse.name}, ${tax.type.toUpperCase()}`;
  });
  taxResponse.total_amount = amountWithTax.total - amountWithTax.price;
  taxResponse.total_rate = amountWithTax.rate;

  return taxResponse;
};

module.exports = {
  calculateTax,
};

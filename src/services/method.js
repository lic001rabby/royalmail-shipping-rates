class RoyalMailShippingMethod {
  constructor(
    shippingMethodName,
    shippingMethodNameClean,
    countryCode,
    methodPrice,
    insuranceValue,
    minimumWeight,
    maximumWeight,
    size,
    id
  ) {
    this.shippingMethodName = shippingMethodName;
    this.shippingMethodNameClean = shippingMethodNameClean;
    this.countryCode = countryCode;
    this.methodPrice = methodPrice;
    this.insuranceValue = insuranceValue;
    this.minimumWeight = minimumWeight;
    this.maximumWeight = maximumWeight;
    this.size = size;
    this.id = id;
  }
}

module.exports = RoyalMailShippingMethod;

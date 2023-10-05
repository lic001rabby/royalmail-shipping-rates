export default class RoyalMailShippingMethod {
  constructor(
    shippingMethodName,
    shippingMethodNameClean,
    countryCode,
    methodPrice,
    insuranceValue,
    minimumWeight,
    maximumWeight,
    size
  ) {
    this.shippingMethodName = shippingMethodName;
    this.shippingMethodNameClean = shippingMethodNameClean;
    this.countryCode = countryCode;
    this.methodPrice = methodPrice;
    this.insuranceValue = insuranceValue;
    this.minimumWeight = minimumWeight;
    this.maximumWeight = maximumWeight;
    this.size = size;
  }
}

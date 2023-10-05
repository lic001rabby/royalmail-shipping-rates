export default class CalculateMethod {
  constructor() {
    // Set the default csv values
    this._csvCountryCode = '../data/1_countryToZone.csv';
    this._csvZoneToDeliverMethod = '../data/2_zoneToDeliveryMethod.csv';
    this._csvDeliveryMethodMeta = '../data/3_deliveryMethodMeta.csv';
    this._csvDeliveryToPrice = '../data/4_deliveryToPrice.csv';
    this._csvCleanNameToMethod = '../data/5_cleanNameToMethod.csv';
    this._csvCleanNameMethodGroup = '../data/6_cleanNameMethodGroup.csv';
  }

  /**
   * Method to run the appropriate sorting methods
   * in the correct order based on the country code,
   * package value, and package weight. Returns the
   * sorted values to the RoyalMailMethod class to be
   * converted into objects.
   *
   * @param {string} country_code
   * @param {number} package_value
   * @param {number} package_weight
   *
   * @return {Array}
   */
  getMethods(country_code, package_value, package_weight) {
    const data = new Meanbee_RoyalmailPHPLibrary_Data(
      this._csvCountryCode,
      this._csvZoneToDeliverMethod,
      this._csvDeliveryMethodMeta,
      this._csvDeliveryToPrice,
      this._csvCleanNameToMethod,
      this._csvCleanNameMethodGroup
    );

    const sortedDeliveryMethods = [data.calculateMethods(country_code, package_value, package_weight)];

    const results = [];

    sortedDeliveryMethods.forEach((shippingMethod) => {
      shippingMethod.forEach((item) => {
        const method = new Meanbee_RoyalmailPHPLibrary_Src_Method();
        method.countryCode = country_code;
        method.shippingMethodName = item.shippingMethodName;
        method.minimumWeight = item.minimumWeight;
        method.maximumWeight = item.maximumWeight;
        method.methodPrice = item.methodPrice;
        method.insuranceValue = item.insuranceValue;
        method.shippingMethodNameClean = item.shippingMethodNameClean;

        if (item.size) {
          method.size = item.size;
        }

        results.push(method);
      });
    });

    return results;
  }
}

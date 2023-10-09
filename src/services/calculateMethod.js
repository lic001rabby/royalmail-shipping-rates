const RoyalMailData = require('./data');
const RoyalMailShippingMethod = require('./method');

class CalculateMethod {
  constructor() {
    // Set the default csv values
    this._csvCountryCode = 'src/csvdata/1_countryToZone.csv';
    this._csvZoneToDeliverMethod = 'src/csvdata/2_zoneToDeliveryMethod.csv';
    this._csvDeliveryMethodMeta = 'src/csvdata/3_deliveryMethodMeta.csv';
    this._csvDeliveryToPrice = 'src/csvdata/4_deliveryToPrice.csv';
    this._csvCleanNameToMethod = 'src/csvdata/5_cleanNameToMethod.csv';
    this._csvCleanNameMethodGroup = 'src/csvdata/6_cleanNameMethodGroup.csv';
    this._allowedMethods = [
      'Tracked 24',
      'Tracked 48',
      'International Economy',
      'International Standard',
      'International Tracked and Signed',
      'International Tracked',
      'International Signed',
    ];
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
  async getMethods(country_code, package_value, package_weight) {
    const data = new RoyalMailData(
      this._csvCountryCode,
      this._csvZoneToDeliverMethod,
      this._csvDeliveryMethodMeta,
      this._csvDeliveryToPrice,
      this._csvCleanNameToMethod,
      this._csvCleanNameMethodGroup
    );

    const sortedDeliveryMethods = await data.calculateMethods(country_code, package_value, package_weight);

    const results = [];
    let idTrack = 10001;

    sortedDeliveryMethods.forEach((item) => {
      const method = new RoyalMailShippingMethod();
      method.countryCode = country_code;
      method.shippingMethodName = item.shippingMethodName;
      method.minimumWeight = item.minimumWeight;
      method.maximumWeight = item.maximumWeight;
      method.methodPrice = item.methodPrice;
      method.insuranceValue = item.insuranceValue;
      method.shippingMethodNameClean = item.shippingMethodNameClean;
      method.id = idTrack++;

      if (item.size) {
        method.size = item.size;
      }

      results.push(method);
    });

    console.log('important', results[0]);
    return results;
    // return only the ones where shishippingMethodNameClean contains any substring from this._allowedMethods
    /*     return results.filter((item) => {
          return this._allowedMethods.some((allowedMethod) => {
            console.log(allowedMethod + ':' + item.shippingMethodNameClean + ':' + item.shippingMethodName);
    
            return item.shippingMethodNameClean.includes(allowedMethod);
          });
        }); */
  }
}

module.exports = CalculateMethod;

const fs = require('fs');
const Papa = require('papaparse');
export default class Data {
  /**
   * Constructor for the class.
   * Initializes all the instance variables.
   */
  constructor() {
    // Instance variables
    this._country = '';
    this._weight = 0;
    this._weight_unit = '';
    this._cart_total = 0;
    this._negative_weight = false;

    // Constants to link to the appropriate columns in the CSV files
    this.COUNTRY_CODE = 0;
    this.WORLD_ZONE = 0;
    this.SHIPPING_METHOD = 0;
    this.METHOD_MIN_VALUE = 1;
    this.METHOD_MAX_VALUE = 2;
    this.METHOD_MIN_WEIGHT = 1;
    this.METHOD_MAX_WEIGHT = 2;
    this.METHOD_PRICE = 3;
    this.METHOD_INSURANCE_VALUE = 4;
    this.METHOD_NAME_CLEAN = 4;
    this.METHOD_SIZE = 5;

    // Maps the method group name to the clean name and
    // the related method
    this.mappingCleanNameToMethod = [];

    // Maps the method group name to the clean name, to
    // allow for printing just the clean names to the user
    this.mappingCleanNameMethodGroup = [];

    // 1st array used, stores the csv of country to zone
    this.mappingCountryToZone = [];

    // 2nd array used, stores the csv of zone to method
    this.mappingZoneToMethod = [];

    // 3rd array used, stores the csv of shipping method
    // to the meta information. This includes the insurance
    // amount, and the corresponding price levels
    this.mappingMethodToMeta = [];

    // 4th array used, stores the csv of the delivery method
    // to the weight and price
    this.mappingDeliveryToPrice = [];

    // Array to temporarily hold the sorted country code methods
    this.sortedCountryCodeMethods = [];

    // Array to temporarily hold the sorted world zone to methods
    this.sortedZoneToMethods = [];

    // Array to temporarily hold the sorted method meta data
    this.sortedMethodToMeta = [];

    // Array to temporarily hold the sorted methods
    this.sortedDeliveryToPrices = [];
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
  calculateMethods(country_code, package_value, package_weight) {
    this.sortedCountryCodeMethods = [this.getCountryCodeData(country_code, this.mappingCountryToZone)];

    this.sortedZoneToMethods = [this.getZoneToMethod(this.sortedCountryCodeMethods, this.mappingZoneToMethod)];

    this.sortedMethodToMeta = [this.getMethodToMeta(package_value, this.sortedZoneToMethods, this.mappingMethodToMeta)];

    this.sortedDeliveryToPrices = this.getMethodToPrice(
      package_weight,
      this.sortedMethodToMeta,
      this.mappingDeliveryToPrice
    );

    return this.sortedDeliveryToPrices;
  }

  /**
   *
   * Method to return a 2d array of world zones a country
   * (by its country code) is located in.
   *
   * @param {string} country_code
   * @param {Array} mappingCountryToZone
   *
   * @return {Array}
   */
  getCountryCodeData(country_code, mappingCountryToZone) {
    // Get All array items that match the country code
    const countryCodeData = [];
    mappingCountryToZone.forEach((item) => {
      if (item[this.COUNTRY_CODE] === country_code) {
        item.forEach((keys) => {
          countryCodeData.push(keys);
        });
      }
    });

    // Clean up the array removing excess values
    countryCodeData.forEach((value, key) => {
      if (value === country_code) {
        delete countryCodeData[key];
      }
    });

    return countryCodeData.filter((value) => value !== undefined);
  }

  /**
   * Method to return a 2d array of possible delivery methods based
   * on the given world zones a country is in.
   *
   * @param {Array} sortedCountryCodeMethods
   * @param {Array} mappingZoneToMethod
   *
   * @return {Array}
   */
  getZoneToMethod(sortedCountryCodeMethods, mappingZoneToMethod) {
    const mappingZoneData = [];
    sortedCountryCodeMethods.forEach((value) => {
      value.forEach((zone) => {
        mappingZoneToMethod.forEach((item) => {
          if (item[this.WORLD_ZONE] === zone) {
            item.forEach((keys) => {
              mappingZoneData.push(keys);
            });
          }
        });
      });
    });

    // Clean up the array removing excess values
    sortedCountryCodeMethods.forEach((item) => {
      item.forEach((zone) => {
        mappingZoneData.forEach((value, key) => {
          if (value === zone) {
            delete mappingZoneData[key];
          }
        });
      });
    });

    return mappingZoneData.filter((value) => value !== undefined);
  }

  /**
   * Method to return a 2d array of the meta data for each
   * given allowed shipping method and the given package
   * value.
   *
   * @param {number} packageValue
   * @param {Array} sortedZoneToMethods
   * @param {Array} mappingMethodToMeta
   *
   * @return {Array}
   */
  getMethodToMeta(packageValue, sortedZoneToMethods, mappingMethodToMeta) {
    const mappingZoneMethodData = [];
    sortedZoneToMethods.forEach((value) => {
      value.forEach((method) => {
        mappingMethodToMeta.forEach((item) => {
          if (item[this.SHIPPING_METHOD] === method) {
            if (packageValue >= item[this.METHOD_MIN_VALUE] && packageValue <= item[this.METHOD_MAX_VALUE]) {
              mappingZoneMethodData.push([item]);
            }
          }
        });
      });
    });

    return mappingZoneMethodData.filter((value) => value.length > 0);
  }

  /**
   * Method to return a 2d array of sorted shipping methods based on
   * the weight of the item and the allowed shipping methods. Returns
   * a 2d array to be converting into objects by the RoyalMailMethod
   * class. Also adds the pretty text from the meta table to the
   * correct shipping method, to allow for less text in the delivery
   * to price csv.
   *
   * @param {number} package_weight
   * @param {Array} sortedMethodToMeta
   * @param {Array} mappingDeliveryToPrice
   *
   * @return {Array}
   */
  getMethodToPrice(package_weight, sortedMethodToMeta, mappingDeliveryToPrice) {
    const mappingDeliveryToPriceData = [];
    sortedMethodToMeta.forEach((method) => {
      method.forEach((meta) => {
        Object.keys(meta).forEach((key) => {
          const methodData = meta[key];
          mappingDeliveryToPrice.forEach((item) => {
            if (item[this.SHIPPING_METHOD] === methodData) {
              if (package_weight >= item[this.METHOD_MIN_WEIGHT] && package_weight <= item[this.METHOD_MAX_WEIGHT]) {
                const resultArray = {
                  shippingMethodName: item[this.SHIPPING_METHOD],
                  minimumWeight: item[this.METHOD_MIN_WEIGHT],
                  maximumWeight: item[this.METHOD_MAX_WEIGHT],
                  methodPrice: item[this.METHOD_PRICE],
                  insuranceValue: item[this.METHOD_INSURANCE_VALUE],
                  shippingMethodNameClean: method[this.METHOD_NAME_CLEAN],
                };

                if (item[this.METHOD_SIZE]) {
                  resultArray.size = item[this.METHOD_SIZE];
                }

                mappingDeliveryToPriceData.push(resultArray);
              }
            }
          });

        });
      });
    });

    return mappingDeliveryToPriceData;
  }

  /**
   * Reads the given csv into a 2d array
   *
   * @param {string} filename
   * @param {string} delimiter
   *
   * @return {Array}
   */
async function csvToArray(filename = '', delimiter = ',') {
  try {
    const fileData = await fs.promises.readFile(filename, 'utf8');

    const results = Papa.parse(fileData, {
      delimiter,
      header: false, // Set to true if the CSV file has headers
    });

    if (results.errors.length > 0) {
      throw new Error(`CSV parsing error: ${results.errors.join(', ')}`);
    }

    return results.data;
  } catch (error) {
    throw new Error(`Unable to load the CSV file '${filename}': ${error.message}`);
  }
}

setCountry(data) {
  this._country = data;
}

getCountry() {
  return this._country;
}

setWeightUnit(unit) {
  this._weight_unit = unit;
}

getWeightUnit() {
  return this._weight_unit;
}

setWeight(data) {
  this._weight = data;
}

setCartTotal(value) {
  this._cart_total = value;
}

getCartTotal() {
  return this._cart_total;
}

setNegativeWeight(value) {
  this._negative_weight = value;
}

getNegativeWeight() {
  return this._negative_weight;
}

// Return the weight in grams
getWeight() {
  const unit = this.getWeightUnit();
  let weight = this._weight;

  switch (unit) {
    case 'kg':
      // do nothing, as default royalmail value
      break;
    case 'lb':
      weight *= 0.45359237;
      break;
    default:
      // case 'g'
      weight /= 1000;
      break;
  }

  return weight;
}
}

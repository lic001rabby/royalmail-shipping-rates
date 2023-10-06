
import Data from "./data";
import CalculateMethod from "./calculateMethod";



// Replace these functions with your actual implementation
function getMinDimension(width, length, height) {
  const dimensions = { width, length, height };
  const result = Object.keys(dimensions).reduce((minDim, dim) => {
    return dimensions[dim] < dimensions[minDim] ? dim : minDim;
  }, 'width'); // Default to 'width' if all dimensions are equal
  return result;
}
function getPackageDetails(package) {
  const defaultLength = this.defaultSize && this.defaultSize.length ? this.defaultSize.length : 1;
  const defaultWidth = this.defaultSize && this.defaultSize.width ? this.defaultSize.width : 1;
  const defaultHeight = this.defaultSize && this.defaultSize.height ? this.defaultSize.height : 1;

  let weight = 0;
  let volume = 0;
  const products = [];

  // Get weight of order
  for (const item_id in package.contents) {
    const values = package.contents[item_id];
    const _product = values.data;
    const finalWeight = wc_get_weight(parseFloat(_product.weight) <= 0 ? this.defaultWeight : parseFloat(_product.weight), 'kg');
    weight += finalWeight * values.quantity;
    const value = _product.price;
    const length = parseFloat(wc_get_dimension(parseFloat(_product.length) <= 0 ? defaultLength : parseFloat(_product.length), 'cm'));
    const height = parseFloat(wc_get_dimension(parseFloat(_product.height) <= 0 ? defaultHeight : parseFloat(_product.height), 'cm'));
    const width = parseFloat(wc_get_dimension(parseFloat(_product.weight) <= 0 ? defaultWidth : parseFloat(_product.weight), 'cm'));
    const minDimension = Math.min(width, length, height);
    products.push({
      weight: wc_get_weight(parseFloat(_product.weight) <= 0 ? this.defaultWeight : parseFloat(_product.weight), 'kg'),
      quantity: values.quantity,
      length,
      height,
      width,
      item_id,
      value,
      min_dimension: minDimension,
    });
    volume += length * height * width;
  }

  const maxWeights = this.getMaxWeight(package, weight);
  products.sort((a, b) => a.min_dimension - b.min_dimension);

  const packs = [];
  let packsCount = 1;
  packs[packsCount] = {
    weight: 0,
    length: 0,
    height: 0,
    width: 0,
    quantity: 0,
    value: 0,
  };
  let i = 0;

  for (const product of products) {
    const maxWeight = maxWeights.own_package;

    while (product.quantity > 0) {
      if (!packs[packsCount].weight) {
        packs[packsCount].weight = 0;
      }
      if (!packs[packsCount].quantity) {
        packs[packsCount].quantity = 0;
      }
      packs[packsCount].weight += product.weight;
      packs[packsCount].length = product.min_dimension === 'length' ? packs[packsCount].length + product.length : product.length;
      packs[packsCount].height = product.min_dimension === 'height' ? packs[packsCount].height + product.height : product.height;
      packs[packsCount].width = product.min_dimension === 'width' ? packs[packsCount].width + product.width : product.width;
      packs[packsCount].item_id = product.item_id;
      packs[packsCount].quantity += 1;
      packs[packsCount].value += parseFloat(product.value).toFixed(2);
      const packageHeight = Math.min(packs[packsCount].width, packs[packsCount].length, packs[packsCount].height);

      if (packs[packsCount].weight > maxWeight) {
        packs[packsCount].value -= parseFloat(product.value).toFixed(2);
        packs[packsCount].length = product.min_dimension === 'length' ? packs[packsCount].length - product.length : product.length;
        packs[packsCount].height = product.min_dimension === 'height' ? packs[packsCount].height - product.height : product.height;
        packs[packsCount].width = product.min_dimension === 'width' ? packs[packsCount].width - product.width : product.width;
        packs[packsCount].quantity -= 1;
        packs[packsCount].weight -= product.weight;

        packsCount++;
        packs[packsCount] = {
          weight: product.weight,
          length: product.length,
          height: product.height,
          width: product.width,
          item_id: product.item_id,
          quantity: 1,
          value: parseFloat(product.value).toFixed(2),
        };
      }
      product.quantity--;
    }
    i++;
  }
  return packs;
}
/**
 * Sorts rates based on their cost.
 *
 * @param {type} a - the first rate
 * @param {type} b - the second rate
 * @return {number} - the result of the comparison
 */
function sortRates(a, b) {
  if (a.cost === b.cost) return 0;
  return a.cost < b.cost ? -1 : 1;
}
/**
 * Determines if the given dimensions represent a small parcel.
 *
 * @param {object} dimensions - The dimensions of the parcel.
 * @param {number} dimensions.weight - The weight of the parcel.
 * @param {number} dimensions.length - The length of the parcel.
 * @param {number} dimensions.width - The width of the parcel.
 * @param {number} dimensions.height - The height of the parcel.
 * @return {boolean} Returns true if the dimensions represent a small parcel, false otherwise.
 */
function isSmallParcel(dimensions) {
  if (dimensions.weight > 2) {
    return false;
  }

  if (dimensions.length > 45) {
    return false;
  }

  if (dimensions.width > 35) {
    return false;
  }

  if (dimensions.height > 16) {
    return false;
  }

  return true;
}

function isMediumParcel(dimensions) {
  if (dimensions.weight > 20) {
    return false;
  }

  if (dimensions.length > 61) {
    return false;
  }

  if (dimensions.width > 46) {
    return false;
  }

  if (dimensions.height > 46) {
    return false;
  }

  return true;
}


function filterMethodsBySize(methods, size) {
  return methods.filter((value) => value.size !== size);
}

function getRoyalMailBoxes(parcelSize) {
  const boxes = [];

  if (parcelSize === 'small') {
    boxes.push(
      new WPRuby_RoyalMail_Box()
        .setReference('Small Parcel')
        .setOuterLength(450)
        .setOuterWidth(350)
        .setOuterDepth(160)
        .setEmptyWeight(0)
        .setInnerLength(450)
        .setInnerWidth(350)
        .setInnerDepth(160)
        .setMaxWeight(2000)
    );
  } else if (parcelSize === 'medium') {
    boxes.push(
      new WPRuby_RoyalMail_Box()
        .setReference('Small Parcel')
        .setOuterLength(450)
        .setOuterWidth(350)
        .setOuterDepth(160)
        .setEmptyWeight(0)
        .setInnerLength(450)
        .setInnerWidth(350)
        .setInnerDepth(160)
        .setMaxWeight(2000)
    );

    boxes.push(
      new WPRuby_RoyalMail_Box()
        .setReference('Medium Parcel')
        .setOuterLength(610)
        .setOuterWidth(460)
        .setOuterDepth(460)
        .setEmptyWeight(0)
        .setInnerLength(610)
        .setInnerWidth(460)
        .setInnerDepth(460)
        .setMaxWeight(20000)
    );
  }

  return boxes;
}
function getMaxWeight(package, totalWeight, parcelSize) {
  const country = package.destination.country;

  const maxWeights = {
    own_package: country === 'GB' ? 30 : 2,
  };

  if (country === 'GB') {
    if (totalWeight <= 2 && parcelSize === 'small') {
      return {
        own_package: 2,
      };
    } else {
      return {
        own_package: 20,
      };
    }
  } else {
    return {
      own_package: maxWeights.own_package,
    };
  }
}

function getPackageDetails(package, defaultSize, defaultWeight) {
  const defaultLength = defaultSize.length || 1;
  const defaultWidth = defaultSize.width || 1;
  const defaultHeight = defaultSize.height || 1;

  let weight = 0;
  let volume = 0;
  const products = [];

  // Get weight of order
  for (const item_id in package.contents) {
    const values = package.contents[item_id];
    const _product = values.data;

    const final_weight = parseFloat(_product.get_weight()) <= 0 ? defaultWeight : parseFloat(_product.get_weight());
    weight += final_weight * values.quantity;
    const value = _product.get_price();

    const length = parseFloat(_product.get_length()) <= 0 ? defaultLength : parseFloat(_product.get_length());
    const height = parseFloat(_product.get_height()) <= 0 ? defaultHeight : parseFloat(_product.get_height());
    const width = parseFloat(_product.get_weight()) <= 0 ? defaultWidth : parseFloat(_product.get_width());
    const min_dimension = getMinDimension(width, length, height);

    products.push({
      weight: final_weight,
      quantity: values.quantity,
      length: length,
      height: height,
      width: width,
      item_id: item_id,
      value: value,
      min_dimension: min_dimension,
    });

    volume += length * height * width;
  }

  const max_weights = getMaxWeight(package, weight);

  // Order the products by their postcodes
  products.sort((a, b) => {
    return a.item_id - b.item_id;
  });

  const pack = [];
  let packs_count = 1;
  pack[packs_count] = {
    weight: 0,
    length: 0,
    height: 0,
    width: 0,
    quantity: 0,
    value: 0,
  };

  let i = 0;

  products.forEach((product) => {
    const max_weight = max_weights.own_package;

    while (product.quantity > 0) {
      if (!pack[packs_count].weight) {
        pack[packs_count].weight = 0;
      }
      if (!pack[packs_count].quantity) {
        pack[packs_count].quantity = 0;
      }

      pack[packs_count].weight += product.weight;
      pack[packs_count].length = product.min_dimension === 'length' ? pack[packs_count].length + product.length : product.length;
      pack[packs_count].height = product.min_dimension === 'height' ? pack[packs_count].height + product.height : product.height;
      pack[packs_count].width = product.min_dimension === 'width' ? pack[packs_count].width + product.width : product.width;
      pack[packs_count].item_id = product.item_id;
      pack[packs_count].quantity += 1;
      pack[packs_count].value += Math.round(product.value * 100) / 100;
      const package_height = getMinDimension(pack[packs_count].width, pack[packs_count].length, pack[packs_count].height);

      if (pack[packs_count].weight > max_weight) {
        pack[packs_count].value -= Math.round(product.value * 100) / 100;
        pack[packs_count].length = product.min_dimension === 'length' ? pack[packs_count].length - product.length : product.length;
        pack[packs_count].height = product.min_dimension === 'height' ? pack[packs_count].height - product.height : product.height;
        pack[packs_count].width = product.min_dimension === 'width' ? pack[packs_count].width - product.width : product.width;
        pack[packs_count].quantity -= 1;
        pack[packs_count].weight -= product.weight;
        packs_count++;
        pack[packs_count] = {
          weight: product.weight,
          length: product.length,
          height: product.height,
          width: product.width,
          item_id: product.item_id,
          quantity: 1,
          value: Math.round(product.value * 100) / 100,
        };
      }
      product.quantity--;
    }
    i++;
  });

  return pack;
}

function getMinDimension(width, length, height) {
  const dimensions = { width: width, length: length, height: height };
  const result = Object.keys(dimensions).reduce((a, b) => (dimensions[a] < dimensions[b] ? a : b));
  return result;
}

function calculateShipping(package) {
  if (package.destination.country !== 'GB') {
    return;
  }

  const pluginDirPath = '/path/to/your/plugin/directory/';

  const CalculateMethod = require(pluginDirPath + 'includes/royalmail/Src/CalculateMethod');
  const Data = require(pluginDirPath + 'includes/royalmail/Src/Data');
  const Method = require(pluginDirPath + 'includes/royalmail/Src/Method');

  let packageDetails = getPackageDetailsByBoxpacker(package);

  if (packageDetails === false) {
    packageDetails = getPackageDetails(package);
  }

  debug('Settings: ', JSON.stringify(instanceSettings));
  debug('Packing Details', packageDetails);

  const calculateMethodClass = new CalculateMethod();
  const dataClass = new Data(
    calculateMethodClass._csvCountryCode,
    calculateMethodClass._csvZoneToDeliverMethod,
    calculateMethodClass._csvDeliveryMethodMeta,
    calculateMethodClass._csvDeliveryToPrice,
    calculateMethodClass._csvCleanNameToMethod,
    calculateMethodClass._csvCleanNameMethodGroup
  );

  const rates = {};

  packageDetails.forEach((pack) => {
    const allowedMethods = getAllowedMethods(pack, package.destination.country);

    if (allowedMethods.length > 0) {
      dataClass.setWeightUnit(getOption('woocommerce_weight_unit'));
      dataClass._setWeight(pack.weight);

      const value = withInsurance === 'yes' ? pack.value : 1;
      const calculatedMethods = calculateMethodClass.getMethods(
        package.destination.country,
        value,
        pack.weight
      );

      if (parcelSize === 'small' && isSmallParcel(pack)) {
        calculatedMethods = filterMethodsBySize(calculatedMethods, 'MEDIUM');
      } else {
        parcelSize = 'medium';
      }

      if (parcelSize === 'medium' && isMediumParcel(pack)) {
        calculatedMethods = filterMethodsBySize(calculatedMethods, 'SMALL');
      }

      if (!isMediumParcel(pack) && !isSmallParcel(pack)) {
        calculatedMethods = filterMethodsBySize(calculatedMethods, 'SMALL');
        calculatedMethods = filterMethodsBySize(calculatedMethods, 'MEDIUM');
      }

      debug('calculatedMethods', calculatedMethods);

      const allMethods = getAllMethods();

      allowedMethods.forEach((allowedMethod) => {
        calculatedMethods.forEach((methodItem) => {
          if (allMethods[allowedMethod] === methodItem.shippingMethodNameClean) {
            debug('Shipping Methods: ', methodItem);

            let price = methodItem.methodPrice;
            price = stripShippingTax(price);

            if (!rates[methodItem.shippingMethodName]) {
              rates[methodItem.shippingMethodName] = {};
              rates[methodItem.shippingMethodName].id = methodItem.shippingMethodName;
              rates[methodItem.shippingMethodName].label = title + ': ' + methodItem.shippingMethodNameClean;
              rates[methodItem.shippingMethodName].cost = price;
            } else {
              rates[methodItem.shippingMethodName].cost += price;
            }
          }
        });
      });
    }
  });

  // Sort the rates
  const sortedRates = Object.values(rates).sort(sortRates);

  sortedRates.forEach((rate) => {
    rate.package = package;
    addRate(rate);
  });
}

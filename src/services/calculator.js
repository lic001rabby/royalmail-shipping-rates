const RoyalMailBox = require('./box');
//const Item = require('./item');
const BinPacking3D = require('binpackingjs').BP3D;
const { Item, Bin, Packer } = BinPacking3D;
const StoreItem = require('./item');


// Replace these functions with your actual implementation
function getMinDimension(width, length, height) {
  const dimensions = { width, length, height };
  const result = Object.keys(dimensions).reduce((minDim, dim) => {
    return dimensions[dim] < dimensions[minDim] ? dim : minDim;
  }, 'width'); // Default to 'width' if all dimensions are equal
  return result;
}
function getPackageDetails(package) {
  const defaultLength = 1;
  const defaultWidth = 1;
  const defaultHeight = 1;

  let weight = 0;
  let volume = 0;
  const products = [];

  // Get weight of order
  package.contents.forEach((item) => {

    const _product = item;
    const finalWeight = parseFloat(_product.weight) <= 0 ? this.defaultWeight : parseFloat(_product.weight);
    weight += finalWeight * item.quantity;
    const value = item.price;
    const length = item.length;
    const height = item.height;
    const width = item.width;
    const minDimension = Math.min(width, length, height);
    const item_id = item.code;
    products.push({
      weight: item.weight,
      quantity: item.quantity,
      length,
      height,
      width,
      item_id,
      value,
      min_dimension: minDimension,
    });
    volume += length * height * width;
  });

  const maxWeights = getMaxWeight(package, package.total_weight);
  products.sort((a, b) => a.min_dimension - b.min_dimension);

  const packs = [];
  let packsCount = 0;
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
      packs[packsCount].value += product.value;
      const packageHeight = Math.min(packs[packsCount].width, packs[packsCount].length, packs[packsCount].height);

      if (packs[packsCount].weight > maxWeight) {
        packs[packsCount].value -= product.value;
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
          value: product.value,
        };
      }
      product.quantity--;
    }
    i++;
  }
  return packs.map((item) => {
    return {
      ...item,
      size: getParcelSize({
        weight: item.weight,
        length: item.length,
        height: item.height,
        width: item.width
      })
    };
  });
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

function getParcelSize(dimensions) {
  if (isSmallParcel(dimensions)) {
    return 'small';
  }
  else if (isMediumParcel(dimensions)) {
    return 'medium';
  }
  else {
    return 'large';
  }

}

function filterMethodsBySize(methods, size) {
  return methods.filter((value) => value.size !== size);
}

function getRoyalMailBoxes(parcelSize) {
  const boxes = [];
  //const parcelSize = getParcelSize(dimensions);


  if (parcelSize === 'small') {
    boxes.push(
      new RoyalMailBox()
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
      new RoyalMailBox()
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
      new RoyalMailBox()
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

/* function getPackageDetails(package, defaultSize = { length: 1, width: 1, height: 1 }, defaultWeight = 0.5) {
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

    const final_weight = parseFloat(_product.weight) <= 0 ? defaultWeight : parseFloat(_product.get_weight());
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
 */
function getMinDimension(width, length, height) {
  const dimensions = { width: width, length: length, height: height };
  const result = Object.keys(dimensions).reduce((a, b) => (dimensions[a] < dimensions[b] ? a : b));
  return result;
}

function calculateShipping(package) {
  if (package.destination.country !== 'GB') {
    return;
  }



  let packageDetails = getPackageDetailsByBoxpacker(package);

  if (packageDetails === false) {
    packageDetails = getPackageDetails(package);
  }


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

function getPackageDetailsByBoxpacker(package) {
  const default_length = package.default_size?.length || 1;
  const default_width = package.default_size?.width || 1;
  const default_height = package.default_size?.height || 1;

  const packer = new Packer();

  const boxes = getRoyalMailBoxes('small');
  boxes.forEach((box) => {
    // console.log("box", box);
    packer.addBin(new Bin(box.reference, box.outer_length, box.outer_width, box.outer_depth, box.max_weight));
  });
  // console.log("package", packer.bins);
  const pack = [];
  let packs_count = 0;
  let itemsQueue = [];
  let storeItemsQueue = [];
  package.contents.forEach((item) => {
    const weight = item.weight;
    const length = item.length;
    const height = item.height;
    const width = item.width;
    const storeItem = new StoreItem().setDepth(height).setWidth(width).setLength(length).setWeight(weight).setPrice(item.price);
    const itemInstance = new Item(item.code, width, length, height, weight)
    // console.log("box item", itemInstance);
    for (let i = 0; i < item.quantity; i++) {
      itemsQueue.push(itemInstance);
    }
    storeItemsQueue.push(storeItem);
  })
  pack[packs_count] = {
    weight: 0,
    length: 0,
    height: 0,
    width: 0,
    quantity: 0,
    value: 0,
  };
  // console.log("itemsQueue", itemsQueue);
  itemsQueue.forEach((item, index) => {

    packer.addItem(item);

  });

  try {
    packer.pack();
    // console.log("packed boxes", packer);
    packer.bins.forEach((bin) => {
      // console.log("bin", bin.name);
      // console.log("packer ready", bin.items);

    })
    /*  packedBoxes.forEach((packedBox) => {
       pack[packs_count] = {
         weight: packedBox.getWeight() / 1000,
         length: packedBox.getUsedLength() / 10,
         width: packedBox.getUsedWidth() / 10,
         height: packedBox.getUsedDepth() / 10,
         quantity: packedBox.getItems().length,
         postcode: package.destination.postcode,
         value: packedBox.getItems().reduce((carry, item) => {
            carry += item.getPrice();
            return carry;
          }, 0), 
       };
       packs_count++;
     }); */
  } catch (e) {
    return false;
  }

  return pack;
}

function getMaxWeight(package, total_weight) {
  const country = package.destination.country;

  const max_weights = {};

  max_weights['own_package'] = country === 'GB' ? 30 : 2;

  if (country === 'GB') {
    if (total_weight <= 2 && this.parcel_size === 'small') {
      return {
        'own_package': 2,
      };
    } else {
      return {
        'own_package': 20,
      };
    }
  } else {
    return {
      'own_package': max_weights['own_package'],
    };
  }
}


module.exports = {
  getMinDimension,
  calculateShipping,
  getPackageDetailsByBoxpacker,
  getPackageDetails
}


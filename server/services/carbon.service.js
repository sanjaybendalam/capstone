const CarbonEntry = require("../models/CarbonEntry");

const addCarbonEntry = async (userId, entries) => {
  const result = [];

  // Emission factors
  const EF = {
    electricity: 0.82,
    petrol: 2.31,
    diesel: 2.68,
    flightShort: 0.09,
    flightLong: 0.15,
    lpg: 2.98,
    beef: 27,
    chicken: 6.9,
    rice: 4.0,
    vegetables: 2.0,
    waste: 1.0
  };

  // Convert entries to CarbonEntry objects
  for (const [key, value] of Object.entries(entries)) {
    if (value > 0) {
      let category = key;
      let emissionFactor = EF[key];
      let scope = 1; // default

      // Flight long/short handled as flight category
      if (key === "flightShort" || key === "flightLong") category = "flight";
      if (key === "beef" || key === "chicken" || key === "rice" || key === "vegetables") category = "food";
      if (key === "petrol" || key === "diesel") category = "transport";
      if (key === "lpg") category = "fuel";

      const carbonEntry = new CarbonEntry({
        userId,
        category,
        activityData: { value, unit: "unit" },
        emissionFactor,
        calculatedCO2: value * emissionFactor,
        scope,
        metadata: { type: key },
        date: new Date()
      });

      const saved = await carbonEntry.save();
      result.push(saved);
    }
  }

  return result;
};

const getUserCarbonEntries = async (userId) => {
  return await CarbonEntry.find({ userId });
};

module.exports = {
  addCarbonEntry,
  getUserCarbonEntries
};

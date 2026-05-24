const PricingSetting = require('../models/PricingSetting');

// Weekend surcharge strategy
// Compute surcharge for days that fall on Fri/Sat/Sun

const isWeekendDay = (date) => {
  const d = date.getDay();
  // JS: 0 = Sun, 5 = Fri, 6 = Sat
  return d === 0 || d === 5 || d === 6;
};

/**
 * Count how many days in the rental interval are weekend days
 * and compute the subtotal for weekend days (basePricePerDay * weekendDays)
 */
const computeWeekendSubtotal = (pricePerDay, pickupDate, returnDate) => {
  const start = new Date(`${pickupDate}T00:00:00`);
  const end = new Date(`${returnDate}T00:00:00`);

  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.ceil((end - start) / msPerDay);
  if (days <= 0) return { weekendDays: 0, weekendSubtotal: 0 };

  let weekendDays = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * msPerDay);
    if (isWeekendDay(d)) {
      weekendDays += 1;
    }
  }

  const weekendSubtotal = weekendDays * pricePerDay;
  return { weekendDays, weekendSubtotal };
};

/**
 * Calculate surcharge amount based on configured weekend rate
 * Returns { rate, weekendDays, weekendSubtotal, surcharge }
 */
const calculateSurcharge = async (pricePerDay, pickupDate, returnDate) => {
  // read current setting (latest)
  const setting = await PricingSetting.findOne({}).sort({ updatedAt: -1 });
  const rate = Number(setting?.weekendSurchargeRate) || 0;

  // compute weekend subtotal from dates
  const { weekendDays, weekendSubtotal } = computeWeekendSubtotal(pricePerDay, pickupDate, returnDate);

  const surcharge = (weekendSubtotal * rate) / 100;
  return { rate, weekendDays, weekendSubtotal, surcharge };
};

module.exports = { computeWeekendSubtotal, calculateSurcharge };


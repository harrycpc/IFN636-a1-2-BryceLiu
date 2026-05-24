const longStay = require('./longStayDiscountStrategy');
const weekend = require('./weekendSurchargeStrategy');

// Pricing context
// Compose pricing strategies to produce a final price and breakdown

/**
 * Calculate pricing breakdown and final total.
 * Input: car (must include pricePerDay), pickupDate (YYYY-MM-DD), returnDate (YYYY-MM-DD)
 * Output: { total, breakdown: { base, discount, surcharge, days, weekendDays } }
 */
const calculatePrice = async ({ car, pickupDate, returnDate }) => {
  const pricePerDay = Number(car?.pricePerDay || 0);

  const start = new Date(`${pickupDate}T00:00:00`);
  const end = new Date(`${returnDate}T00:00:00`);
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.ceil((end - start) / msPerDay);
  const safeDays = days > 0 ? days : 0;

  const base = pricePerDay * safeDays;

  // Long-stay discount
  const { rate: discountRate, amount: discountAmount } = await longStay.calculateDiscount(base, safeDays);

  // Weekend surcharge
  const { rate: weekendRate, weekendDays, weekendSubtotal, surcharge } = await weekend.calculateSurcharge(pricePerDay, pickupDate, returnDate);

  const total = Number((base - discountAmount + surcharge).toFixed(2));

  const breakdown = {
    days: safeDays,
    base: Number(base.toFixed(2)),
    discount: { rate: discountRate, amount: Number(discountAmount.toFixed(2)) },
    weekend: { rate: weekendRate, weekendDays, weekendSubtotal: Number(weekendSubtotal.toFixed(2)), surcharge: Number(surcharge.toFixed(2)) },
  };

  return { total, breakdown };
};

module.exports = { calculatePrice };


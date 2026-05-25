const longStay = require('../decorators/LongStayDiscountDecorator');
const weekend = require('../decorators/WeekendSurchargeDecorator');

// Price calculator (composed decorators)
// We build a base pricing component and then wrap it with decorators
// so behaviours (weekend surcharge, long-stay discount) are applied in order.

/**
 * Base pricing component: calculates base price and days
 */
const baseComponent = {
  calculate: async ({ car, pickupDate, returnDate }) => {
    const pricePerDay = Number(car?.pricePerDay || 0);

    const start = new Date(`${pickupDate}T00:00:00`);
    const end = new Date(`${returnDate}T00:00:00`);
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.ceil((end - start) / msPerDay);
    const safeDays = days > 0 ? days : 0;

    const base = pricePerDay * safeDays;

    const total = Number(base.toFixed(2));

    const breakdown = {
      days: safeDays,
      base: Number(base.toFixed(2)),
    };

    return { total, breakdown };
  }
};

/**
 * Calculate pricing breakdown and final total by composing decorators.
 * Order: weekend surcharge applied first, then long-stay discount applied on top.
 */
const calculatePrice = async ({ car, pickupDate, returnDate }) => {
  let component = baseComponent;
  // use decorators
  component = new weekend.WeekendSurchargeDecorator(component); // apply weekend surcharge first
  component = new longStay.LongStayDiscountDecorator(component); // then apply long-stay discount

  // run composed component
  const result = await component.calculate({ car, pickupDate, returnDate });
  return result;
};

module.exports = { calculatePrice };


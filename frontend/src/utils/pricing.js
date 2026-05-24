// Frontend pricing helpers — estimate price using public rules
// Keep logic similar to backend so estimates match server-side calculation

export const daysBetween = (pickupDate, returnDate) => {
  if (!pickupDate || !returnDate) return 0;
  const start = new Date(`${pickupDate}T00:00:00`);
  const end = new Date(`${returnDate}T00:00:00`);
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.ceil((end - start) / msPerDay);
  return days > 0 ? days : 0;
};

const isWeekendDay = (date) => {
  const d = date.getDay();
  return d === 0 || d === 5 || d === 6; // Sun, Fri, Sat
};

export const countWeekendDays = (pickupDate, returnDate) => {
  const start = new Date(`${pickupDate}T00:00:00`);
  const days = daysBetween(pickupDate, returnDate);
  let weekendDays = 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * msPerDay);
    if (isWeekendDay(d)) weekendDays++;
  }
  return weekendDays;
};

export const calculateEstimate = (pricePerDay, pickupDate, returnDate, longStayRules = [], weekendSurchargeRate = 0) => {
  const days = daysBetween(pickupDate, returnDate);
  const base = Number((pricePerDay * days).toFixed(2));

  // find applicable long-stay discount: pick highest minDays <= days
  const sorted = [...(longStayRules || [])].sort((a, b) => b.minDays - a.minDays);
  let discountRate = 0;
  for (const r of sorted) {
    if (days >= r.minDays) {
      discountRate = Number(r.discountRate) || 0;
      break;
    }
  }
  const discountAmount = Number(((base * discountRate) / 100).toFixed(2));

  const weekendDays = countWeekendDays(pickupDate, returnDate);
  const weekendSubtotal = Number((weekendDays * pricePerDay).toFixed(2));
  const surcharge = Number(((weekendSubtotal * (Number(weekendSurchargeRate) || 0)) / 100).toFixed(2));

  const total = Number((base - discountAmount + surcharge).toFixed(2));

  return {
    total,
    breakdown: {
      days,
      base,
      discount: { rate: discountRate, amount: discountAmount },
      weekend: { weekendDays, weekendSubtotal, rate: Number(weekendSurchargeRate) || 0, surcharge },
    },
  };
};


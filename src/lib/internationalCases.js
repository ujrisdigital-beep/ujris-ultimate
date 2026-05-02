// UJRIS International Case Types (G8 - 16hrs)
export const INTERNATIONAL_JURISDICTIONS = {
  UK: {
    name: 'United Kingdom',
    tribunalTypes: ['Employment Tribunal', 'County Court', 'High Court'],
    ventoBands: { low: 990, medium: 29600, high: 56000 },
    timeLimitDays: 3 * 30, // 3 months
    currency: 'GBP'
  },
  US: {
    name: 'United States',
    tribunalTypes: ['Federal Court', 'State Court', 'Small Claims'],
    ventoBands: { low: 5000, medium: 50000, high: 250000 },
    timeLimitDays: 2 * 365, // 2 years statute of limitations
    currency: 'USD'
  },
  CANADA: {
    name: 'Canada',
    tribunalTypes: ['Federal Court', 'Provincial Court', 'Human Rights Tribunal'],
    ventoBands: { low: 10000, medium: 75000, high: 350000 },
    timeLimitDays: 2 * 365,
    currency: 'CAD'
  },
  AUSTRALIA: {
    name: 'Australia',
    tribunalTypes: ['Federal Court', 'Fair Work Commission', 'NCAT'],
    ventoBands: { low: 15000, medium: 90000, high: 400000 },
    timeLimitDays: 6 * 30, // 6 months
    currency: 'AUD'
  }
};

export function expandToInternational(caseType, jurisdiction = 'UK') {
  const config = INTERNATIONAL_JURISDICTIONS[jurisdiction];
  return {
    ...caseType,
    jurisdiction,
    tribunalTypes: config.tribunalTypes,
    timeLimitDays: config.timeLimitDays,
    currency: config.currency,
    // Convert GBP amounts to local currency if needed
    localVentoBands: convertVentoBands(config.ventoBands, config.currency)
  };
}

function convertVentoBands(bands, currency) {
  // In reality, use exchange rates API
  const rates = { GBP: 1, USD: 1.25, CAD: 1.7, AUD: 1.9 };
  const rate = rates[currency] || 1;
  return {
    low: Math.round(bands.low * rate),
    medium: Math.round(bands.medium * rate),
    high: Math.round(bands.high * rate)
  };
}

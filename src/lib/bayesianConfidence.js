// Bayesian Confidence Intervals (G6 - 6hrs)
export function calculateBayesianConfidence(evidenceStrength, priorBelief = 0.5) {
  // evidenceStrength: 0-1 (how strong is the AI evidence)
  // priorBelief: 0-1 (prior probability of success)
  
  // Likelihood: P(evidence | hypothesis)
  const likelihood = evidenceStrength;
  
  // Marginal likelihood: P(evidence)
  const marginalLikelihood = (likelihood * priorBelief) + ((1 - likelihood) * (1 - priorBelief));
  
  // Posterior: P(hypothesis | evidence) - Bayes' Theorem
  const posterior = (likelihood * priorBelief) / marginalLikelihood;
  
  // 95% Confidence Interval (simplified)
  const standardError = Math.sqrt(posterior * (1 - posterior) / 100); // Assuming 100 samples
  const confidenceInterval = [
    Math.max(0, posterior - 1.96 * standardError),
    Math.min(1, posterior + 1.96 * standardError)
  ];
  
  return {
    prior: priorBelief,
    evidence: evidenceStrength,
    posterior,
    confidenceInterval,
    confidencePercent: (posterior * 100).toFixed(1) + '%',
    uncertaintyLevel: posterior > 0.8 ? 'low' : posterior > 0.5 ? 'medium' : 'high'
  };
}

// Add to all AI outputs:
export function enhanceWithConfidence(result, evidenceStrength) {
  const bayesian = calculateBayesianConfidence(evidenceStrength);
  return {
    ...result,
    confidence: bayesian,
    displayBadge: `Confidence: ${bayesian.confidencePercent} (${bayesian.uncertaintyLevel} uncertainty)`
  };
}

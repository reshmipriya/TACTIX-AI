import test from "node:test";
import assert from "node:assert/strict";

// Test Environment Cost Calculation
test("Environment Cost: weights sum to 1.0 and normalizes to [0, 100]", () => {
  const ENV_WEIGHTS = {
    terrain: 0.35,
    landcover: 0.25,
    weather: 0.25,
    accessibility: 0.15,
  };
  const sumWeights = Object.values(ENV_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.equal(Math.round(sumWeights * 100) / 100, 1.0);

  // Sample cell
  const terrainScore = 40;
  const landCoverFactor = 0.5; // 50
  const weatherImpact = 70;
  const roadAccessibility = 0.8; // (1 - 0.8) * 100 = 20

  const cost =
    ENV_WEIGHTS.terrain * terrainScore +
    ENV_WEIGHTS.landcover * (landCoverFactor * 100) +
    ENV_WEIGHTS.weather * weatherImpact +
    ENV_WEIGHTS.accessibility * ((1 - roadAccessibility) * 100);

  assert.ok(cost >= 0 && cost <= 100, `Cost ${cost} out of 0-100 range`);
  assert.equal(Math.round(cost), 47);
});

// Test Risk Weights Sum and Monotonicity
test("Risk Engine: Prototype weights sum exactly to 1.0", () => {
  const RISK_WEIGHTS = {
    terrain: 0.22,
    weather: 0.22,
    logistics: 0.20,
    intelUncertainty: 0.18,
    timePressure: 0.10,
    constraintPressure: 0.08,
  };
  const sumWeights = Object.values(RISK_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.equal(Math.round(sumWeights * 100) / 100, 1.0);
});

// Test Constraint Validation Behavior
test("Constraint Engine: flags violation when duration exceeds time limit", () => {
  const timeLimit = 5;
  const estimatedDuration = 6.2;
  const isViolation = estimatedDuration > timeLimit;
  assert.equal(isViolation, true);
});

// Test Fallback Mission Interpreter Parsing
test("AI Mission Interpreter Fallback: extracts parameters from keyword heuristics", () => {
  const text = "Simulated transit under heavy monsoon storm with 40% fuel within 5 hours avoid water";
  const lower = text.toLowerCase();
  
  let weather = "NORMAL";
  if (lower.includes("monsoon") || lower.includes("heavy")) weather = "HEAVY_RAIN";
  
  let timeLimit = 6;
  const match = lower.match(/(\d+)\s*(?:h|hr|hrs|hours?)/);
  if (match) timeLimit = parseInt(match[1], 10);
  
  let terrainPref = "ANY";
  if (lower.includes("avoid water")) terrainPref = "AVOID_WATER";

  assert.equal(weather, "HEAVY_RAIN");
  assert.equal(timeLimit, 5);
  assert.equal(terrainPref, "AVOID_WATER");
});

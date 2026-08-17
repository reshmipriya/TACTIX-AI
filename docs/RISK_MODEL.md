# TACTIX AI - Explainable Risk Model Reference & ML Experiment

This document details the exact weighted-sum mathematical formulation of the TACTIX AI risk engine, prototype assumptions, limitations, and supporting machine learning experiment findings.

---

## 1. Prototype Weighted-Sum Risk Model

The overall simulated risk score $\text{Risk} \in [0, 100]$ is computed as a transparent, weighted sum of 6 normalized operational and environmental factors:

\[
\text{Risk} = \min\left(100, \sum_{i=1}^{6} W_i \cdot F_i\right)
\]

### Factor Weight Table (Section 21/32)

| Factor ($F_i$) | Weight ($W_i$) | Driving Variables | Normalization Range |
| :--- | :--- | :--- | :--- |
| **Terrain Exposure** | **22% (0.22)** | Mean slope, roughness, and elevation anomalies along the route. | $0 - 100$ |
| **Weather Exposure** | **22% (0.22)** | Active precipitation, wind speed, visibility class from ERA5. | $0 - 100$ |
| **Logistics Stress** | **20% (0.20)** | Resource availability, equipment readiness, supply level: $100 - (\text{Res} \times \text{Readiness} \times 100)$. | $0 - 100$ |
| **Intelligence Uncertainty** | **18% (0.18)** | Mean uncertainty of proximal synthetic intel reports ($1 - \text{conf} \times \text{rel}$). | $0 - 100$ |
| **Time Pressure** | **10% (0.10)** | Ratio of estimated duration to scenario cutoff limit: $\text{clamp}_{0,1}\left(\frac{T}{T_{\text{limit}}} - 0.4\right) \times \frac{100}{0.6}$. | $0 - 100$ |
| **Constraint Stress** | **8% (0.08)** | Violation count ($45\text{ pts}$) and Warning count ($18\text{ pts}$). | $0 - 100$ |

**Sum of Weights:** $\sum W_i = 0.22 + 0.22 + 0.20 + 0.18 + 0.10 + 0.08 = 1.00$ (100%).

---

## 2. Risk Bands & Visual Coding

- **Low Risk ($0 - 33$):** `#00D9A3` (Tactical Green) — Operations within safe baseline envelopes.
- **Medium Risk ($34 - 66$):** `#FFB020` (Tactical Amber) — Elevated environmental friction or near-limit resource strain.
- **High Risk ($67 - 100$):** `#FF3B5C` (Tactical Red) — Severe conditions or constraint violations (`INVALID` status).

---

## 3. Prototype Assumptions & Scope Disclaimer

> [!IMPORTANT]
> **Ethical & Operational Disclaimer:** The weights above are prototype assumptions designed to illustrate transparent, explainable decision-support for simulated exercises. They do not represent calibrated operational military doctrine. TACTIX AI estimates risk strictly within a controlled synthetic environment and never replaces human commanding authority.

---

## 4. Machine Learning Experiment Results (Section 22)

To evaluate non-linear statistical generalization across large perturbation spaces, a Random Forest Regressor ($n=300$ trees, $\text{depth}=12$) was trained on $3,000$ simulated scenarios generated across terrain, weather, logistics, uncertainty, and constraint variations.

### Evaluation Metrics:
- **Mean Absolute Error (MAE):** `0.296`
- **Root Mean Squared Error (RMSE):** `0.388`
- **Coefficient of Determination ($R^2$):** `0.9989`

### Feature Importance Attribution:
- `terrain_score`: $23.0\%$
- `weather_score`: $22.0\%$
- `logistics_score`: $20.0\%$
- `intelligence_uncertainty`: $18.0\%$
- `time_pressure`: $9.0\%$
- `constraint_pressure`: $8.0\%$

### Decision Rule Conclusion:
The deterministic weighted-sum model remains primary and authoritative due to its $100\%$ explainability and zero runtime overhead. The ML experiment validates that the deterministic engine behaves monotonically and reliably across all input dimensions.

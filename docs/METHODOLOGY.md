# TACTIX AI - Mathematical & Algorithmic Methodology

This document provides the mathematical formulas, algorithms, and simulation models powering the TACTIX AI core.

---

## 1. Environment Cost Function

For every grid cell $c$, the single-cell environment cost $C_{\text{env}}(c) \in [0, 100]$ is computed as:

\[
C_{\text{env}}(c) = w_{\text{terrain}} S_{\text{terrain}}(c) + w_{\text{landcover}} (F_{\text{landcover}}(c) \times 100) + w_{\text{weather}} S_{\text{weather}} + w_{\text{access}} ((1 - A_{\text{road}}(c)) \times 100)
\]

### Normalization & Default Weights:
- $w_{\text{terrain}} = 0.35$
- $w_{\text{landcover}} = 0.25$
- $w_{\text{weather}} = 0.25$
- $w_{\text{access}} = 0.15$
- $\sum w_i = 1.00$

Where:
- $S_{\text{terrain}}(c)$: Normalized composite terrain score based on slope ($0.4$), roughness ($0.3$), and elevation anomaly ($0.3$).
- $F_{\text{landcover}}(c)$: Copernicus movement friction factor ($0.30$ for grassland to $1.00$ for water).
- $S_{\text{weather}}$: Active ERA5 weather scenario impact score ($10$ for normal to $90$ for poor).
- $A_{\text{road}}(c)$: Road accessibility index ($0.0$ to $1.0$), where cells closer to paved roads exhibit higher accessibility.

---

## 2. Multi-Objective A* Pathfinding

The graph $G = (V, E)$ consists of 8-connected grid cell nodes. For edge $(u, v)$, the cost functions differ across Courses of Action:

### COA Alpha (Speed Priority):
\[
\text{Cost}_{\text{Alpha}}(u, v) = d(u, v) \cdot 1.0 \cdot R_{\text{access}}(v) + \left(\frac{C_{\text{env}}(v)}{100}\right) \cdot 0.2
\]
*(Prioritizes shortest distance and paved corridors; terrain friction heavily discounted).*

### COA Bravo (Resource Conservation):
\[
\text{Cost}_{\text{Bravo}}(u, v) = \text{ResourceBurn}(u, v) \cdot 1.0 + \left(\frac{C_{\text{env}}(v)}{100}\right) \cdot 0.4
\]
Where:
\[
\text{ResourceBurn}(u, v) = d(u, v) \cdot \left(1 + \frac{\max(0, z_v - z_u)}{20}\right) \cdot (1 - 0.4 \cdot A_{\text{road}}(v))
\]
*(Penalizes uphill slope climbing and unpaved terrain to minimize fuel expenditure).*

### COA Charlie (Environmental Hazard Avoidance):
\[
\text{Cost}_{\text{Charlie}}(u, v) = \left(\frac{C_{\text{env}}(v)}{100}\right) \cdot 1.0 \cdot W_{\text{avoidance}}(v) + d(u, v) \cdot 0.3
\]
*(Maximizes avoidance of severe terrain, marshland, and water bodies; tolerates longer distance).*

---

## 3. Simulation Metrics Calculation

For a route path $P = (c_1, c_2, \dots, c_k)$:

1. **Distance ($D$):**
   \[
   D = \sum_{i=1}^{k-1} d_{\text{haversine}}(c_i, c_{i+1})
   \]

2. **Effective Speed & Duration ($T$):**
   \[
   v_{\text{eff}} = v_{\text{base}} \cdot M_{\text{logistics}} \cdot \left(1 - \frac{\bar{S}_{\text{terrain}}}{200} - \frac{S_{\text{weather}}}{400}\right)
   \]
   \[
   T = \frac{D}{v_{\text{eff}}} \quad (\text{hours})
   \]

3. **Resource Consumption ($R$):**
   \[
   R = B_{\text{base}} \cdot T \cdot \left(1 + \frac{0.5 \cdot \bar{C}_{\text{env}}}{100}\right)
   \]

4. **Intelligence Uncertainty ($U$):**
   \[
   U = \frac{1}{|I_P|} \sum_{j \in I_P} U_j \cdot (1.1 - 0.3 \cdot C_{\text{scenario}})
   \]
   Where $I_P$ represents synthetic intelligence observations within $2.2\text{ km}$ buffer of route $P$.

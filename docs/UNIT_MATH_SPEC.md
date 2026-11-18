# NilamTrace — Deterministic Revenue Unit Math Specification

## 1. Principles

1. **Zero LLM Arithmetic:** Large Language Models are strictly prohibited from performing unit conversions, subtractions, or delta validations.
2. **Statutory Standards:** All mathematical factors match the official Tamil Nadu Revenue Department and Survey & Settlement conversion rules.
3. **Internal Normalization Base:** All areas are converted into:
   - Square Feet ($sq.ft$)
   - Cents ($cents$)

---

## 2. Statutory Conversion Constants

$$\text{1 Acre} = 100 \text{ Cents} = 43,560 \text{ sq.ft}$$
$$\text{1 Cent} = 435.60 \text{ sq.ft}$$
$$\text{1 Hectare} = 100 \text{ Ares} = 247.105381467 \text{ Cents} = 107,639.104 \text{ sq.ft}$$
$$\text{1 Are} = 2.47105381 \text{ Cents} = 1,076.391 \text{ sq.ft}$$
$$\text{1 Kuzhi (Standard TN)} = 144 \text{ sq.ft} = 0.3305785 \text{ Cents}$$
$$\text{1 Ground} = 2,400 \text{ sq.ft} = 5.5096418 \text{ Cents}$$

---

## 3. Discrepancy & Shrinkage Formulation

Let $A_{\text{deed}}$ be the historical registered Sale Deed area in cents.  
Let $A_{\text{patta}}$ be the current Integrated Land Record (ILR) / Patta area in cents.

$$\Delta A = A_{\text{patta}} - A_{\text{deed}}$$

### Statutory Rounding Tolerance ($\epsilon$)
During the Tamil Nadu UDR (Updating Registry Scheme) conversion from imperial (Acres/Cents) to metric (Hectares/Ares), standard truncation and rounding occurred. The allowed tolerance is:
$$\epsilon = \max(0.25 \text{ Cents}, 0.01 \times A_{\text{deed}})$$

### Classification Rules
- If $|\Delta A| \le \epsilon$:
  - Classified as `MATCHED` (UDR metric rounding tolerance acknowledged).
- If $\Delta A < -\epsilon$:
  - Classified as `AREA_SHRINKAGE_UNRECORDED_SUBDIVISION`.
- If $\Delta A > \epsilon$:
  - Classified as `AREA_EXCESS_BOUNDARY_OVERLAP`.

---

## 4. Case #4821 Canonical Benchmark

- **Sale Deed Extent:** $48.00 \text{ Cents}$
- **Patta Extent:** $0.17.5 \text{ Hectares}$ ($0.175 \text{ Ha}$)
- **Calculation:**
  $$0.175 \times 247.105381 = 43.2434 \text{ Cents}$$
  $$\Delta A = 43.2434 - 48.00 = -4.7566 \text{ Cents} \approx -4.76 \text{ Cents}$$
  $$\epsilon = \max(0.25, 0.01 \times 48.00) = 0.48 \text{ Cents}$$
  Since $|-4.7566| > 0.48$, the system flags **AREA_SHRINKAGE_UNRECORDED_SUBDIVISION (-4.76 Cents)**.

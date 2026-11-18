# NilamTrace — Human-in-the-Loop (HITL) Gate & Security

## 1. Statutory HITL Operating Rules

Tech4Bharat 2026 mandates that agentic workflows must **pause for explicit human approval before legal, financial, or personal-data actions**.

NilamTrace treats this not as a passive UI alert, but as a hard architectural barrier in both the backend and frontend:
- **Backend Gate (`/api/cases/{case_id}/dossier.pdf`):** Strictly verifies `hitl_approved == True` and `consent_otp_verified == True`. Any attempt to request or stream the dossier PDF prior to approval returns `HTTP 403 Forbidden`.
- **Frontend Padlock:** The Action Drawer download triggers remain locked with an amber warning badge until the operator executes the 2-step verification.

---

## 2. The Spoken Voice + OTP Consent Protocol

1. **Spoken Tamil Summary:** The system plays the diagnostic summary aloud in conversational Tamil:
   > *"வணக்கம் ஐயா. அப்பா பெயரில் உள்ள பட்டா மற்றும் 4.76 சென்ட் குறைபாடு சரிசெய்ய மனு தயாராக உள்ளது. ஒப்புதலுக்கு 1234 தெரிவிக்கவும்."*  
   > *(“Sir, the petition to rectify late father's patta and the 4.76 cents shrinkage is ready. Please confirm with OTP 1234.”)*
2. **Officer/Landowner PIN Verification:** Operator enters the 4-digit verification code (`1234`).
3. **Cryptographic Consent Token:** The backend generates a timestamped SHA-256 consent token:
   $$\text{Token} = \text{SHA256}(\text{case\_id} + \text{timestamp} + \text{salt})$$
4. **QR Code Provenance Footer:** The generated ReportLab PDF encodes this token into an embedded QR stamp, allowing the Village Administrative Officer (VAO) or bank manager to scan and verify landowner consent on the spot.
5. **Red-Ink Stamp Slam Animation:** Unlocking triggers spring physics animation (stiffness: 420, damping: 22, -6deg tilt) and a confetti burst, providing tactile civic authority.

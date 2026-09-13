/**
 * Centralized public Firebase / App Check config for the ReversePanda website.
 *
 * These values are client-side configuration (restricted by domain / App Check).
 * Never put RESEND_API_KEY, service accounts, or Functions secrets here.
 *
 * Logical names (for future tooling / .env.example):
 * FIREBASE_API_KEY
 * FIREBASE_AUTH_DOMAIN
 * FIREBASE_PROJECT_ID
 * FIREBASE_STORAGE_BUCKET
 * FIREBASE_MESSAGING_SENDER_ID
 * FIREBASE_APP_ID
 * RECAPTCHA_ENTERPRISE_SITE_KEY
 */

export const firebaseConfig = {
  apiKey: "AIzaSyCRkI3Sh05z4rH3YOadFYDy0ucnN29pndE",
  authDomain: "reversepanda-5d135.firebaseapp.com",
  projectId: "reversepanda-5d135",
  storageBucket: "reversepanda-5d135.firebasestorage.app",
  messagingSenderId: "200312248311",
  appId: "1:200312248311:web:de8a220b940ea8b4e0c0f2"
};

export const recaptchaEnterpriseSiteKey = "6Lfl7LgtAAAAABMbcSIRGuuj7OimoW1CPmZg9Y2K";

/** Controlled website identity for submitFeedback payloads */
export const websiteMeta = {
  appVersion: "website",
  buildNumber: "web-2026.09.13"
};

export const supportEmail = "support@reverse-panda.ch";

export const functionsRegion = "europe-west1";
export const submitFeedbackName = "submitFeedback";

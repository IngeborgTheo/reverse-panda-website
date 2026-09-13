/**
 * Single Firebase initialization for the Contact page.
 * App Check is initialized before Functions / Storage are used.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app-check.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-functions.js";
import {
  getStorage,
  ref,
  uploadBytes,
  deleteObject
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";
import {
  firebaseConfig,
  recaptchaEnterpriseSiteKey,
  websiteMeta,
  supportEmail,
  functionsRegion,
  submitFeedbackName
} from "./firebase-config.js";

function isLocalHost() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

// Local-only App Check debug. Never enable in production.
// Set self.FIREBASE_APPCHECK_DEBUG_TOKEN = true before init so the SDK
// prints a debug token in the console. Register that token in Firebase Console.
if (isLocalHost()) {
  // eslint-disable-next-line no-undef
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const app = initializeApp(firebaseConfig);

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(recaptchaEnterpriseSiteKey),
  isTokenAutoRefreshEnabled: true
});

const functions = getFunctions(app, functionsRegion);
const storage = getStorage(app);
const submitFeedback = httpsCallable(functions, submitFeedbackName);

export {
  app,
  appCheck,
  functions,
  storage,
  submitFeedback,
  ref,
  uploadBytes,
  deleteObject,
  websiteMeta,
  supportEmail
};

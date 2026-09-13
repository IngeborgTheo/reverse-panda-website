/**
 * Single Firebase initialization for the Contact page.
 * App Check is initialized before Functions / Storage are used.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  getToken
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

function diagnosticsEnabled() {
  return (
    window.__RP_APPCHECK_DEBUG === true ||
    new URLSearchParams(window.location.search).has("rpAppCheckDebug")
  );
}

function siteKeyFingerprint(key) {
  if (!key || key.length < 8) return "(invalid)";
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

function reportAppCheckDiagnostics(extra = {}) {
  if (!diagnosticsEnabled()) return;
  const sameApp =
    Boolean(app) &&
    Boolean(storage) &&
    storage.app === app &&
    Boolean(functions) &&
    functions.app === app;
  console.info("[RP App Check diagnostics]", {
    appName: app && app.name,
    projectId: firebaseConfig.projectId,
    appIdSuffix: String(firebaseConfig.appId || "").slice(-8),
    appCheckInitialized: Boolean(appCheck),
    storageUsesSameApp: sameApp,
    functionsUsesSameApp: Boolean(functions && functions.app === app),
    siteKeyFingerprint: siteKeyFingerprint(recaptchaEnterpriseSiteKey),
    debugTokenEnabled: Boolean(self.FIREBASE_APPCHECK_DEBUG_TOKEN),
    hostname: window.location.hostname,
    ...extra
  });
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

reportAppCheckDiagnostics({ phase: "init" });

async function probeAppCheckToken(reason) {
  if (!diagnosticsEnabled()) return;
  try {
    const result = await getToken(appCheck, /* forceRefresh */ false);
    reportAppCheckDiagnostics({
      phase: "token",
      reason,
      tokenOk: Boolean(result && result.token)
    });
  } catch (error) {
    reportAppCheckDiagnostics({
      phase: "token-error",
      reason,
      errorCode: error && error.code,
      errorMessage: error && error.message
    });
  }
}

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
  supportEmail,
  reportAppCheckDiagnostics,
  probeAppCheckToken
};

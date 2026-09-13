(function () {
  const SUPPORT_EMAIL =
    (window.RP_FEEDBACK && window.RP_FEEDBACK.supportEmail) || "support@reverse-panda.ch";
  const ENDPOINT = (window.RP_FEEDBACK && window.RP_FEEDBACK.endpoint) || "";
  const SOURCE = (window.RP_FEEDBACK && window.RP_FEEDBACK.source) || "website";
  const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;

  const LIMITS = {
    email: 254,
    message: 2000,
    happened: 2000,
    expected: 1500,
    featureTitle: 100,
    featureAbout: 2000,
    why: 1000
  };

  const SUBMIT_LABELS = {
    bug: "REPORT BUG",
    feature: "SEND REQUEST",
    hello: "SEND MESSAGE"
  };

  const SUCCESS = {
    bug: {
      title: "BUG REPORT SENT.",
      copy: "Thanks for helping improve ReversePanda."
    },
    feature: {
      title: "REQUEST SENT.",
      copy: "Thanks for the idea."
    },
    hello: {
      title: "MESSAGE SENT.",
      copy: "Thanks for reaching out."
    }
  };

  const PRIVACY = {
    bug:
      "Only the information shown in this form and any screenshot you explicitly attach will be submitted.",
    feature: "Your message will only be used to respond to your request.",
    hello: "Your message will only be used to respond to your request."
  };

  const form = document.getElementById("contact-form");
  if (!form) return;

  const typeValue = document.getElementById("contact-type-value");
  const tabs = Array.from(document.querySelectorAll("[data-contact-type]"));
  const modeGroups = Array.from(document.querySelectorAll("[data-mode-fields]"));
  const typeNav = document.querySelector(".contact-type");
  const formWrap = document.querySelector("[data-contact-form-wrap]");
  const success = document.querySelector("[data-contact-success]");
  const successTitle = document.querySelector("[data-success-title]");
  const successCopy = document.querySelector("[data-success-copy]");
  const submitBtn = document.querySelector("[data-submit-btn]");
  const submitLabel = document.querySelector("[data-submit-label]");
  const privacyText = document.querySelector("[data-privacy-text]");
  const emailReq = document.querySelector("[data-email-req]");
  const emailOptional = document.querySelector("[data-email-optional]");
  const emailHelp = document.querySelector("[data-email-help]");

  const emailField = document.getElementById("contact-email");
  const nameField = document.getElementById("contact-name");
  const messageField = document.getElementById("contact-message");
  const happenedField = document.getElementById("contact-happened");
  const expectedField = document.getElementById("contact-expected");
  const androidField = document.getElementById("contact-android-version");
  const deviceField = document.getElementById("contact-device");
  const featureTitleField = document.getElementById("contact-feature-title");
  const categoryField = document.getElementById("contact-category");
  const featureAboutField = document.getElementById("contact-feature-about");
  const whyField = document.getElementById("contact-why");
  const honeypotField = document.getElementById("contact-company");
  const fileInput = document.getElementById("contact-screenshot");

  const shotPreview = document.querySelector("[data-shot-preview]");
  const shotThumb = document.querySelector("[data-shot-thumb]");
  const shotName = document.querySelector("[data-shot-name]");
  const shotSize = document.querySelector("[data-shot-size]");
  const shotRemove = document.querySelector("[data-shot-remove]");

  const errorEmail = document.getElementById("error-email");
  const errorMessage = document.getElementById("error-message");
  const errorHappened = document.getElementById("error-happened");
  const errorFeatureTitle = document.getElementById("error-feature-title");
  const errorFeatureAbout = document.getElementById("error-feature-about");
  const errorScreenshot = document.getElementById("error-screenshot");
  const errorForm = document.getElementById("error-form");
  const errorFallback = document.getElementById("error-fallback");
  const fallbackMail = document.querySelector("[data-fallback-mail]");

  let currentType = "bug";
  let screenshotFile = null;
  let screenshotObjectUrl = "";
  let submitting = false;

  function trim(value) {
    return String(value || "").trim();
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function clearFieldError(el) {
    if (!el) return;
    el.hidden = true;
    el.textContent = "";
  }

  function clearErrors() {
    [
      errorEmail,
      errorMessage,
      errorHappened,
      errorFeatureTitle,
      errorFeatureAbout,
      errorScreenshot,
      errorForm
    ].forEach(clearFieldError);
    if (errorFallback) errorFallback.hidden = true;
    form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
  }

  function showError(el, message, field) {
    if (el) {
      el.textContent = message;
      el.hidden = false;
    }
    if (field) field.classList.add("is-invalid");
  }

  function updateCounter(input) {
    const id = input.getAttribute("data-counter");
    if (!id) return;
    const counter = document.getElementById(id);
    if (!counter) return;
    const max = Number(input.getAttribute("maxlength")) || 0;
    const len = input.value.length;
    counter.textContent = `${len} / ${max}`;
    const nearLimit = max > 0 && len >= Math.floor(max * 0.85);
    counter.hidden = !nearLimit;
  }

  function clearScreenshot() {
    screenshotFile = null;
    if (screenshotObjectUrl) {
      URL.revokeObjectURL(screenshotObjectUrl);
      screenshotObjectUrl = "";
    }
    if (fileInput) fileInput.value = "";
    if (shotPreview) shotPreview.hidden = true;
    if (shotThumb) {
      shotThumb.removeAttribute("src");
      shotThumb.alt = "";
    }
    clearFieldError(errorScreenshot);
  }

  function setScreenshot(file) {
    clearFieldError(errorScreenshot);
    if (!file) {
      clearScreenshot();
      return;
    }
    if (!file.type || !file.type.startsWith("image/")) {
      clearScreenshot();
      showError(errorScreenshot, "Please choose an image file.");
      return;
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      clearScreenshot();
      showError(errorScreenshot, "Screenshot must be 5 MB or smaller.");
      return;
    }
    screenshotFile = file;
    if (screenshotObjectUrl) URL.revokeObjectURL(screenshotObjectUrl);
    screenshotObjectUrl = URL.createObjectURL(file);
    if (shotThumb) {
      shotThumb.src = screenshotObjectUrl;
      shotThumb.alt = `Selected screenshot: ${file.name}`;
    }
    if (shotName) shotName.textContent = file.name;
    if (shotSize) shotSize.textContent = formatBytes(file.size);
    if (shotPreview) shotPreview.hidden = false;
  }

  function setType(type) {
    currentType = type;
    if (typeValue) typeValue.value = type;

    tabs.forEach((tab) => {
      const active = tab.getAttribute("data-contact-type") === type;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    modeGroups.forEach((group) => {
      const modes = (group.getAttribute("data-mode-fields") || "")
        .split(/\s+/)
        .filter(Boolean);
      group.hidden = !modes.includes(type);
    });

    const emailRequired = type === "hello";
    if (emailReq) emailReq.hidden = !emailRequired;
    if (emailOptional) emailOptional.hidden = emailRequired;
    if (emailHelp) emailHelp.hidden = emailRequired;
    if (emailField) emailField.required = emailRequired;

    if (submitLabel) submitLabel.textContent = SUBMIT_LABELS[type] || SUBMIT_LABELS.hello;

    if (privacyText) {
      privacyText.textContent = PRIVACY[type] || PRIVACY.hello;
    }

    clearErrors();
    updateSubmitState();
  }

  function collectValues() {
    return {
      type: currentType,
      source: SOURCE,
      name: trim(nameField && nameField.value),
      email: trim(emailField && emailField.value),
      message: trim(messageField && messageField.value),
      happened: trim(happenedField && happenedField.value),
      expected: trim(expectedField && expectedField.value),
      androidVersion: trim(androidField && androidField.value),
      device: trim(deviceField && deviceField.value),
      featureTitle: trim(featureTitleField && featureTitleField.value),
      category: trim(categoryField && categoryField.value),
      featureAbout: trim(featureAboutField && featureAboutField.value),
      why: trim(whyField && whyField.value),
      company: trim(honeypotField && honeypotField.value),
      screenshot: screenshotFile
    };
  }

  function validate(values) {
    clearErrors();
    let valid = true;
    let firstInvalid = null;

    function fail(errorEl, message, field) {
      showError(errorEl, message, field);
      valid = false;
      if (!firstInvalid && field) firstInvalid = field;
    }

    if (values.email) {
      if (values.email.length > LIMITS.email || !isValidEmail(values.email)) {
        fail(errorEmail, "Please enter a valid email.", emailField);
      }
    } else if (values.type === "hello") {
      fail(errorEmail, "Please enter your email.", emailField);
    }

    if (values.type === "hello") {
      if (!values.message) {
        fail(errorMessage, "Please add a message.", messageField);
      }
    }

    if (values.type === "bug") {
      if (!values.happened) {
        fail(errorHappened, "Please describe what happened.", happenedField);
      }
    }

    if (values.type === "feature") {
      if (!values.featureTitle) {
        fail(errorFeatureTitle, "Please add a feature title.", featureTitleField);
      }
      if (!values.featureAbout) {
        fail(errorFeatureAbout, "Please tell me about it.", featureAboutField);
      }
    }

    if (firstInvalid) firstInvalid.focus();
    return valid;
  }

  function formLooksReady() {
    const values = collectValues();
    if (values.company) return false;

    if (values.email && !isValidEmail(values.email)) return false;
    if (values.type === "hello") {
      return Boolean(values.email && values.message);
    }
    if (values.type === "bug") {
      return Boolean(values.happened);
    }
    if (values.type === "feature") {
      return Boolean(values.featureTitle && values.featureAbout);
    }
    return false;
  }

  function updateSubmitState() {
    if (!submitBtn) return;
    const enabled = !submitting && formLooksReady();
    submitBtn.disabled = !enabled;
  }

  function buildMailto(values) {
    const subjectMap = {
      bug: "ReversePanda — Bug report",
      feature: "ReversePanda — Feature request",
      hello: "ReversePanda — Hello"
    };
    const lines = [`Source: website`, `Type: ${values.type}`, ""];

    if (values.type === "hello") {
      lines.push(`Name: ${values.name || "—"}`);
      lines.push(`Email: ${values.email}`);
      lines.push("", "Message:", values.message);
    } else if (values.type === "bug") {
      lines.push(`Email: ${values.email || "—"}`);
      lines.push(`Android version: ${values.androidVersion || "—"}`);
      lines.push(`Device model: ${values.device || "—"}`);
      lines.push("", "What happened:", values.happened);
      if (values.expected) lines.push("", "What did you expect:", values.expected);
      if (values.screenshot) {
        lines.push("", `Screenshot: ${values.screenshot.name} (please attach manually)`);
      }
    } else {
      lines.push(`Email: ${values.email || "—"}`);
      lines.push(`Title: ${values.featureTitle}`);
      lines.push(`Category: ${values.category || "—"}`);
      lines.push("", "About:", values.featureAbout);
      if (values.why) lines.push("", "Why useful:", values.why);
    }

    return (
      `mailto:${SUPPORT_EMAIL}` +
      `?subject=${encodeURIComponent(subjectMap[values.type])}` +
      `&body=${encodeURIComponent(lines.join("\n"))}`
    );
  }

  function showSubmitError(values) {
    showError(errorForm, "Couldn't send. Please try again.");
    if (errorFallback) errorFallback.hidden = false;
    if (fallbackMail) fallbackMail.href = buildMailto(values);
  }

  function showSuccessState() {
    const copy = SUCCESS[currentType] || SUCCESS.hello;
    if (typeNav) typeNav.hidden = true;
    if (formWrap) formWrap.hidden = true;
    if (successTitle) successTitle.textContent = copy.title;
    if (successCopy) successCopy.textContent = copy.copy;
    if (success) {
      success.hidden = false;
      if (successTitle) {
        successTitle.setAttribute("tabindex", "-1");
        successTitle.focus();
      }
    }
  }

  async function fileToBase64(file) {
    const buffer = await file.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  async function submitToBackend(values) {
    if (!ENDPOINT) {
      throw new Error("Feedback endpoint is not configured.");
    }

    const payload = {
      type: values.type,
      source: values.source,
      name: values.name || null,
      email: values.email || null,
      message: values.message || null,
      happened: values.happened || null,
      expected: values.expected || null,
      androidVersion: values.androidVersion || null,
      device: values.device || null,
      featureTitle: values.featureTitle || null,
      category: values.category || null,
      featureAbout: values.featureAbout || null,
      why: values.why || null,
      screenshot: null
    };

    if (values.screenshot) {
      payload.screenshot = {
        name: values.screenshot.name,
        type: values.screenshot.type,
        size: values.screenshot.size,
        dataBase64: await fileToBase64(values.screenshot)
      };
    }

    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Feedback request failed (${response.status})`);
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setType(tab.getAttribute("data-contact-type"));
    });

    tab.addEventListener("keydown", (event) => {
      const index = tabs.indexOf(tab);
      let next = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        next = tabs[(index + 1) % tabs.length];
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        next = tabs[(index - 1 + tabs.length) % tabs.length];
      } else if (event.key === "Home") {
        next = tabs[0];
      } else if (event.key === "End") {
        next = tabs[tabs.length - 1];
      }
      if (!next) return;
      event.preventDefault();
      next.focus();
      setType(next.getAttribute("data-contact-type"));
    });
  });

  form.querySelectorAll("input, textarea, select").forEach((el) => {
    el.addEventListener("input", () => {
      updateCounter(el);
      updateSubmitState();
    });
    el.addEventListener("change", updateSubmitState);
    updateCounter(el);
  });

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      setScreenshot(file || null);
      updateSubmitState();
    });
  }

  if (shotRemove) {
    shotRemove.addEventListener("click", () => {
      clearScreenshot();
      updateSubmitState();
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;

    const values = collectValues();
    if (values.company) {
      showSuccessState();
      return;
    }
    if (!validate(values)) {
      updateSubmitState();
      return;
    }

    submitting = true;
    updateSubmitState();
    if (submitLabel) submitLabel.textContent = "SENDING…";

    try {
      await submitToBackend(values);
      showSuccessState();
    } catch (err) {
      showSubmitError(values);
      if (submitLabel) submitLabel.textContent = SUBMIT_LABELS[currentType];
    } finally {
      submitting = false;
      updateSubmitState();
    }
  });

  setType("bug");
})();

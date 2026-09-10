(function () {
  const CONTACT_EMAIL = "reverse-panda@outlook.com";
  const MESSAGE_LABELS = {
    bug: "What happened?",
    feature: "What would you like to see?",
    hello: "Message"
  };
  const SUBJECTS = {
    bug: "ReversePanda — Bug report",
    feature: "ReversePanda — Feature request",
    hello: "ReversePanda — Hello"
  };

  const form = document.getElementById("contact-form");
  if (!form) return;

  const typeValue = document.getElementById("contact-type-value");
  const messageLabel = document.querySelector("[data-message-label]");
  const tabs = Array.from(document.querySelectorAll("[data-contact-type]"));
  const modeGroups = Array.from(document.querySelectorAll("[data-mode-fields]"));
  const typeNav = document.querySelector(".contact-type");
  const formWrap = document.querySelector("[data-contact-form-wrap]");
  const success = document.querySelector("[data-contact-success]");
  const fileInput = document.getElementById("contact-screenshot");
  const fileNote = document.querySelector("[data-file-note]");
  const errorEmail = document.getElementById("error-email");
  const errorMessage = document.getElementById("error-message");
  const errorForm = document.getElementById("error-form");

  let currentType = "bug";

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
      const show = group.getAttribute("data-mode-fields") === type;
      group.hidden = !show;
    });

    if (messageLabel) {
      messageLabel.textContent = MESSAGE_LABELS[type] || MESSAGE_LABELS.hello;
    }

    clearErrors();
  }

  function clearErrors() {
    [errorEmail, errorMessage, errorForm].forEach((el) => {
      if (!el) return;
      el.hidden = true;
      el.textContent = "";
    });
    form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
  }

  function showError(el, message, field) {
    if (el) {
      el.textContent = message;
      el.hidden = false;
    }
    if (field) field.classList.add("is-invalid");
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function buildBody(data) {
    const lines = [
      `Type: ${data.typeLabel}`,
      "",
      `Name: ${data.name || "—"}`,
      `Email: ${data.email}`,
      ""
    ];

    if (data.type === "bug") {
      lines.push(`App version: ${data.appVersion || "—"}`);
      lines.push(`Android version: ${data.androidVersion || "—"}`);
      lines.push(`Device: ${data.device || "—"}`);
      lines.push("");
      lines.push("What happened:");
      lines.push(data.message);
      if (data.screenshotName) {
        lines.push("");
        lines.push(`Screenshot selected: ${data.screenshotName}`);
        lines.push("(Please attach this file in your email client.)");
      }
    } else if (data.type === "feature") {
      lines.push("What would you like to see:");
      lines.push(data.message);
      if (data.why) {
        lines.push("");
        lines.push("Why would it be useful:");
        lines.push(data.why);
      }
    } else {
      lines.push("Message:");
      lines.push(data.message);
    }

    return lines.join("\n");
  }

  function showSuccess() {
    if (typeNav) typeNav.hidden = true;
    if (formWrap) formWrap.hidden = true;
    if (success) {
      success.hidden = false;
      const title = success.querySelector(".contact-success__title");
      if (title) {
        title.setAttribute("tabindex", "-1");
        title.focus();
      }
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

  if (fileInput && fileNote) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) {
        fileNote.hidden = true;
        fileNote.textContent = "";
        return;
      }
      fileNote.hidden = false;
      fileNote.textContent = `${file.name} — attach it in your email after send.`;
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    const emailField = document.getElementById("contact-email");
    const messageField = document.getElementById("contact-message");
    const email = (emailField.value || "").trim();
    const message = (messageField.value || "").trim();

    let valid = true;

    if (!email) {
      showError(errorEmail, "Please enter your email.", emailField);
      valid = false;
    } else if (!isValidEmail(email)) {
      showError(errorEmail, "Please enter a valid email.", emailField);
      valid = false;
    }

    if (!message) {
      const emptyCopy =
        currentType === "bug"
          ? "Please describe what happened."
          : currentType === "feature"
            ? "Please describe what you'd like to see."
            : "Please add a message.";
      showError(errorMessage, emptyCopy, messageField);
      valid = false;
    }

    if (!valid) {
      const firstInvalid = form.querySelector(".is-invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const screenshot = fileInput && fileInput.files && fileInput.files[0];
    const payload = {
      type: currentType,
      typeLabel: SUBJECTS[currentType].replace("ReversePanda — ", ""),
      name: (document.getElementById("contact-name").value || "").trim(),
      email,
      message,
      appVersion: (document.getElementById("contact-app-version").value || "").trim(),
      androidVersion: (document.getElementById("contact-android-version").value || "").trim(),
      device: (document.getElementById("contact-device").value || "").trim(),
      why: (document.getElementById("contact-why").value || "").trim(),
      screenshotName: screenshot ? screenshot.name : ""
    };

    try {
      const mailto =
        `mailto:${CONTACT_EMAIL}` +
        `?subject=${encodeURIComponent(SUBJECTS[currentType])}` +
        `&body=${encodeURIComponent(buildBody(payload))}`;

      window.location.href = mailto;
      showSuccess();
    } catch (err) {
      showError(errorForm, "Something went wrong. Please try again.");
    }
  });

  setType("bug");
})();

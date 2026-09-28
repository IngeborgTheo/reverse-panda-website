// Regenerates /licenses.html from the /impressum.html page shell.
// Usage: node .github/scripts/generate-licenses.mjs
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));

const esc = (text) => text.replace(/&(?!(?:[a-z]+|#\d+);)/g, "&amp;");

// External links open a new tab, so screen-reader users get told in the link name.
const ext = (href, label) =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer">${esc(label)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
const int = (href, label) => `<a href="${href}">${esc(label)}</a>`;

function entry({ id, name, desc, meta = [], links = [] }) {
  const lines = [
    `          <article class="licence-entry" aria-labelledby="lic-${id}">`,
    `            <h3 class="licence-entry__name" id="lic-${id}">${esc(name)}</h3>`
  ];
  if (desc) lines.push(`            <p class="licence-entry__desc">${esc(desc)}</p>`);
  if (meta.length) {
    lines.push(`            <dl class="licence-entry__meta">`);
    for (const [term, value] of meta) {
      lines.push(`              <div><dt>${esc(term)}</dt><dd>${esc(value)}</dd></div>`);
    }
    lines.push(`            </dl>`);
  }
  if (links.length) {
    lines.push(`            <p class="licence-entry__links">`);
    for (const link of links) lines.push(`              ${link}`);
    lines.push(`            </p>`);
  }
  lines.push(`          </article>`);
  return lines.join("\n");
}

const list = (entries) =>
  `        <div class="licence-list">\n${entries.map(entry).join("\n")}\n        </div>`;

function section({ id, title, intro, entries, outro }) {
  const prose = (text) => `        <p class="privacy-prose">\n${text}\n        </p>`;
  return [
    `      <section class="privacy-section" id="${id}" aria-labelledby="${id}-heading">`,
    `        <h2 class="privacy-section__title" id="${id}-heading">${title}</h2>`,
    intro && prose(intro),
    entries && list(entries),
    outro && prose(outro),
    `      </section>`
  ]
    .filter(Boolean)
    .join("\n");
}

const APACHE = ext("https://www.apache.org/licenses/LICENSE-2.0", "Apache License 2.0 text");

const appEntries = [
  {
    id: "androidx",
    name: "AndroidX",
    desc: "Core, Lifecycle, Activity, Compose, Material 3, WorkManager and Material Icons.",
    meta: [["Copyright", "The Android Open Source Project"], ["Licence", "Apache License 2.0"]],
    links: [ext("https://developer.android.com/jetpack/androidx", "AndroidX project page"), APACHE]
  },
  {
    id: "kotlin",
    name: "Kotlin",
    desc: "Kotlin standard library shipped with the app.",
    meta: [["Copyright", "JetBrains s.r.o. and Kotlin contributors"], ["Licence", "Apache License 2.0"]],
    links: [
      ext("https://github.com/JetBrains/kotlin", "Kotlin on GitHub"),
      ext("https://github.com/JetBrains/kotlin/blob/master/license/LICENSE.txt", "Kotlin licence")
    ]
  },
  {
    id: "coil",
    name: "Coil",
    desc: "Image loading for album artwork in the Hidden Dock media controls.",
    meta: [["Copyright", "2023 Coil Contributors"], ["Licence", "Apache License 2.0"]],
    links: [
      ext("https://github.com/coil-kt/coil", "Coil on GitHub"),
      ext("https://github.com/coil-kt/coil/blob/2.7.0/LICENSE.txt", "Coil licence")
    ]
  },
  {
    id: "roboto-app",
    name: "Roboto, Roboto Serif and Roboto Mono",
    desc: "Bundled in the app as optional label fonts.",
    meta: [
      [
        "Copyright",
        "2011 The Roboto Project Authors<br>2020 The Roboto Serif Project Authors<br>2015 The Roboto Mono Project Authors"
      ],
      ["Licence", "SIL Open Font License 1.1"]
    ],
    links: [
      ext("https://github.com/googlefonts/roboto-classic", "Roboto on GitHub"),
      ext("https://github.com/googlefonts/RobotoSerif", "Roboto Serif on GitHub"),
      ext("https://github.com/googlefonts/robotomono", "Roboto Mono on GitHub"),
      ext("https://github.com/googlefonts/roboto-classic/blob/main/OFL.txt", "Roboto licence")
    ]
  },
  {
    id: "bebas-app",
    name: "Bebas Neue",
    desc: "Bundled in the app as display typeface.",
    meta: [["Copyright", "2019 The Bebas Neue Project Authors"], ["Licence", "SIL Open Font License 1.1"]],
    links: [
      ext("https://github.com/dharmatype/Bebas-Neue", "Bebas Neue on GitHub"),
      ext("https://github.com/dharmatype/Bebas-Neue/blob/master/OFL.txt", "Bebas Neue licence")
    ]
  },
  {
    id: "courier-prime",
    name: "Courier Prime",
    desc: "Bundled in the app as body typeface.",
    meta: [["Copyright", "2015 The Courier Prime Project Authors"], ["Licence", "SIL Open Font License 1.1"]],
    links: [
      ext("https://github.com/quoteunquoteapps/CourierPrime", "Courier Prime on GitHub"),
      ext("https://github.com/quoteunquoteapps/CourierPrime/blob/master/OFL.txt", "Courier Prime licence")
    ]
  },
  {
    id: "firebase-android",
    name: "Firebase Android SDK",
    desc: "Firebase BoM 34.18.0: Crashlytics 20.1.0, App Check 19.4.1, Cloud Functions 22.1.1 and Cloud Storage 22.0.1. Analytics is listed separately below because it is not Apache-licensed.",
    meta: [["Copyright", "Google LLC"], ["Licence", "Apache License 2.0"]],
    links: [
      ext("https://github.com/firebase/firebase-android-sdk", "Firebase Android SDK on GitHub"),
      ext("https://github.com/firebase/firebase-android-sdk/blob/main/LICENSE", "Firebase Android SDK licence")
    ]
  }
];

const sdkEntries = [
  {
    id: "google-play-services",
    name: "Google Analytics for Firebase and Google Play services",
    desc: "firebase-analytics 23.2.0 and Google Play services measurement 23.2.0. These are not in the firebase-android-sdk source repository.",
    meta: [["Provider", "Google LLC"], ["Terms", "Android Software Development Kit License"]],
    links: [ext("https://developer.android.com/studio/terms.html", "Android SDK License")]
  },
  {
    id: "play-integrity",
    name: "Play Integrity API",
    desc: "com.google.android.play:integrity:1.4.0, pulled in by Firebase App Check Play Integrity.",
    meta: [["Provider", "Google LLC"], ["Terms", "Play Integrity API Terms of Service"]],
    links: [ext("https://developer.android.com/google/play/integrity/overview#tos", "Play Integrity API terms")]
  },
  {
    id: "play-core-common",
    name: "Play Core common library",
    desc: "com.google.android.play:core-common:2.0.4, pulled in by the Play Integrity API.",
    meta: [["Provider", "Google LLC"], ["Terms", "Play Core Software Development Kit Terms of Service"]],
    links: [ext("https://developer.android.com/guide/playcore/license", "Play Core SDK terms")]
  }
];

const webEntries = [
  {
    id: "bebas-web",
    name: "Bebas Neue",
    desc: "Headline typeface, self-hosted on this website.",
    meta: [["Copyright", "© 2010 by Dharma Type"], ["Licence", "SIL Open Font License 1.1"]],
    links: [
      ext("https://github.com/dharmatype/Bebas-Neue", "Bebas Neue on GitHub"),
      int("/assets/fonts/OFL-BebasNeue.txt", "Bebas Neue licence (included)")
    ]
  },
  {
    id: "roboto-web",
    name: "Roboto",
    desc: "Body typeface, self-hosted on this website.",
    meta: [["Copyright", "2011 The Roboto Project Authors"], ["Licence", "SIL Open Font License 1.1"]],
    links: [
      ext("https://github.com/googlefonts/roboto-classic", "Roboto on GitHub"),
      int("/assets/fonts/OFL-Roboto.txt", "Roboto licence (included)")
    ]
  },
  {
    id: "firebase-js",
    name: "Firebase JavaScript SDK",
    desc: "Used on the Contact page for feedback submission, screenshot uploads and App Check. Loaded from Google’s servers, not bundled with this website.",
    meta: [["Copyright", "Google LLC"], ["Licence", "Apache License 2.0"]],
    links: [
      ext("https://github.com/firebase/firebase-js-sdk", "Firebase JS SDK on GitHub"),
      ext("https://github.com/firebase/firebase-js-sdk/blob/main/LICENSE", "Firebase JS SDK licence")
    ]
  }
];

const mediaEntries = [
  {
    id: "vitiligo-photo",
    name: "Vitiligo hand photo",
    desc: "Photo by Vika Glitter on Pexels, shown in the Story section on the homepage."
  },
  {
    id: "flat-square",
    name: "Flat Square",
    desc: "Icon pack by Fábio Lopes, shown in the icon comparison on the homepage.",
    links: [ext("https://play.google.com/store/apps/details?id=com.fabio.flat.squircle.iconpack", "Flat Square on Google Play")]
  }
];

const toolEntries = [
  {
    id: "rotato",
    name: "Rotato",
    desc: "Device mockups created with Rotato.",
    links: [ext("https://rotato.app", "Rotato website")]
  }
];

const inspirationEntries = [
  {
    id: "icarousel",
    name: "iCarousel",
    desc: "Inspired some dock layout ideas. ReversePanda does not include or adapt iCarousel source code.",
    meta: [["Author", "Nick Lockwood / Charcoal Design"]],
    links: [ext("https://github.com/nicklockwood/iCarousel", "iCarousel on GitHub")]
  },
  {
    id: "cirdock",
    name: "CirDock",
    desc: "Inspired some dock transform ideas. ReversePanda does not include or adapt CirDock source code.",
    meta: [["Author", "BraveHeartDev"]],
    links: [ext("https://github.com/BraveHeartDev/CirDock", "CirDock on GitHub")]
  },
  {
    id: "cylinder",
    name: "Cylinder",
    desc: "Inspired some launcher transition concepts. ReversePanda does not include or adapt Cylinder source code.",
    meta: [["Author", "Reed Weichler"]],
    links: [ext("https://github.com/rweichler/cylinder", "Cylinder on GitHub")]
  },
  {
    id: "cylinder-reborn",
    name: "Cylinder Reborn",
    desc: "Continuation of Cylinder that inspired some launcher transition concepts. ReversePanda does not include or adapt Cylinder Reborn source code.",
    meta: [["Author", "Ryan Nair"]],
    links: [ext("https://github.com/ryannair05/Cylinder-Reborn", "Cylinder Reborn on GitHub")]
  },
  {
    id: "apex2",
    name: "Apex 2",
    desc: "Inspired aspects of the Satellite folder interaction. ReversePanda does not include or adapt Apex 2 source code, and Satellite is not a port of Apex 2.",
    meta: [["Authors", "Sentry (concept & design), Aditya KD (development)"]],
    links: [ext("http://moreinfo.thebigboss.org/moreinfo/depiction.php?file=apex2Dp", "Apex 2 on BigBoss")]
  },
  {
    id: "honey",
    name: "Honey",
    desc: "Inspired aspects of watchOS-style Home Screen interaction. ReversePanda does not include or adapt Honey source code or assets.",
    meta: [["Author", "Blake Boxberger"]],
    links: [ext("https://www.idownloadblog.com/2019/07/15/honey/", "Article about Honey on iDownloadBlog")]
  },
  {
    id: "shylabels",
    name: "ShyLabels",
    desc: "Inspired aspects of the automatic Home Screen label hiding. ReversePanda does not include or adapt ShyLabels source code.",
    meta: [["Author", "NoisyFlake"]],
    links: [ext("https://github.com/NoisyFlake/ShyLabels", "ShyLabels on GitHub")]
  },
  {
    id: "anisette",
    name: "Anisette",
    desc: "Inspired aspects of the Hidden Dock. ReversePanda does not include or adapt Anisette source code.",
    meta: [["Author", "CP Digital Darkroom"]],
    links: [ext("https://cydia.saurik.com/package/com.cpdigitaldarkroom.anis/", "Anisette on Cydia")]
  },
  {
    id: "springtomize",
    name: "Springtomize 3",
    desc: "Earlier customization project acknowledged as inspiration. ReversePanda does not include or adapt Springtomize source code.",
    meta: [["Authors", "Filippo & Janosch"]],
    links: [ext("https://cydia.saurik.com/package/com.filippobiga.springtomize3/", "Springtomize 3 on Cydia")]
  }
];

const main = `      <header class="privacy-hero">
        <p class="privacy-hero__label">LEGAL</p>
        <h1 class="privacy-hero__title">SOURCES &amp;<br>LICENCES</h1>
        <p class="privacy-hero__lead">
          ReversePanda uses and draws inspiration from open-source projects,
          third-party components and earlier customization tools.
          Credits and licence information are listed below.
        </p>
        <p class="privacy-hero__updated">Last updated: September 2026</p>
      </header>

${[
  section({
    id: "app-components",
    title: "OPEN-SOURCE COMPONENTS<br>IN THE APP",
    intro: `          Software and fonts included in the ReversePanda Android app. The full licence texts
          are also available in the app settings under “Sources &amp; licenses”.`,
    entries: appEntries
  }),
  section({
    id: "app-sdks",
    title: "THIRD-PARTY SDKs<br>IN THE APP",
    intro: `          Google SDKs included in the app that are provided under Google’s own terms rather
          than an open-source licence.`,
    entries: sdkEntries
  }),
  section({
    id: "website-components",
    title: "THIRD-PARTY COMPONENTS<br>ON THIS WEBSITE",
    entries: webEntries
  }),
  section({
    id: "media-credits",
    title: "MEDIA &amp;<br>PHOTO CREDITS",
    entries: mediaEntries,
    outro: `          Some screenshots show other software for comparison, such as Pixel Launcher on a Google
          Pixel or iOS on an older iPhone. Their interface elements, icons, wallpapers and
          trademarks remain the property of their respective owners.`
  }),
  section({
    id: "creation-tools",
    title: "CREATION TOOLS",
    entries: toolEntries
  }),
  section({
    id: "inspiration",
    title: "INSPIRATION &amp;<br>ACKNOWLEDGEMENTS",
    intro: `          ReversePanda includes interaction and visual ideas inspired by earlier launcher and
          customization projects. They are listed here as a thank-you. Unless stated above,
          ReversePanda does not include their source code, and it is not affiliated with or
          endorsed by them.`,
    entries: inspirationEntries
  }),
  section({
    id: "trademarks",
    title: "TRADEMARKS",
    intro: `          Third-party names and trademarks mentioned on this page remain the property of
          their respective owners.`
  })
].join("\n\n")}

      <section class="privacy-section privacy-contact" id="contact" aria-labelledby="contact-heading">
        <h2 class="privacy-section__title" id="contact-heading">MISSING A CREDIT?</h2>
        <p class="privacy-prose">
          If you believe a credit is missing or incorrect, please get in touch:
        </p>
        <p class="privacy-contact__email">
          <a href="mailto:support@reverse-panda.ch">support@reverse-panda.ch</a>
        </p>
      </section>`;

// The Impressum shell supplies the head, skip link, header, footer and scripts.
let html = (await readFile(root + "impressum.html", "utf8")).replace(/\r\n/g, "\n");
const replaceOnce = (pattern, replacement) => {
  if (!pattern.test(html)) throw new Error(`Template pattern not found: ${pattern}`);
  html = html.replace(pattern, replacement);
};

replaceOnce(/<title>[^<]*<\/title>/, "<title>Sources &amp; Licences – ReversePanda</title>");
replaceOnce(
  /<meta name="description" content="[^"]*">/,
  '<meta name="description" content="Open-source components, font licences, media credits, creation tools and inspiration behind the ReversePanda Android launcher and website.">'
);
replaceOnce(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="https://reverse-panda.ch/licenses.html">');
replaceOnce(/<body class="[^"]*">/, '<body class="page-privacy page-legal page-licenses">');
replaceOnce(/ aria-current="page"/g, "");
replaceOnce(
  /<li><a href="\/licenses\.html">Sources &amp; Licences<\/a><\/li>/,
  '<li><a href="/licenses.html" aria-current="page">Sources &amp; Licences</a></li>'
);

const openTag = '<main id="main-content" class="privacy-page">';
const start = html.indexOf(openTag);
const end = html.indexOf("    </main>");
if (start < 0 || end < 0) throw new Error("Template <main> not found");
html = html.slice(0, start + openTag.length) + "\n" + main + "\n" + html.slice(end);

await writeFile(root + "licenses.html", html);
console.log("generated licenses.html");

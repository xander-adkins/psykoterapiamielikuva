async function fetchText(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) return "";
  return (await response.text()).trim();
}

async function loadTextMap(files, defaults) {
  const entries = await Promise.all(
    Object.entries(files).map(async ([key, path]) => [key, await fetchText(path)]),
  );
  const loaded = Object.fromEntries(entries);
  return Object.fromEntries(
    Object.keys(defaults).map((key) => [key, loaded[key] || defaults[key] || ""]),
  );
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "";
}

function renderParagraphs(containerId, paragraphs) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  for (const paragraph of paragraphs.filter(Boolean)) {
    const p = document.createElement("p");
    p.textContent = paragraph;
    container.appendChild(p);
  }
}

function renderContact(content) {
  const street = document.getElementById("street");
  const postalCity = document.getElementById("postal-city");
  const openingHours = document.getElementById("opening-hours");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  if (!street || !postalCity || !openingHours || !email || !phone) return;

  street.textContent = content.street || "";
  postalCity.textContent = content.postalCity || "";
  openingHours.textContent = content.openingHours || "";
  openingHours.style.display = content.openingHours ? "block" : "none";

  if (content.email) {
    email.textContent = content.email;
    email.href = `mailto:${content.email}`;
    email.parentElement.style.display = "block";
  } else {
    email.textContent = "";
    email.removeAttribute("href");
    email.parentElement.style.display = "none";
  }

  const phoneHref = content.phoneIntl || content.phoneDisplay || "";
  if (phoneHref && content.phoneDisplay) {
    phone.textContent = content.phoneDisplay;
    phone.href = `tel:${phoneHref}`;
    phone.parentElement.style.display = "block";
  } else {
    phone.textContent = "";
    phone.removeAttribute("href");
    phone.parentElement.style.display = "none";
  }
}

async function renderHome() {
  const content = await loadTextMap(
    {
      pageTitle: "texts/home/page-title.txt",
      intro1: "texts/home/intro-1.txt",
      intro2: "texts/home/intro-2.txt",
    },
    {
      pageTitle: "Tervetuloa",
      intro1: "",
      intro2: "",
    },
  );
  setText("content-page-title", content.pageTitle);
  renderParagraphs("intro-text", [content.intro1, content.intro2]);
}

async function renderAbout() {
  const about = await loadTextMap(
    {
      pageTitle: "texts/about/page-title.txt",
      intro1: "texts/about/intro-1.txt",
      intro2: "texts/about/intro-2.txt",
      historyTitle: "texts/about/history-title.txt",
      history1: "texts/about/history-1.txt",
      history2: "texts/about/history-2.txt",
    },
    {
      pageTitle: "Tausta ja työote",
      intro1: "",
      intro2: "",
      historyTitle: "Tausta ja koulutus",
      history1: "",
      history2: "",
    },
  );
  setText("content-page-title", about.pageTitle);
  setText("about-history-title", about.historyTitle);
  renderParagraphs("intro-text", [about.intro1, about.intro2]);
  renderParagraphs("about-history-text", [about.history1, about.history2]);
}

async function renderContactPage() {
  const contact = await loadTextMap(
    {
      pageTitle: "texts/contact/page-title.txt",
      intro1: "texts/contact/intro-1.txt",
      intro2: "texts/contact/intro-2.txt",
      street: "texts/contact/street.txt",
      postalCity: "texts/contact/postal-city.txt",
      openingHours: "texts/contact/opening-hours.txt",
      email: "texts/contact/email.txt",
      phoneDisplay: "texts/contact/phone-display.txt",
      phoneIntl: "texts/contact/phone-intl.txt",
    },
    {
      pageTitle: "Ota yhteyttä",
      intro1: "",
      intro2: "",
      street: "",
      postalCity: "",
      openingHours: "",
      email: "",
      phoneDisplay: "",
      phoneIntl: "",
    },
  );
  setText("content-page-title", contact.pageTitle);
  renderParagraphs("intro-text", [contact.intro1, contact.intro2]);

  renderContact(contact);
}

async function renderSharedHero() {
  const hero = await loadTextMap(
    {
      companyName: "texts/shared-hero/title.txt",
      subtitle: "texts/shared-hero/subtitle.txt",
      image: "texts/shared-hero/image.txt",
    },
    {
      companyName: "PSYKOTERAPIA MIELIKUVA",
      subtitle: "Psykoterapiapalvelut",
      image: "kuva.jpg",
    },
  );

  setText("company-name", hero.companyName);
  setText("page-subtitle", hero.subtitle);
  const image = document.getElementById("hero-image");
  if (image && hero.image) {
    const current = new URL(image.getAttribute("src") || "", window.location.href).href;
    const next = new URL(hero.image, window.location.href).href;
    if (current !== next) image.src = hero.image;
  }
}

function renderFallback() {
  const intro = document.getElementById("intro-text");
  if (!intro) return;
  intro.innerHTML =
    "<p>Sivun sisallon latauksessa tapahtui virhe. Yrita paivittaa sivu uudelleen.</p>";
}

async function initPage() {
  try {
    await renderSharedHero();
    const page = document.body.dataset.page || "home";
    if (page === "about") {
      await renderAbout();
    } else if (page === "contact") {
      await renderContactPage();
    } else {
      await renderHome();
    }
  } catch (error) {
    renderFallback();
  }
}

initPage();

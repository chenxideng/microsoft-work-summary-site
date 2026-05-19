const SUPPORTED_LOCALES = ['en', 'zh-Hans', 'zh-Hant'];

function setText(id, value) {
  const element = document.getElementById(id);
  if (element && typeof value === 'string') {
    element.textContent = value;
  }
}

function setActiveLocaleButton(locale) {
  document.querySelectorAll('[data-locale]').forEach((button) => {
    const isActive = button.dataset.locale === locale;
    button.setAttribute('aria-pressed', String(isActive));
    button.classList.toggle('is-active', isActive);
  });
}

function renderMetricList(listId, metrics) {
  const list = document.getElementById(listId);
  if (!list || !Array.isArray(metrics)) {
    return;
  }

  list.innerHTML = metrics
    .map(
      (metric) => `
        <li class="metric-card">
          <span>${metric.value}</span>
          <p>${metric.label}</p>
        </li>`
    )
    .join('');
}

function renderProjectCards(containerId, projects) {
  const cards = document.getElementById(containerId);
  if (!cards || !Array.isArray(projects)) {
    return;
  }

  cards.innerHTML = projects
    .map(
      (project) => `
        <article class="card project">
          <p class="tag">${project.tag}</p>
          <h3>${project.name}</h3>
          <p>${project.description}</p>
          <div class="kv"><span data-field="status">Status</span><strong>${project.status}</strong></div>
          <div class="kv"><span data-field="impact">Impact</span><strong>${project.impact}</strong></div>
        </article>`
    )
    .join('');
}

function renderActivities(items) {
  const timeline = document.getElementById('activities-timeline');
  if (!timeline || !Array.isArray(items)) {
    return;
  }

  timeline.innerHTML = items
    .map(
      (item) => `
        <article class="timeline-item card">
          <span class="dot" aria-hidden="true"></span>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <small>${item.role}</small>
        </article>`
    )
    .join('');
}

function renderCertifications(items) {
  const list = document.getElementById('certifications-list');
  if (!list) {
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    list.innerHTML = '';
    return;
  }

  list.innerHTML = items
    .map(
      (item) => `
        <article class="card cert-card">
          <p class="tag">${item.issuer || 'Certification'}</p>
          <h3>${item.name}</h3>
          <p>${item.meta || ''}</p>
          ${item.url ? `<a class="cert-link" href="${item.url}" target="_blank" rel="noreferrer">View credential</a>` : ''}
        </article>`
    )
    .join('');
}

function renderList(listId, values) {
  const list = document.getElementById(listId);
  if (!list || !Array.isArray(values)) {
    return;
  }

  list.innerHTML = values.map((value) => `<li>${value}</li>`).join('');
}

function initRevealAnimation() {
  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${index * 110}ms`;
    observer.observe(element);
  });
}

function initSmoothScroll() {
  document.querySelectorAll('[data-scroll]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.querySelector(button.dataset.scroll);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function initMobileMenu() {
  const header = document.getElementById('main-header');
  const toggle = document.getElementById('menu-toggle');
  const actions = document.getElementById('header-actions');
  if (!header || !toggle || !actions) {
    return;
  }

  toggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  actions.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 760px)').matches) {
        header.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

function applyLocale(data, locale) {
  const selectedLocale = SUPPORTED_LOCALES.includes(locale) ? locale : data.defaultLocale || 'en';
  const localized = data.locales?.[selectedLocale] || data.locales?.[data.defaultLocale] || data.locales?.en;

  document.documentElement.lang = selectedLocale;
  document.title = localized.site?.title || '工作总结看板';
  setActiveLocaleButton(selectedLocale);

  setText('hero-btn-pmx', localized.labels?.buttonPmx);
  setText('hero-btn-solution-build', localized.labels?.buttonSolutionBuild);
  setText('hero-btn-activities', localized.labels?.buttonActivities);

  setText('brand-label', localized.site?.brandLabel);
  setText('site-title', localized.site?.title);
  setText('nav-overview', localized.site?.nav?.overview);
  setText('nav-profile', localized.site?.nav?.profile);
  setText('nav-certifications', localized.site?.nav?.certifications);
  setText('nav-pmx', localized.site?.nav?.pmx);
  setText('nav-solution-build', localized.site?.nav?.solutionBuild);
  setText('nav-activities', localized.site?.nav?.activities);
  setText('nav-next', localized.site?.nav?.next);
  setText('footer-text', localized.site?.footer);

  setText('overview-eyebrow', localized.overview?.eyebrow);
  setText('overview-title', localized.overview?.title);
  setText('overview-description', localized.overview?.description);
  setText('metrics-title', localized.overview?.metricsTitle);
  renderMetricList('metrics-list', localized.overview?.metrics);

  setText('profile-eyebrow', localized.profile?.eyebrow);
  setText('profile-name', localized.profile?.name);
  setText('profile-title', localized.profile?.title);
  setText('profile-summary', localized.profile?.summary);

  const profileLink = document.getElementById('profile-linkedin');
  if (profileLink && localized.profile?.linkedinUrl) {
    profileLink.href = localized.profile.linkedinUrl;
  }

  const profileAvatar = document.getElementById('profile-avatar');
  const profileFallback = document.getElementById('profile-avatar-fallback');
  if (profileAvatar) {
    const avatarPath = localized.profile?.avatarPath || 'profile-avatar.png';
    profileAvatar.src = avatarPath;
    profileAvatar.onerror = () => {
      profileAvatar.style.display = 'none';
      if (profileFallback) {
        profileFallback.style.display = 'grid';
      }
    };
    profileAvatar.onload = () => {
      profileAvatar.style.display = 'block';
      if (profileFallback) {
        profileFallback.style.display = 'none';
      }
    };
  }

  setText('certifications-eyebrow', localized.certifications?.eyebrow);
  setText('certifications-title', localized.certifications?.title);
  setText('certifications-intro', localized.certifications?.intro);
  setText('certifications-note', localized.certifications?.note);
  renderCertifications(localized.certifications?.items);

  setText('pmx-eyebrow', localized.pmx?.eyebrow);
  setText('pmx-title', localized.pmx?.title);
  setText('pmx-intro', localized.pmx?.intro);
  setText('pmx-detail-eyebrow', localized.pmx?.eyebrow);
  setText('pmx-detail-title', localized.pmx?.detailTitle);
  setText('pmx-detail-description', localized.pmx?.detailDescription);
  setText('pmx-detail-note', localized.pmx?.detailNote);
  setText('pmx-metrics-title', localized.pmx?.metricsTitle);
  renderMetricList('pmx-metrics-list', localized.pmx?.metrics);
  renderProjectCards('pmx-cards', localized.pmx?.projects);

  const workbookFrame = document.getElementById('pmx-workbook-frame');
  if (workbookFrame) {
    workbookFrame.src = data.workbook?.path || 'pmx-workbook.html';
    workbookFrame.title = localized.pmx?.detailTitle || 'PMX workbook';
  }

  setText('solution-build-eyebrow', localized.solutionBuild?.eyebrow);
  setText('solution-build-title', localized.solutionBuild?.title);
  setText('solution-build-intro', localized.solutionBuild?.intro);
  setText('solution-build-metrics-title', localized.solutionBuild?.metricsTitle);
  renderMetricList('solution-build-metrics-list', localized.solutionBuild?.metrics);
  renderProjectCards('solution-build-cards', localized.solutionBuild?.projects);
  setText('solution-build-note', localized.solutionBuild?.note);

  setText('activities-eyebrow', localized.activities?.eyebrow);
  setText('activities-title', localized.activities?.title);
  setText('activities-intro', localized.activities?.intro);
  setText('activities-metrics-title', localized.activities?.metricsTitle);
  renderMetricList('activities-metrics-list', localized.activities?.metrics);
  renderActivities(localized.activities?.items);

  setText('next-eyebrow', localized.next?.eyebrow);
  setText('next-title', localized.next?.title);
  setText('next-project-title', localized.next?.projectTitle);
  setText('next-org-title', localized.next?.orgTitle);
  renderList('next-project-list', localized.next?.projectItems);
  renderList('next-org-list', localized.next?.orgItems);

  document.querySelectorAll('.project .kv span[data-field="status"]').forEach((element) => {
    element.textContent = localized.labels?.status || 'Status';
  });
  document.querySelectorAll('.project .kv span[data-field="impact"]').forEach((element) => {
    element.textContent = localized.labels?.impact || 'Impact';
  });
}

function bindLocaleSwitcher(data) {
  document.querySelectorAll('[data-locale]').forEach((button) => {
    button.addEventListener('click', () => {
      const locale = button.dataset.locale;
      localStorage.setItem('work-summary-locale', locale);
      applyLocale(data, locale);
    });
  });
}

async function loadContent() {
  try {
    const response = await fetch('content.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load content.json: ${response.status}`);
    }

    const data = await response.json();
    bindLocaleSwitcher(data);

    const savedLocale = localStorage.getItem('work-summary-locale');
    applyLocale(data, savedLocale || data.defaultLocale || 'en');
  } catch (error) {
    console.error(error);
  }
}

initRevealAnimation();
initSmoothScroll();
initMobileMenu();
loadContent();

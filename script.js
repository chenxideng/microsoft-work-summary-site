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

function companyLogo(name) {
  if (!name) return '';
  const key = String(name).toLowerCase();
  let file = '';
  if (key.includes('microsoft') || key.includes('微软') || key.includes('微軟')) file = 'logos/microsoft.jpg';
  else if (key.includes('tencent') || key.includes('腾讯') || key.includes('騰訊')) file = 'logos/tencent.jpg';
  else if (key.includes('ant') || key.includes('蚂蚁') || key.includes('螞蟻')) file = 'logos/ant-group.jpg';
  if (!file) return '';
  return `<img class="experience-logo" src="${file}" alt="${String(name).replace(/"/g, '&quot;')}" loading="lazy" />`;
}

function schoolLogo(name) {
  if (!name) return '';
  const key = String(name).toLowerCase();
  let file = '';
  if (key.includes('chinese university') || key.includes('香港中文')) file = 'logos/cuhk.jpg';
  else if (key.includes('electronic science') || key.includes('uestc') || key.includes('电子科技') || key.includes('電子科技')) file = 'logos/uestc.jpg';
  if (!file) return '';
  return `<img class="experience-logo" src="${file}" alt="${String(name).replace(/"/g, '&quot;')}" loading="lazy" />`;
}

function renderExperience(items) {
  const list = document.getElementById('experience-list');
  if (!list || !Array.isArray(items)) {
    return;
  }

  list.innerHTML = items
    .map(
      (item) => `
        <li class="experience-item">
          <div class="experience-row">
            <div class="experience-head">
              ${companyLogo(item.company)}
              <p class="experience-role">${item.role || ''}</p>
            </div>
            <p class="experience-date">${item.date || ''}</p>
          </div>
          <p class="experience-company">${item.company || ''}</p>
          <p class="experience-location">${item.location || ''}</p>
        </li>`
    )
    .join('');
}

function renderEducation(items) {
  const list = document.getElementById('education-list');
  if (!list || !Array.isArray(items)) {
    return;
  }

  list.innerHTML = items
    .map(
      (item) => `
        <li class="experience-item">
          <div class="experience-row">
            <div class="experience-head">
              ${schoolLogo(item.school)}
              <p class="experience-role">${item.school || ''}</p>
            </div>
            <p class="experience-date">${item.date || ''}</p>
          </div>
          <p class="experience-company">${[item.degree, item.field].filter(Boolean).join(' · ')}</p>
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

function issuerLogo(issuer) {
  if (!issuer) return '';
  const key = String(issuer).toLowerCase();
  let file = '';
  if (key.includes('microsoft') || key.includes('微软') || key.includes('微軟')) file = 'logos/microsoft.jpg';
  else if (key.includes('google')) file = 'logos/google-cloud.jpg';
  else if (key.includes('aws') || key.includes('amazon')) file = 'logos/aws.jpg';
  else if (key.includes('tencent cloud') || key.includes('腾讯云') || key.includes('騰訊雲')) file = 'logos/tencent-cloud.jpg';
  else if (key.includes('tencent') || key.includes('腾讯') || key.includes('騰訊')) file = 'logos/tencent.jpg';
  else if (key.includes('ant') || key.includes('蚂蚁') || key.includes('螞蟻')) file = 'logos/ant-group.jpg';
  if (!file) return '';
  return `<img class="cert-logo" src="${file}" alt="${String(issuer).replace(/"/g, '&quot;')}" loading="lazy" />`;
}

function renderCertifications(items, labels) {
  const list = document.getElementById('certifications-list');
  if (!list) {
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    list.innerHTML = '';
    return;
  }

  const issuedLabel = labels?.issued || 'Issued';
  const expiresLabel = labels?.expires || 'Expires';
  const credLabel = labels?.credentialId || 'Credential ID';

  list.innerHTML = items
    .map((item) => {
      const dateLine = [
        item.issued ? `${issuedLabel} ${item.issued}` : '',
        item.expires ? `${expiresLabel} ${item.expires}` : ''
      ].filter(Boolean).join(' · ');
      const credLine = item.credentialId ? `<p class="cert-cred"><span>${credLabel}</span> <code>${item.credentialId}</code></p>` : '';
      const link = item.url ? `<a class="cert-link" href="${item.url}" target="_blank" rel="noreferrer">View credential</a>` : '';
      return `
        <article class="card cert-card">
          <div class="cert-head">
            ${issuerLogo(item.issuer)}
            <p class="tag">${item.issuer || 'Certification'}</p>
          </div>
          <h3>${item.name}</h3>
          ${dateLine ? `<p class="cert-dates">${dateLine}</p>` : ''}
          ${credLine}
          ${link}
        </article>`;
    })
    .join('');
}

function renderEnablementEvents(events, labels) {
  const container = document.getElementById('enablement-events');
  if (!container || !Array.isArray(events)) {
    return;
  }
  const na = labels?.na || 'N/A';
  container.innerHTML = events
    .map((event, idx) => {
      const photos = Array.isArray(event.photos) ? event.photos : [];
      const photoHtml = photos.length
        ? `<div class="event-photos">${photos
            .map(
              (src) =>
                `<a class="event-photo" href="${src}" target="_blank" rel="noreferrer"><img src="${src}" alt="${(event.title || '').replace(/"/g, '&quot;')}" loading="lazy"></a>`
            )
            .join('')}</div>`
        : '';
      const actualValue = event.actual != null
        ? `${event.actual}${event.actualPercent ? ` <small>(${event.actualPercent})</small>` : ''}`
        : na;
      const leadsValue = event.leads != null ? event.leads : na;
      const highlights = Array.isArray(event.highlights) && event.highlights.length
        ? `<div class="event-block"><p class="event-block-title">${labels?.highlights || 'Key achievements'}</p><ul>${event.highlights.map((h) => `<li>${h}</li>`).join('')}</ul></div>`
        : '';
      const nextSteps = Array.isArray(event.nextSteps) && event.nextSteps.length
        ? `<div class="event-block"><p class="event-block-title">${labels?.nextSteps || 'Conclusion & next steps'}</p><ul>${event.nextSteps.map((n) => `<li>${n}</li>`).join('')}</ul></div>`
        : '';
      return `
        <article class="event-card card" id="${event.id || ''}">
          <header class="event-head">
            <p class="event-index">${String(idx + 1).padStart(2, '0')} · ${event.date || ''}</p>
            <h3>${event.title || ''}</h3>
            ${event.subtitle ? `<p class="event-subtitle">${event.subtitle}</p>` : ''}
          </header>
          ${photoHtml}
          <ul class="event-metrics metric-strip">
            <li class="metric-card"><span>${event.registered != null ? event.registered : na}</span><p>${labels?.registered || 'Registered'}</p></li>
            <li class="metric-card"><span>${actualValue}</span><p>${labels?.actual || 'Actual'}</p></li>
            <li class="metric-card"><span>${leadsValue}</span><p>${labels?.leads || 'Qualified leads'}</p></li>
          </ul>
          ${event.summary ? `<div class="event-block"><p class="event-block-title">${labels?.summary || 'Executive summary'}</p><p>${event.summary}</p></div>` : ''}
          ${highlights}
          ${nextSteps}
        </article>`;
    })
    .join('');
}

function renderSolutionBuildProjects(projects, labels) {
  const container = document.getElementById('sbd-projects');
  if (!container || !Array.isArray(projects)) {
    return;
  }
  const rows = projects
    .map((p, idx) => {
      const status = (p.status || '').toUpperCase();
      const badgeLabel = status === 'OA' ? (labels?.oa || 'Activated') : (labels?.ov || 'Validation');
      const badgeClass = status === 'OA' ? 'status-oa' : 'status-ov';
      const marketplace = p.marketplace
        ? `<p class="offer-marketplace"><span class="offer-marketplace-tag">Marketplace</span> ${p.marketplace}</p>`
        : '';
      return `
        <article class="offer-row">
          <div class="offer-row-head">
            <span class="offer-index">${String(idx + 1).padStart(2, '0')}</span>
            <span class="offer-date">${p.date || ''}</span>
            <span class="offer-partner">${p.partner || ''}</span>
            <span class="offer-type">${p.type || ''}</span>
            <span class="offer-status-badge ${badgeClass}">${status} · ${badgeLabel}</span>
          </div>
          <h4 class="offer-name">${p.name || ''}</h4>
          ${p.achievement ? `<p class="offer-achievement">${p.achievement}</p>` : ''}
          ${marketplace}
        </article>`;
    })
    .join('');
  container.innerHTML = rows;
}

function renderSolutionBuildDeepDives(items, labels) {
  const container = document.getElementById('sbd-deep-dives');
  if (!container || !Array.isArray(items)) {
    return;
  }
  container.innerHTML = items
    .map((d, idx) => {
      const meta = [
        d.partner ? { k: labels?.partner || 'Partner', v: d.partner } : null,
        d.solutionArea ? { k: labels?.solutionArea || 'Solution area', v: d.solutionArea } : null,
        d.geography ? { k: labels?.geography || 'Geography', v: d.geography } : null,
        d.activationMotion ? { k: labels?.activationMotion || 'Activation motion', v: d.activationMotion } : null,
        d.activationTiming ? { k: labels?.activationTiming || 'Timing', v: d.activationTiming } : null,
      ].filter(Boolean);
      const metaHtml = meta.length
        ? `<dl class="offer-meta">${meta.map((m) => `<div><dt>${m.k}</dt><dd>${m.v}</dd></div>`).join('')}</dl>`
        : '';
      const revenue = d.revenueOutlook
        ? `<div class="event-block"><p class="event-block-title">${labels?.revenueOutlook || 'Revenue outlook'}</p><p>${d.revenueOutlook}</p></div>`
        : '';
      const summary = d.summary
        ? `<div class="event-block"><p class="event-block-title">${labels?.summary || 'Offer summary'}</p><p>${d.summary}</p></div>`
        : '';
      const phases = Array.isArray(d.phases) && d.phases.length
        ? `<div class="event-block"><p class="event-block-title">${labels?.roadmap || 'Roadmap to Revenue'}</p><div class="offer-phases">${d.phases
            .map((ph) => `<div class="offer-phase"><h5>${ph.title || ''}</h5><p>${ph.body || ''}</p></div>`)
            .join('')}</div></div>`
        : '';
      const team = Array.isArray(d.team) && d.team.length
        ? `<div class="event-block"><p class="event-block-title">${labels?.team || 'The team'}</p><ul class="offer-team">${d.team
            .map((t) => `<li><strong>${t.name || ''}</strong>${t.role ? ` <span>· ${t.role}</span>` : ''}</li>`)
            .join('')}</ul></div>`
        : '';
      return `
        <article class="event-card card" id="${d.id || ''}">
          <header class="event-head">
            <p class="event-index">${String(idx + 1).padStart(2, '0')}</p>
            <h3>${d.title || ''}</h3>
          </header>
          ${metaHtml}
          ${summary}
          ${revenue}
          ${phases}
          ${team}
        </article>`;
    })
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
    { threshold: 0.01 }
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

function initBackToTop() {
  if (document.getElementById('back-to-top')) {
    return;
  }
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'back-to-top';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 14 12 8 18 14"/></svg>';
  document.body.appendChild(btn);
  const toggle = () => {
    if (window.scrollY > 320) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  };
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}

function initMobileMenu() {
  const header = document.getElementById('main-header');
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('primary-nav');
  if (!header || !toggle || !nav) {
    return;
  }

  const mq = window.matchMedia('(max-width: 820px)');
  const close = () => {
    header.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (mq.matches) close();
    });
  });

  document.addEventListener('click', (e) => {
    if (!mq.matches) return;
    if (!header.contains(e.target)) close();
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

  setText('experience-heading', localized.experience?.heading);
  renderExperience(localized.experience?.items);

  setText('education-heading', localized.education?.heading);
  renderEducation(localized.education?.items);

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
  renderCertifications(localized.certifications?.items, localized.certifications?.labels);

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

  const viewAllLink = document.getElementById('activities-view-all');
  if (viewAllLink && localized.activities?.viewAllLabel) {
    viewAllLink.textContent = localized.activities.viewAllLabel;
  }

  setText('enablement-eyebrow', localized.enablement?.eyebrow);
  setText('enablement-title', localized.enablement?.title);
  setText('enablement-intro', localized.enablement?.intro);
  setText('enablement-metrics-title', localized.enablement?.metricsTitle);
  renderMetricList('enablement-metrics-list', localized.enablement?.metrics);
  renderEnablementEvents(data.enablement?.events, localized.enablement?.labels);
  const backLink = document.getElementById('enablement-back');
  if (backLink && localized.enablement?.labels?.backToHome) {
    backLink.textContent = localized.enablement.labels.backToHome;
  }
  const pageTitle = document.getElementById('page-title');
  if (pageTitle && localized.enablement?.pageTitle && document.getElementById('enablement-events')) {
    pageTitle.textContent = localized.enablement.pageTitle;
  }

  // Solution Build detail page (solution-build.html)
  const sbd = localized.solutionBuildDetail;
  if (sbd && document.getElementById('solution-build-detail')) {
    setText('sbd-eyebrow', sbd.eyebrow);
    setText('sbd-title', sbd.title);
    setText('sbd-intro', sbd.intro);
    setText('sbd-metrics-title', sbd.metricsTitle);
    setText('sbd-projects-title', sbd.projectsTitle);
    setText('sbd-deep-dives-title', sbd.deepDivesTitle);
    renderMetricList('sbd-metrics-list', sbd.metrics);
    renderSolutionBuildProjects(data.solutionBuildDetail?.projects, sbd.labels);
    renderSolutionBuildDeepDives(data.solutionBuildDetail?.deepDives, sbd.labels);
    const sbdBack = document.getElementById('sbd-back');
    if (sbdBack && sbd.labels?.backToHome) {
      sbdBack.textContent = sbd.labels.backToHome;
    }
    if (pageTitle && sbd.pageTitle) {
      pageTitle.textContent = sbd.pageTitle;
    }
  }

  const sbViewAll = document.getElementById('solution-build-view-all');
  if (sbViewAll && localized.solutionBuild?.viewAllLabel) {
    sbViewAll.textContent = localized.solutionBuild.viewAllLabel;
  }

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
initBackToTop();
loadContent();

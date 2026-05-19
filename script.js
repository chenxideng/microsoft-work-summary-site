function setText(id, value) {
  const element = document.getElementById(id);
  if (element && typeof value === 'string') {
    element.textContent = value;
  }
}

function renderList(listId, values) {
  const list = document.getElementById(listId);
  if (!list || !Array.isArray(values)) {
    return;
  }

  list.innerHTML = values
    .map((value) => `<li>${value}</li>`)
    .join('');
}

function renderMetrics(metrics) {
  const list = document.getElementById('metrics-list');
  if (!list || !Array.isArray(metrics)) {
    return;
  }

  list.innerHTML = metrics
    .map(
      (metric) => `<li><span>${metric.value}</span><p>${metric.label}</p></li>`
    )
    .join('');
}

function renderPmxCards(projects) {
  const cards = document.getElementById('pmx-cards');
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
        <div class="kv"><span>状态</span><strong>${project.status}</strong></div>
        <div class="kv"><span>影响</span><strong>${project.impact}</strong></div>
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

function initRevealAnimation() {
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${index * 110}ms`;
    revealObserver.observe(element);
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

async function loadContent() {
  try {
    const response = await fetch('content.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load content.json: ${response.status}`);
    }

    const data = await response.json();

    setText('brand-label', data.site?.brandLabel);
    setText('site-title', data.site?.title);
    setText('nav-overview', data.site?.nav?.overview);
    setText('nav-pmx', data.site?.nav?.pmx);
    setText('nav-activities', data.site?.nav?.activities);
    setText('nav-next', data.site?.nav?.next);
    setText('footer-text', data.site?.footer);

    setText('overview-eyebrow', data.overview?.eyebrow);
    setText('overview-title', data.overview?.title);
    setText('overview-description', data.overview?.description);
    setText('metrics-title', data.overview?.metricsTitle);
    renderMetrics(data.overview?.metrics);

    setText('pmx-eyebrow', data.pmx?.eyebrow);
    setText('pmx-title', data.pmx?.title);
    renderPmxCards(data.pmx?.projects);

    setText('activities-eyebrow', data.activities?.eyebrow);
    setText('activities-title', data.activities?.title);
    renderActivities(data.activities?.items);

    setText('next-eyebrow', data.next?.eyebrow);
    setText('next-title', data.next?.title);
    setText('next-project-title', data.next?.projectTitle);
    setText('next-org-title', data.next?.orgTitle);
    renderList('next-project-list', data.next?.projectItems);
    renderList('next-org-list', data.next?.orgItems);
  } catch (error) {
    console.error(error);
  }
}

loadContent();
initRevealAnimation();
initSmoothScroll();

(() => {
  let allowed = window.name === 'VH_ADULT_SESSION';
  try { allowed ||= sessionStorage.getItem('vh-adult') === 'yes'; } catch {}
  if (!allowed) location.replace(new URL('../index.html', document.currentScript.src).href);
  try { const t=localStorage.getItem('vh-time'); if(['day','evening','night'].includes(t)) document.documentElement.dataset.time=t; } catch {}
})();

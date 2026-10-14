(() => {
  let allowed = window.name === 'VH_ADULT_SESSION';
  try { allowed ||= sessionStorage.getItem('vh-adult') === 'yes'; } catch {}
  if (!allowed) location.replace(new URL('../index.html', document.currentScript.src).href);
})();

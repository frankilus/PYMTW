/* No network calls, storage, tracking, wallet connections or private inputs. */
(() => {
 'use strict';
 const links = [...document.querySelectorAll('[data-stage]')];
 const panels = [...document.querySelectorAll('.stage-panel')];
 function selectStage(id) {
  if (!panels.some(panel => panel.id === id)) return;
  panels.forEach(panel => { panel.hidden = panel.id !== id; });
  links.forEach(link => {
   const current = link.dataset.stage === id;
   link.classList.toggle('active', current);
   if (current) link.setAttribute('aria-current', 'true');
   else link.removeAttribute('aria-current');
  });
 }
 function revealFragment() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
  const target = document.getElementById(id);
  if (!target) return;
  const panel = target.closest('.stage-panel');
  if (panel) selectStage(panel.id);
  let ancestor = target;
  let opened = false;
  while (ancestor) {
   if (ancestor.tagName === 'DETAILS' && !ancestor.open) { ancestor.open = true; opened = true; }
   ancestor = ancestor.parentElement;
  }
  if (opened) requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
 }
 links.forEach(link => link.addEventListener('click', () => selectStage(link.dataset.stage)));
 selectStage(['beginner','owner','advanced'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'beginner');
 window.addEventListener('hashchange', revealFragment);
 revealFragment();
 document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (link && link.hash === location.hash) revealFragment();
 });
 const checks = [...document.querySelectorAll('.step-check')];
 const status = document.querySelector('.check-progress');
 checks.forEach(check => {
  check.checked = false;
  check.addEventListener('change', () => {
   const count = checks.filter(item => item.checked).length;
   status.textContent = `${count} of ${checks.length} steps marked reviewed. This is a reminder, not proof of security. Nothing is saved.`;
  });
 });
 const print = document.querySelector('.print-guide');
 print.hidden = false;
 print.addEventListener('click', () => window.print());
})();

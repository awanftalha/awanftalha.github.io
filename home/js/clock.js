/* Live Lahore time in the footer, ticking every second while visible. */

export function initClock() {
  const el = document.querySelector('[data-clock]');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  let timer = 0;
  const tick = () => {
    const now = new Date();
    el.textContent = `${fmt.format(now)} PKT`;
    el.dateTime = now.toISOString();
    // Line up with the next whole second.
    timer = setTimeout(tick, 1000 - (now.getTime() % 1000));
  };
  const io = new IntersectionObserver(([entry]) => {
    clearTimeout(timer);
    if (entry.isIntersecting) tick();
  });
  tick();
  io.observe(el);
}

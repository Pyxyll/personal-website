// Tiny scroll-reveal: fades + lifts any [data-reveal] when it enters the viewport.
// One-shot. Respects prefers-reduced-motion.

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const els = document.querySelectorAll<HTMLElement>("[data-reveal]");

if (reduce || !("IntersectionObserver" in window)) {
  els.forEach((el) => el.classList.add("is-visible"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
  );
  els.forEach((el) => io.observe(el));
}

// drag.js — shared drag + tap-to-place for touch screens (Pointer Events, no HTML5 DnD).
// Used by P05, P07, P08, P09, P10. Ready for Person C.
//
// const group = createDragGroup({
//   cards: [...nodeCardEls], targets: () => [...dropZoneEls],
//   accept: (card, target) => card.dataset.id === target.dataset.id,
//   onCorrect: (card, target) => {...}, onWrong: (card, target) => {...},
// });
// group.destroy();
//
// With a finger:
// - A card with `touch-action: pan-y` (phones held upright, where the page scrolls past the cards) lets a quick
//   swipe up or down scroll the page. Moving sideways drags straight away; a short press (a quarter of a second)
//   picks the card up for a drag in any direction.
// - While a card is dragged near the top or bottom edge of a scrolling page, the page scrolls to bring more into view.
// The mouse works exactly as before.

const PRESS_MS = 260;          // press this long without moving to pick a card up (touch, pan-y cards only)
const EDGE = 64;               // auto-scroll zone at the top and bottom of the scrolling page (px)

/** The nearest ancestor that actually scrolls up and down. */
function scrollParent(node) {
  for (let p = node.parentElement; p && p !== document.body; p = p.parentElement) {
    const oy = getComputedStyle(p).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight + 2) return p;
  }
  return null;
}

export function createDragGroup({ cards, targets, accept, onCorrect, onWrong }) {
  const getTargets = typeof targets === 'function' ? targets : () => targets;
  let selected = null;
  const cleanups = [];

  const hitTarget = (x, y) => {
    const under = document.elementsFromPoint(x, y);
    return getTargets().find((t) => under.includes(t) || under.some((u) => t.contains(u))) || null;
  };

  const settle = (card, target) => {
    if (target && accept(card, target)) {
      card.classList.remove('is-selected');
      onCorrect?.(card, target);
      return true;
    }
    if (target) {
      // not this one: the card shakes and is let go, so the next tap on it picks it up again
      card.classList.remove('is-selected');
      if (selected === card) selected = null;
      card.classList.remove('is-hint'); void card.offsetWidth; card.classList.add('is-hint');
      target.classList.remove('is-hint'); void target.offsetWidth; target.classList.add('is-hint');
      onWrong?.(card, target);
    }
    return false;
  };

  const clearOver = () => getTargets().forEach((t) => t.classList.remove('is-over'));

  cards.forEach((card) => {
    let pid = null, sx = 0, sy = 0, moved = false, clone = null, ox = 0, oy = 0;
    let touch = false, panY = false, armed = false, pressTimer = 0, lx = 0, ly = 0, scroller = null, raf = 0;

    const disarm = () => { clearTimeout(pressTimer); armed = false; card.classList.remove('is-armed'); };
    const stopScroll = () => { cancelAnimationFrame(raf); raf = 0; };
    // finger near the top or bottom of the scrolling page while dragging: scroll it, faster the closer to the edge
    const edgeScroll = () => {
      raf = 0;
      if (!clone || !scroller) return;
      const r = scroller.getBoundingClientRect();
      const top = Math.max(r.top, 0), bottom = Math.min(r.bottom, window.innerHeight);
      let d = ly < top + EDGE ? -(1 - Math.max(0, ly - top) / EDGE) : ly > bottom - EDGE ? 1 - Math.max(0, bottom - ly) / EDGE : 0;
      if ((d < 0 && ly > sy - 24) || (d > 0 && ly < sy + 24)) d = 0;   // only when the finger has moved towards that edge
      if (!d) return;
      const before = scroller.scrollTop;
      scroller.scrollTop += Math.round(d * 14);
      if (scroller.scrollTop !== before) { clearOver(); hitTarget(lx, ly)?.classList.add('is-over'); }
      raf = requestAnimationFrame(edgeScroll);
    };

    // once a card is picked up, the finger must not scroll the page (touch-action: pan-y would let it)
    const onTouchMove = (e) => { if ((armed || moved) && e.cancelable) e.preventDefault(); };
    const noMenu = (e) => { if (pid !== null && touch) e.preventDefault(); };      // (a long press would open the phone's menu)

    const down = (e) => {
      if (card.classList.contains('is-placed')) return;
      pid = e.pointerId; sx = lx = e.clientX; sy = ly = e.clientY; moved = false;
      touch = e.pointerType === 'touch';
      panY = touch && getComputedStyle(card).touchAction !== 'none';
      disarm();
      card.setPointerCapture(pid);
      if (panY) {
        pressTimer = setTimeout(() => {
          if (pid === null || moved) return;
          armed = true; card.classList.add('is-armed');
          try { navigator.vibrate?.(8); } catch { /* not allowed: fine */ }
        }, PRESS_MS);
      }
    };
    const move = (e) => {
      if (e.pointerId !== pid) return;
      lx = e.clientX; ly = e.clientY;
      if (!moved) {
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (panY && !armed) {
          // a card on a scrolling page: sideways starts a drag; up or down is left to the page (it scrolls)
          if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return;
        } else if (Math.hypot(dx, dy) < 6) return;
      }
      if (!moved) {
        moved = true;
        clearTimeout(pressTimer); card.classList.remove('is-armed');
        // (a card may be turned, e.g. in a fan: use its own size, centred on where it is on screen)
        const r = card.getBoundingClientRect();
        const w = card.offsetWidth || r.width, h = card.offsetHeight || r.height;
        const left = r.left + (r.width - w) / 2, top = r.top + (r.height - h) / 2;
        ox = sx - left; oy = sy - top;
        clone = card.cloneNode(true);
        clone.classList.add('is-dragging');
        clone.classList.remove('is-armed');
        Object.assign(clone.style, { position: 'fixed', left: `${left}px`, top: `${top}px`, right: 'auto', bottom: 'auto', width: `${w}px`, height: `${h}px`, margin: 0, zIndex: 60, pointerEvents: 'none' });
        document.body.appendChild(clone);
        card.classList.add('is-ghost');
        scroller = touch ? scrollParent(card) : null;
      }
      clone.style.left = `${e.clientX - ox}px`;
      clone.style.top = `${e.clientY - oy}px`;
      clearOver();
      hitTarget(e.clientX, e.clientY)?.classList.add('is-over');
      if (scroller && !raf) raf = requestAnimationFrame(edgeScroll);
    };
    const up = (e) => {
      if (e.pointerId !== pid) return;
      pid = null; clearOver(); stopScroll();
      disarm();
      if (!moved) {                                   // a tap (or a press let go in place): select this card for tap-to-place
        getTargets(); cards.forEach((c) => c.classList.remove('is-selected'));
        selected = selected === card ? null : card;
        if (selected) card.classList.add('is-selected');
        return;
      }
      const target = hitTarget(e.clientX, e.clientY);
      card.classList.remove('is-ghost');
      clone?.remove(); clone = null; scroller = null;
      settle(card, target);
    };
    const cancel = () => { pid = null; clearOver(); stopScroll(); disarm(); card.classList.remove('is-ghost'); clone?.remove(); clone = null; scroller = null; };

    card.addEventListener('pointerdown', down);
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerup', up);
    card.addEventListener('pointercancel', cancel);
    card.addEventListener('touchmove', onTouchMove, { passive: false });
    card.addEventListener('contextmenu', noMenu);
    cleanups.push(() => {
      card.removeEventListener('pointerdown', down); card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerup', up); card.removeEventListener('pointercancel', cancel);
      card.removeEventListener('touchmove', onTouchMove); card.removeEventListener('contextmenu', noMenu);
      disarm(); stopScroll();
      clone?.remove();
    });
  });

  // Tap-to-place: tap a card, then tap a target
  const onTargetTap = (e) => {
    if (!selected) return;
    const target = getTargets().find((t) => t === e.currentTarget);
    if (target && settle(selected, target)) selected = null;
  };
  const bindTargets = () => getTargets().forEach((t) => {
    if (t.__dragBound) return;
    t.__dragBound = true;
    t.addEventListener('click', onTargetTap);
    cleanups.push(() => { t.removeEventListener('click', onTargetTap); t.__dragBound = false; });
  });
  bindTargets();

  return {
    refreshTargets: bindTargets,
    clearSelection: () => { selected = null; cards.forEach((c) => c.classList.remove('is-selected')); },
    destroy: () => cleanups.forEach((f) => f()),
  };
}

// drag.js — shared drag + tap-to-place for touch screens (Pointer Events, no HTML5 DnD).
// Used by P05, P07, P08, P09, P10. Ready for Person C.
//
// const group = createDragGroup({
//   cards: [...nodeCardEls], targets: () => [...dropZoneEls],
//   accept: (card, target) => card.dataset.id === target.dataset.id,
//   onCorrect: (card, target) => {...}, onWrong: (card, target) => {...},
// });
// group.destroy();

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
      card.classList.remove('is-hint'); void card.offsetWidth; card.classList.add('is-hint');
      target.classList.remove('is-hint'); void target.offsetWidth; target.classList.add('is-hint');
      onWrong?.(card, target);
    }
    return false;
  };

  const clearOver = () => getTargets().forEach((t) => t.classList.remove('is-over'));

  cards.forEach((card) => {
    let pid = null, sx = 0, sy = 0, moved = false, clone = null, ox = 0, oy = 0;

    const down = (e) => {
      if (card.classList.contains('is-placed')) return;
      pid = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false;
      card.setPointerCapture(pid);
    };
    const move = (e) => {
      if (e.pointerId !== pid) return;
      if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) < 6) return;
      if (!moved) {
        moved = true;
        const r = card.getBoundingClientRect();
        ox = sx - r.left; oy = sy - r.top;
        clone = card.cloneNode(true);
        clone.classList.add('is-dragging');
        Object.assign(clone.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, margin: 0, zIndex: 60, pointerEvents: 'none' });
        document.body.appendChild(clone);
        card.classList.add('is-ghost');
      }
      clone.style.left = `${e.clientX - ox}px`;
      clone.style.top = `${e.clientY - oy}px`;
      clearOver();
      hitTarget(e.clientX, e.clientY)?.classList.add('is-over');
    };
    const up = (e) => {
      if (e.pointerId !== pid) return;
      pid = null; clearOver();
      if (!moved) {                                   // a tap: select this card for tap-to-place
        getTargets(); cards.forEach((c) => c.classList.remove('is-selected'));
        selected = selected === card ? null : card;
        if (selected) card.classList.add('is-selected');
        return;
      }
      const target = hitTarget(e.clientX, e.clientY);
      card.classList.remove('is-ghost');
      clone?.remove(); clone = null;
      settle(card, target);
    };
    const cancel = () => { pid = null; clearOver(); card.classList.remove('is-ghost'); clone?.remove(); clone = null; };

    card.addEventListener('pointerdown', down);
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerup', up);
    card.addEventListener('pointercancel', cancel);
    cleanups.push(() => {
      card.removeEventListener('pointerdown', down); card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerup', up); card.removeEventListener('pointercancel', cancel);
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

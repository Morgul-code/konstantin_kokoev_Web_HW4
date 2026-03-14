function setupFavoriteHandler(container) {
  if (!container) throw new Error('setupFavoriteHandler: container is required');

  const anim = new WeakMap();

  const stopRotation = (btn) => {
    const st = anim.get(btn);
    if (st?.rafId) cancelAnimationFrame(st.rafId);
    anim.delete(btn);
    btn.style.transform = '';
  };

  const startRotation = (btn) => {
    stopRotation(btn);
    const st = { rafId: 0, angle: 0 };
    anim.set(btn, st);

    const tick = () => {
      st.angle = (st.angle + 6) % 360;
      btn.style.transform = `rotate(${st.angle}deg)`;
      st.rafId = requestAnimationFrame(tick);
    };

    st.rafId = requestAnimationFrame(tick);
  };

  const applyState = (order, btn, state) => {
    order.dataset.favoriteState = String(state);

    order.classList.toggle('favorite', state >= 1);
    btn.classList.toggle('favorite', state >= 1);

    if (state === 2) startRotation(btn);
    else stopRotation(btn);
  };

  const getState = (order) => {
    const raw = Number(order.dataset.favoriteState);
    return Number.isFinite(raw) ? raw : 0;
  };

  const onClick = (e) => {
    const btn = e.target.closest('.favorite-button');
    if (!btn || !container.contains(btn)) return;

    const order = btn.closest('.order');
    if (!order) return;

    const next = (getState(order) + 1) % 3;
    applyState(order, btn, next);
  };

  container.addEventListener('click', onClick);

  return {
    destroy() {
      container.removeEventListener('click', onClick);
      container.querySelectorAll('.favorite-button').forEach(stopRotation);
    },
  };
}

function setupFavoriteHandlerAdditional() {
  const container = window.document.getElementById('orders');
  return setupFavoriteHandler(container);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setupFavoriteHandler, setupFavoriteHandlerAdditional };
}

window.addEventListener('DOMContentLoaded', () => {
  setupFavoriteHandlerAdditional(); // или setupFavoriteHandler() если без аргументов
});
function setupOrderHandlers(container) {
  if (!container) throw new Error('setupOrderHandlers: container is required');

  function makeRow(label, value) {
    const frag = document.createDocumentFragment();

    const strong = document.createElement('strong');
    strong.textContent = label;

    frag.append(strong);
    frag.append(document.createTextNode(' '));
    frag.append(document.createTextNode(value || ''));

    return frag;
  }

  function ensureDetails(order) {
    let details = order.querySelector('.order-details');
    if (details) return details;

    const { client = '', items = '', total = '', address = '' } = order.dataset;

    details = document.createElement('div');
    details.className = 'order-details';
    details.setAttribute('aria-hidden', 'true');

    details.append(makeRow('Клиент:', client));
    details.append(document.createElement('br'));

    details.append(makeRow('Товары:', items));
    details.append(document.createElement('br'));

    details.append(makeRow('Сумма:', total));
    details.append(document.createElement('br'));

    details.append(makeRow('Адрес:', address));

    order.append(details);
    return details;
  }

  function show(order) {
    ensureDetails(order);
    order.classList.add('show-details');
    order.querySelector('.order-details')?.setAttribute('aria-hidden', 'false');
  }

  function hide(order) {
    order.classList.remove('show-details');
    order.querySelector('.order-details')?.setAttribute('aria-hidden', 'true');
  }

  function onOver(e) {
    const order = e.target.closest('.order');
    if (!order || !container.contains(order)) return;

    if (e.relatedTarget && order.contains(e.relatedTarget)) return;

    show(order);
  }

  function onOut(e) {
    const order = e.target.closest('.order');
    if (!order || !container.contains(order)) return;

    if (e.relatedTarget && order.contains(e.relatedTarget)) return;

    hide(order);
  }

  container.addEventListener('mouseover', onOver);
  container.addEventListener('mouseout', onOut);

  return {
    destroy() {
      container.removeEventListener('mouseover', onOver);
      container.removeEventListener('mouseout', onOut);
    },
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setupOrderHandlers };
}

if (typeof window !== 'undefined') {
  const root = document.getElementById('orders');
  if (root) setupOrderHandlers(root);
}
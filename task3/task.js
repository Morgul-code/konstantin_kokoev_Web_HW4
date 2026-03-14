function searchOrdersOnServer(searchText) {
   return new Promise((resolve, reject) => {
      setTimeout(() => {
         const allOrders = [
            { id: 1, title: 'Заказ #A-101', comment: 'Оставить у двери', status: 'new' },
            { id: 2, title: 'Заказ #A-100', comment: 'Быстрее', status: 'delivery' },
            { id: 3, title: 'Заказ #A-099', comment: 'Я доплачу', status: 'cooking' },
            { id: 4, title: 'Заказ #A-098', comment: 'Оставьте себе', status: 'delivered' },
         ];

         const filteredOrders = searchText
           ? allOrders.filter((order) => order.title.includes(searchText))
           : allOrders;

         if (Math.random() > 0.2) resolve(filteredOrders);
         else reject('Ошибка поиска заказов');
      }, 300);
   });
}

function setupOrderSearchServerHandler(searchInput, searchClear, container) {
   if (!searchInput || !searchClear || !container) {
      throw new Error('setupOrderSearchServerHandler: some elements are missing');
   }

   const DEBOUNCE_MS = 300; // по ТЗ
   let timerId = null;
   let requestId = 0;

   const normalize = (v) => String(v ?? '').trim().toLowerCase();

   function showClear() {
      searchClear.style.display = searchInput.value ? 'block' : 'none';
   }

   function renderMessage(text) {
      container.innerHTML = '';
      const msg = document.createElement('div');
      msg.className = 'order delivered';
      msg.textContent = text;
      container.append(msg);
   }

   function renderOrders(list) {
      container.innerHTML = '';

      if (!list || list.length === 0) {
         renderMessage('Ничего не найдено');
         return;
      }

      list.forEach((order) => {
         const el = document.createElement('div');
         el.className = `order ${order.status}`;
         el.dataset.id = String(order.id);

         const title = document.createElement('div');
         title.className = 'order-title';
         title.textContent = order.title;

         const comment = document.createElement('div');
         comment.className = 'order-comment';
         comment.textContent = order.comment;

         el.append(title, comment);
         container.append(el);
      });
   }

   async function loadAndRender(searchText) {
      const current = ++requestId;

      const api =
        typeof module !== 'undefined' &&
        module.exports &&
        typeof module.exports.searchOrdersOnServer === 'function'
          ? module.exports.searchOrdersOnServer
          : searchOrdersOnServer;

      try {
         const list = await api(searchText);
         if (current !== requestId) return;
         const q = normalize(searchText);

         const filtered = q
           ? list.filter((o) => {
              const id = normalize(o.id);
              const title = normalize(o.title);
              const comment = normalize(o.comment);
              return id.includes(q) || title.includes(q) || comment.includes(q);
           })
           : list;

         renderOrders(filtered);
      } catch (e) {
         if (current !== requestId) return;
         renderMessage('Ошибка при загрузке заказов');
      }
   }

   function scheduleSearch() {
      showClear();
      if (timerId) clearTimeout(timerId);

      timerId = setTimeout(() => {
         loadAndRender(searchInput.value);
      }, DEBOUNCE_MS);
   }

   function onInput() {
      scheduleSearch();
   }

   function onClear() {
      searchInput.value = '';
      showClear();

      if (timerId) clearTimeout(timerId);
      loadAndRender('');
      searchInput.focus();
   }

   // init
   showClear();
   loadAndRender('');

   searchInput.addEventListener('input', onInput);
   searchClear.addEventListener('click', onClear);

   return {
      destroy() {
         if (timerId) clearTimeout(timerId);
         searchInput.removeEventListener('input', onInput);
         searchClear.removeEventListener('click', onClear);
      },
   };
}

if (typeof module !== 'undefined' && module.exports) {
   module.exports = { setupOrderSearchServerHandler, searchOrdersOnServer };
}

if (typeof window !== 'undefined') {
   window.addEventListener('DOMContentLoaded', () => {
      const searchInput = document.getElementById('order-search');
      const searchClear = document.querySelector('.search-clear');
      const container = document.getElementById('orders');

      if (searchInput && searchClear && container) {
         setupOrderSearchServerHandler(searchInput, searchClear, container);
      }
   });
}
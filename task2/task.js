function setupOrderSearchHandler(searchInput, searchClear, filterReady, filterNew, container) {
    if (!searchInput || !searchClear || !filterReady || !filterNew || !container) {
        throw new Error('setupOrderSearchHandler: some elements are missing');
    }

    const READY_STATUSES = new Set(['cooking', 'delivery', 'delivered']);

    const norm = (v) => String(v ?? '').trim().toLowerCase();

    function matchesQuery(order, query) {
        if (!query) return true;

        const id = norm(order.dataset.id);
        const title = norm(order.querySelector('.order-title')?.textContent);
        const client = norm(order.querySelector('.order-client')?.textContent);

        return id.includes(query) || title.includes(query) || client.includes(query);
    }

    function matchesStatus(status) {
        const readyOn = filterReady.checked;
        const newOn = filterNew.checked;

        if (!readyOn && !newOn) return true;

        if (newOn && status === 'new') return true;
        if (readyOn && READY_STATUSES.has(status)) return true;

        return false;
    }

    function apply() {
        const query = norm(searchInput.value);

        container.querySelectorAll('.order').forEach((order) => {
            const status = norm(order.dataset.status);

            const ok = matchesStatus(status) && matchesQuery(order, query);
            order.style.display = ok ? '' : 'none';
        });
    }

    function onInput() {
        apply();
    }

    function onClear() {
        searchInput.value = '';
        apply();
        searchInput.focus();
    }

    function onFilter() {
        apply();
    }

    searchInput.addEventListener('input', onInput);
    searchClear.addEventListener('click', onClear);
    filterReady.addEventListener('change', onFilter);
    filterNew.addEventListener('change', onFilter);

    // init
    apply();

    return {
        destroy() {
            searchInput.removeEventListener('input', onInput);
            searchClear.removeEventListener('click', onClear);
            filterReady.removeEventListener('change', onFilter);
            filterNew.removeEventListener('change', onFilter);
        },
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { setupOrderSearchHandler };
}

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const searchInput = document.getElementById('order-search');
        const searchClear = document.querySelector('.search-clear');
        const filterReady = document.querySelector('.filter-ready');
        const filterNew = document.querySelector('.filter-new');
        const container = document.getElementById('orders');

        if (searchInput && searchClear && filterReady && filterNew && container) {
            setupOrderSearchHandler(searchInput, searchClear, filterReady, filterNew, container);
        }
    });
}
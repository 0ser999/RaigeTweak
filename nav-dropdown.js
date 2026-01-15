document.addEventListener('DOMContentLoaded', () => {
    const dropdownDetails = Array.from(document.querySelectorAll('.nav-dropdown .nav-details'));

    if (dropdownDetails.length === 0) return;

    const closeAll = (except = null) => {
        dropdownDetails.forEach(d => {
            if (d !== except) d.removeAttribute('open');
        });
    };

    dropdownDetails.forEach(details => {
        const summary = details.querySelector('summary');
        if (!summary) return;

        summary.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = details.hasAttribute('open');
            closeAll();
            if (!isOpen) details.setAttribute('open', '');
        });
    });

    document.addEventListener('click', (e) => {
        const clickedInside = dropdownDetails.some(d => d.contains(e.target));
        if (!clickedInside) closeAll();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAll();
    });
});

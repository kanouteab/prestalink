async function loadDashboard() {
    const res = await fetch(API_BASE + "/api/dashboard");
    const data = await res.json();

    updateDashboardMetric("totalUsers", data.totalUsers);
    updateDashboardMetric("activeMissions", data.activeMissions);
    updateDashboardMetric("availableProviders", data.availableProviders);
    updateDashboardMetric("pendingRequests", data.pendingRequests);

    if (typeof refreshPrivateSidebarBadges === "function") {
        await refreshPrivateSidebarBadges();
    }
}

function updateDashboardMetric(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

async function loadCategories() {
    const res = await fetch(API_BASE + "/api/categories");
    const categories = res.ok ? await res.json() : [];
    dashboardCategories = Array.isArray(categories) ? categories : [];

    const offerSelect = document.getElementById("offerCategoryId");
    const requestSelect = document.getElementById("requestCategoryId");

    if (!offerSelect || !requestSelect) {
        return dashboardCategories;
    }

    offerSelect.innerHTML = `<option value="">Catégorie *</option>`;
    requestSelect.innerHTML = `<option value="">Catégorie *</option>`;

    dashboardCategories.forEach(function (category) {
        const label =
            (category.icon ? category.icon + " " : "") + category.name;

        offerSelect.innerHTML += `
            <option value="${category.id}">
                ${label}
            </option>
        `;

        requestSelect.innerHTML += `
            <option value="${category.id}">
                ${label}
            </option>
        `;
    });

    return dashboardCategories;
}

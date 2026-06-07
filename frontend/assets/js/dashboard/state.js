const API_BASE = window.PRESTALINK_CONFIG?.API_BASE || "";
const currentUser = readStoredCurrentUser();

const isLoggedIn =
    currentUser !== null;

const PENDING_AUTH_ACTION_KEY = "prestalinkPendingAuthAction";

function readStoredCurrentUser() {
    try {
        const storedUser = localStorage.getItem("currentUser");
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("currentUserId");
        return null;
    }
}

let dashboardCategories = [];
let currentPublicationView = "home";
let favoritePublicationKeys = new Set();
let publicationSearchState = {
    keyword: "",
    categoryId: "",
    location: "",
    minAmount: "",
    maxAmount: "",
    radius: "all",
    sort: "recent",
    status: "all",
    type: "all",
    mapVisible: false
};

function getCurrentDashboardView() {
    return {
        view: currentPublicationView || "home",
        url: window.location.href
    };
}

function savePendingAuthAction(actionName, payload = {}) {
    const pendingAction = {
        actionName,
        payload,
        context: getCurrentDashboardView(),
        returnUrl: window.location.origin + window.location.pathname,
        savedAt: Date.now()
    };

    localStorage.setItem(PENDING_AUTH_ACTION_KEY, JSON.stringify(pendingAction));
}

function readPendingAuthAction() {
    try {
        const storedAction = localStorage.getItem(PENDING_AUTH_ACTION_KEY);
        return storedAction ? JSON.parse(storedAction) : null;
    } catch (error) {
        localStorage.removeItem(PENDING_AUTH_ACTION_KEY);
        return null;
    }
}

function clearPendingAuthAction() {
    localStorage.removeItem(PENDING_AUTH_ACTION_KEY);
}

function redirectToLoginOrRegister() {
    const dashboardUrl = window.location.pathname.includes("/Register/")
        ? "../prestalink-dashboard.html"
        : "Register/login.html";

    window.location.href = dashboardUrl;
}

function requireAuthOrResume(actionName, payload = {}) {
    if (isLoggedIn && currentUser?.id) {
        return true;
    }

    savePendingAuthAction(actionName, payload);
    redirectToLoginOrRegister();
    return false;
}


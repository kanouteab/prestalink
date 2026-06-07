window.PRESTALINK_CONFIG = window.PRESTALINK_CONFIG || {};

function getStoredPrestaLinkApiBase() {
    try {
        return localStorage.getItem("PRESTALINK_API_BASE") || "";
    } catch (error) {
        return "";
    }
}

window.PRESTALINK_CONFIG.API_BASE =
    window.PRESTALINK_CONFIG.API_BASE ||
    getStoredPrestaLinkApiBase() ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : "");

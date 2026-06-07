const PRESTALINK_DEFAULT_BRANDING = {
    primaryColor: "#0d6efd",
    secondaryColor: "#6610f2",
    slogan: "Plateforme temps reel de mise en relation clients et prestataires",
    faviconUrl: "",
    sidebarLogoUrl: "",
    loginLogoUrl: ""
};

function brandingApiBase() {
    return typeof API_BASE !== "undefined" ? API_BASE : window.PRESTALINK_CONFIG?.API_BASE || "";
}

async function loadActiveBranding() {
    try {
        const response = await fetch(brandingApiBase() + "/api/admin/branding/active");
        if (!response.ok) {
            throw new Error("Branding unavailable");
        }
        const branding = await response.json();
        applyPrestaLinkBranding({
            ...PRESTALINK_DEFAULT_BRANDING,
            ...(branding || {})
        });
    } catch (error) {
        applyPrestaLinkBranding(PRESTALINK_DEFAULT_BRANDING);
    }
}

function applyPrestaLinkBranding(branding) {
    const primaryColor = validBrandingColor(branding.primaryColor, PRESTALINK_DEFAULT_BRANDING.primaryColor);
    const secondaryColor = validBrandingColor(branding.secondaryColor, PRESTALINK_DEFAULT_BRANDING.secondaryColor);
    const slogan = branding.slogan || PRESTALINK_DEFAULT_BRANDING.slogan;

    document.documentElement.style.setProperty("--primary-color", primaryColor);
    document.documentElement.style.setProperty("--secondary-color", secondaryColor);

    applyBrandingFavicon(branding.faviconUrl);
    applyBrandingImage("prestalinkSidebarLogo", branding.sidebarLogoUrl, "PrestaLink");
    applyBrandingImage("prestalinkDashboardLogo", branding.sidebarLogoUrl || branding.loginLogoUrl, "PrestaLink");
    applyBrandingImage("prestalinkLoginLogo", branding.loginLogoUrl, "PrestaLink");
    applyBrandingText("prestalinkSlogan", slogan);
    applyBrandingText("prestalinkDashboardSlogan", slogan);
    applyBrandingTextFromSelector(".app-header h2 + p", slogan);
    applyBrandingTextFromSelector(".auth-card h1 + p", slogan);
}

function applyBrandingFavicon(url) {
    const resolvedUrl = resolveBrandingAssetUrl(url);
    if (!resolvedUrl) return;

    let favicon = document.querySelector("link[rel='icon']");
    if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
    }
    favicon.href = resolvedUrl;
}

function applyBrandingImage(id, url, altText) {
    const container = document.getElementById(id);
    if (!container) return;

    const resolvedUrl = resolveBrandingAssetUrl(url);
    if (!resolvedUrl) {
        container.textContent = "PrestaLink";
        container.classList.remove("has-branding-image");
        return;
    }

    container.innerHTML = `<img src="${escapeBrandingHtml(resolvedUrl)}" alt="${escapeBrandingHtml(altText)}">`;
    container.classList.add("has-branding-image");
}

function applyBrandingText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function applyBrandingTextFromSelector(selector, value) {
    const element = document.querySelector(selector);
    if (element && !element.id) {
        element.textContent = value;
    }
}

function resolveBrandingAssetUrl(url) {
    if (!url) return "";
    return url.startsWith("http") ? url : brandingApiBase() + url;
}

function validBrandingColor(value, fallback) {
    return /^#[0-9a-fA-F]{6}$/.test(value || "") ? value : fallback;
}

function escapeBrandingHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", loadActiveBranding);


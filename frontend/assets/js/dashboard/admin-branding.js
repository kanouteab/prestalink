let adminBrandingSettings = [];
let selectedAdminBrandingId = null;
let selectedBrandingFiles = {
    favicon: null,
    sidebarLogo: null,
    loginLogo: null
};

function adminBrandingHeaders(json) {
    const headers = {};
    if (window.prestalinkAdminToken) {
        headers["Authorization"] = "Bearer " + window.prestalinkAdminToken;
    } else {
        headers["X-Current-User-Id"] = currentUser?.id || "";
    }
    if (json) {
        headers["Content-Type"] = "application/json";
    }
    return headers;
}

async function adminBrandingFetch(path, options = {}) {
    const response = await fetch(API_BASE + path, options);
    if (response.status === 401 || response.status === 403) {
        throw new Error("Accès réservé aux administrateurs");
    }
    if (!response.ok) {
        throw new Error("Une erreur est survenue");
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
}

async function loadAdminBranding() {
    currentPublicationView = "admin-branding";
    const dynamicView = document.getElementById("dynamicView");

    dynamicView.innerHTML = `
        <div class="admin-branding-toolbar">
            <div>
                <h3>Identité visuelle</h3>
                <p class="text-muted mb-0">Gérer le branding actif de PrestaLink.</p>
            </div>
            <button type="button" class="btn btn-primary" onclick="newAdminBranding()">Branding</button>
        </div>
        <div class="admin-branding-layout">
            <section class="admin-branding-list" id="adminBrandingList"></section>
            <section>
                <div class="admin-branding-form-panel" id="adminBrandingFormPanel"></div>
                <div class="admin-branding-preview" id="adminBrandingPreview"></div>
            </section>
        </div>
    `;

    try {
        await refreshAdminBranding();
    } catch (error) {
        dynamicView.innerHTML = `<div class="admin-branding-error">${escapeHtml(error.message)}</div>`;
    }
}

async function refreshAdminBranding() {
    adminBrandingSettings = await adminBrandingFetch("/api/admin/branding", {
        headers: adminBrandingHeaders(false)
    });

    if (!selectedAdminBrandingId && adminBrandingSettings.length > 0) {
        const activeBranding = adminBrandingSettings.find(branding => branding.isActive);
        selectedAdminBrandingId = (activeBranding || adminBrandingSettings[0]).id;
    }

    renderAdminBrandingList();
    renderAdminBrandingForm(getSelectedAdminBranding());
}

function renderAdminBrandingList() {
    const list = document.getElementById("adminBrandingList");
    if (!list) return;

    if (adminBrandingSettings.length === 0) {
        list.innerHTML = `<div class="admin-branding-empty">Aucun branding enregistré.</div>`;
        return;
    }

    list.innerHTML = adminBrandingSettings.map(branding => `
        <button type="button"
                class="admin-branding-item ${branding.id === selectedAdminBrandingId ? "active" : ""}"
                onclick="selectAdminBranding(${branding.id})">
            <span class="admin-branding-item-title">
                <span>${escapeHtml(branding.slogan || "Branding")}</span>
                ${branding.isActive ? `<span class="admin-branding-badge active">Branding actif</span>` : `<span class="admin-branding-badge inactive">Inactif</span>`}
            </span>
            <span class="admin-branding-swatches">
                <span style="background:${escapeHtml(branding.primaryColor || "#0d6efd")}"></span>
                <span style="background:${escapeHtml(branding.secondaryColor || "#6610f2")}"></span>
            </span>
        </button>
    `).join("");
}

function selectAdminBranding(id) {
    selectedAdminBrandingId = id;
    clearSelectedBrandingFiles();
    renderAdminBrandingList();
    renderAdminBrandingForm(getSelectedAdminBranding());
}

function newAdminBranding() {
    selectedAdminBrandingId = null;
    clearSelectedBrandingFiles();
    renderAdminBrandingList();
    renderAdminBrandingForm(null);
}

function getSelectedAdminBranding() {
    return adminBrandingSettings.find(branding => branding.id === selectedAdminBrandingId) || null;
}

function renderAdminBrandingForm(branding) {
    const panel = document.getElementById("adminBrandingFormPanel");
    if (!panel) return;

    const data = branding || {
        primaryColor: "#0d6efd",
        secondaryColor: "#6610f2",
        slogan: ""
    };

    panel.innerHTML = `
        <h4>${branding ? "Branding" : "Identité visuelle"}</h4>
        <form id="adminBrandingForm" onsubmit="saveAdminBranding(event)">
            <div class="admin-branding-grid">
                ${adminBrandingFileInput("Favicon", "brandingFavicon", "favicon", data.faviconUrl)}
                ${adminBrandingFileInput("Logo sidebar", "brandingSidebarLogo", "sidebarLogo", data.sidebarLogoUrl)}
                ${adminBrandingFileInput("Logo de connexion", "brandingLoginLogo", "loginLogo", data.loginLogoUrl)}
                <div>
                    <label class="form-label" for="brandingPrimaryColor">Couleur principale</label>
                    <input class="form-control form-control-color" id="brandingPrimaryColor" type="color" value="${escapeHtml(data.primaryColor || "#0d6efd")}">
                </div>
                <div>
                    <label class="form-label" for="brandingSecondaryColor">Couleur secondaire</label>
                    <input class="form-control form-control-color" id="brandingSecondaryColor" type="color" value="${escapeHtml(data.secondaryColor || "#6610f2")}">
                </div>
                <div class="full">
                    <label class="form-label" for="brandingSlogan">Slogan</label>
                    <input class="form-control" id="brandingSlogan" maxlength="500" value="${escapeHtml(data.slogan || "")}">
                </div>
                <label class="form-check full">
                    <input class="form-check-input" id="brandingIsActive" type="checkbox" ${data.isActive ? "checked" : ""}>
                    <span class="form-check-label">Branding actif</span>
                </label>
            </div>
            <div class="admin-branding-actions">
                <button type="submit" class="btn btn-primary">Enregistrer</button>
                ${branding && !branding.isActive ? `<button type="button" class="btn btn-outline-success" onclick="activateAdminBranding(${branding.id})">Activer</button>` : ""}
                ${branding ? `<button type="button" class="btn btn-outline-danger" onclick="deleteAdminBranding(${branding.id})">Supprimer</button>` : ""}
            </div>
        </form>
    `;

    updateAdminBrandingPreview();
    document.querySelectorAll("#adminBrandingForm input").forEach(input => {
        input.addEventListener("input", updateAdminBrandingPreview);
        input.addEventListener("change", updateAdminBrandingPreview);
    });
}

function adminBrandingFileInput(label, inputId, key, imageUrl) {
    return `
        <div class="full">
            <label class="form-label" for="${inputId}">${label}</label>
            <input class="form-control" id="${inputId}" type="file" accept="image/jpeg,image/png,image/webp" onchange="handleAdminBrandingFile('${key}', this)">
            <div class="admin-branding-upload-hint">PNG, JPG ou WebP. Taille maximale 2 MB.</div>
            ${imageUrl ? `<img class="admin-branding-image-preview mt-2" src="${escapeHtml(resolveBrandingImageUrl(imageUrl))}" alt="${escapeHtml(label)}">` : ""}
        </div>
    `;
}

function collectAdminBrandingForm() {
    const existing = getSelectedAdminBranding();
    return {
        faviconUrl: existing?.faviconUrl || "",
        sidebarLogoUrl: existing?.sidebarLogoUrl || "",
        loginLogoUrl: existing?.loginLogoUrl || "",
        primaryColor: document.getElementById("brandingPrimaryColor").value,
        secondaryColor: document.getElementById("brandingSecondaryColor").value,
        slogan: document.getElementById("brandingSlogan").value.trim(),
        isActive: document.getElementById("brandingIsActive").checked
    };
}

async function saveAdminBranding(event) {
    event.preventDefault();
    const existing = getSelectedAdminBranding();
    const payload = collectAdminBrandingForm();
    const path = existing ? `/api/admin/branding/${existing.id}` : "/api/admin/branding";
    const method = existing ? "PUT" : "POST";

    try {
        const saved = await adminBrandingFetch(path, {
            method,
            headers: adminBrandingHeaders(true),
            body: JSON.stringify(payload)
        });

        await uploadSelectedAdminBrandingFiles(saved.id);
        selectedAdminBrandingId = saved.id;
        clearSelectedBrandingFiles();
        await refreshAdminBranding();
        await loadActiveBranding();
    } catch (error) {
        alert(error.message);
    }
}

async function uploadSelectedAdminBrandingFiles(id) {
    const uploads = [
        ["favicon", "favicon"],
        ["sidebarLogo", "sidebar-logo"],
        ["loginLogo", "login-logo"]
    ];

    for (const [key, endpoint] of uploads) {
        const file = selectedBrandingFiles[key];
        if (!file) continue;

        const formData = new FormData();
        formData.append("image", file);

        await adminBrandingFetch(`/api/admin/branding/${id}/${endpoint}`, {
            method: "POST",
            headers: adminBrandingHeaders(false),
            body: formData
        });
    }
}

function handleAdminBrandingFile(key, input) {
    const file = input.files && input.files[0];
    selectedBrandingFiles[key] = null;
    if (!file) {
        updateAdminBrandingPreview();
        return;
    }

    const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!acceptedTypes.includes(file.type)) {
        alert("Type d'image non accepté. Utilisez PNG, JPG ou WebP.");
        input.value = "";
        updateAdminBrandingPreview();
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        alert("Image trop volumineuse. Taille maximale : 2 MB.");
        input.value = "";
        updateAdminBrandingPreview();
        return;
    }

    selectedBrandingFiles[key] = file;
    updateAdminBrandingPreview();
}

async function activateAdminBranding(id) {
    try {
        await adminBrandingFetch(`/api/admin/branding/${id}/activate`, {
            method: "PUT",
            headers: adminBrandingHeaders(false)
        });
        selectedAdminBrandingId = id;
        clearSelectedBrandingFiles();
        await refreshAdminBranding();
        await loadActiveBranding();
    } catch (error) {
        alert(error.message);
    }
}

async function deleteAdminBranding(id) {
    if (!confirm("Supprimer ce branding ?")) {
        return;
    }
    try {
        await adminBrandingFetch(`/api/admin/branding/${id}`, {
            method: "DELETE",
            headers: adminBrandingHeaders(false)
        });
        selectedAdminBrandingId = null;
        clearSelectedBrandingFiles();
        await refreshAdminBranding();
        await loadActiveBranding();
    } catch (error) {
        alert(error.message);
    }
}

function updateAdminBrandingPreview() {
    const preview = document.getElementById("adminBrandingPreview");
    if (!preview || !document.getElementById("adminBrandingForm")) return;

    const data = collectAdminBrandingForm();
    const primaryColor = data.primaryColor || "#0d6efd";
    const secondaryColor = data.secondaryColor || "#6610f2";
    const sidebarLogo = selectedBrandingFiles.sidebarLogo
        ? URL.createObjectURL(selectedBrandingFiles.sidebarLogo)
        : resolveBrandingImageUrl(getSelectedAdminBranding()?.sidebarLogoUrl || "");
    const loginLogo = selectedBrandingFiles.loginLogo
        ? URL.createObjectURL(selectedBrandingFiles.loginLogo)
        : resolveBrandingImageUrl(getSelectedAdminBranding()?.loginLogoUrl || "");
    const favicon = selectedBrandingFiles.favicon
        ? URL.createObjectURL(selectedBrandingFiles.favicon)
        : resolveBrandingImageUrl(getSelectedAdminBranding()?.faviconUrl || "");

    preview.innerHTML = `
        <h4>Aperçu</h4>
        <div class="admin-branding-preview-shell" style="--preview-primary:${escapeHtml(primaryColor)};--preview-secondary:${escapeHtml(secondaryColor)}">
            <aside>
                <div class="admin-branding-preview-logo">${sidebarLogo ? `<img src="${escapeHtml(sidebarLogo)}" alt="Logo sidebar">` : "PrestaLink"}</div>
                <span>Branding</span>
            </aside>
            <main>
                <div class="admin-branding-preview-login">${loginLogo ? `<img src="${escapeHtml(loginLogo)}" alt="Logo de connexion">` : "PrestaLink"}</div>
                <p>${escapeHtml(data.slogan || "Slogan")}</p>
                <button type="button">Enregistrer</button>
            </main>
            <div class="admin-branding-preview-favicon">${favicon ? `<img src="${escapeHtml(favicon)}" alt="Favicon">` : "F"}</div>
        </div>
    `;
}

function clearSelectedBrandingFiles() {
    selectedBrandingFiles = {
        favicon: null,
        sidebarLogo: null,
        loginLogo: null
    };
}

function resolveBrandingImageUrl(imageUrl) {
    if (!imageUrl) return "";
    return imageUrl.startsWith("http") ? imageUrl : API_BASE + imageUrl;
}

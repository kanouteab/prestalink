let adminBanners = [];
let selectedAdminBannerId = null;
let selectedBannerImageFile = null;

function adminBannerHeaders(json) {
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

function isAdminUser() {
    if (window.prestalinkAdminToken) {
        return true;
    }
    return currentUser?.role === "ADMIN";
}

async function adminBannerFetch(path, options = {}) {
    const response = await fetch(API_BASE + path, options);
    if (response.status === 403) {
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

async function loadAdminBanners() {
    currentPublicationView = "admin-banners";
    const dynamicView = document.getElementById("dynamicView");

    if (!isAdminUser()) {
        dynamicView.innerHTML = `<div class="admin-banner-error">Accès réservé aux administrateurs</div>`;
        return;
    }

    dynamicView.innerHTML = `
        <div class="admin-banner-toolbar">
            <div>
                <h3>Bannière d’accueil</h3>
                <p class="text-muted mb-0">Gérer le contenu de la bannière d’accueil.</p>
            </div>
            <button type="button" class="btn btn-primary" onclick="newAdminBanner()">Nouvelle bannière</button>
        </div>
        <div class="admin-banner-layout">
            <section class="admin-banner-list" id="adminBannerList"></section>
            <section>
                <div class="admin-banner-form-panel" id="adminBannerFormPanel"></div>
                <div class="admin-banner-preview" id="adminBannerPreview"></div>
            </section>
        </div>
    `;

    try {
        await refreshAdminBanners();
    } catch (error) {
        dynamicView.innerHTML = `<div class="admin-banner-error">${escapeHtml(error.message)}</div>`;
    }
}

async function refreshAdminBanners() {
    adminBanners = await adminBannerFetch("/api/admin/banners", {
        headers: adminBannerHeaders(false)
    });

    if (!selectedAdminBannerId && adminBanners.length > 0) {
        const activeBanner = adminBanners.find(banner => banner.isActive);
        selectedAdminBannerId = (activeBanner || adminBanners[0]).id;
    }

    renderAdminBannerList();
    renderAdminBannerForm(getSelectedAdminBanner());
}

function renderAdminBannerList() {
    const list = document.getElementById("adminBannerList");
    if (!list) return;

    if (adminBanners.length === 0) {
        list.innerHTML = `<div class="admin-banner-empty">Aucune bannière enregistrée.</div>`;
        return;
    }

    list.innerHTML = adminBanners.map(banner => `
        <button type="button"
                class="admin-banner-item ${banner.id === selectedAdminBannerId ? "active" : ""}"
                onclick="selectAdminBanner(${banner.id})">
            <span class="admin-banner-item-title">
                <span>${escapeHtml(banner.title || "Sans titre")}</span>
                ${adminBannerBadge(banner)}
            </span>
            <span class="text-muted">${escapeHtml(banner.subtitle || "")}</span>
        </button>
    `).join("");
}

function adminBannerBadge(banner) {
    return banner.isActive
        ? `<span class="admin-banner-badge active">Affichée sur la page principale</span>`
        : `<span class="admin-banner-badge inactive">Bannière inactive</span>`;
}

function selectAdminBanner(id) {
    selectedAdminBannerId = id;
    selectedBannerImageFile = null;
    renderAdminBannerList();
    renderAdminBannerForm(getSelectedAdminBanner());
}

function newAdminBanner() {
    selectedAdminBannerId = null;
    selectedBannerImageFile = null;
    renderAdminBannerList();
    renderAdminBannerForm(null);
}

function getSelectedAdminBanner() {
    return adminBanners.find(banner => banner.id === selectedAdminBannerId) || null;
}

function renderAdminBannerForm(banner) {
    const panel = document.getElementById("adminBannerFormPanel");
    if (!panel) return;

    const data = banner || {};
    panel.innerHTML = `
        <h4>${banner ? "Modifier la bannière" : "Nouvelle bannière"}</h4>
        <form id="adminBannerForm" onsubmit="saveAdminBanner(event)">
            <div class="admin-banner-grid">
                <div class="full">
                    <label class="form-label" for="bannerImage">Image de bannière</label>
                    <input class="form-control" id="bannerImage" type="file" accept="image/jpeg,image/png,image/webp" onchange="handleAdminBannerImage(this)">
                    <div class="admin-banner-upload-hint">JPG, PNG ou WebP. Taille maximale 5 MB. Ratio recommandé : 16:9.</div>
                    ${data.imageUrl ? `<img class="admin-banner-image-preview mt-2" src="${resolveBannerImageUrl(data.imageUrl)}" alt="Image de bannière">` : ""}
                </div>
                <div class="full">
                    <label class="form-label" for="bannerTitle">Titre principal</label>
                    <input class="form-control" id="bannerTitle" value="${escapeHtml(data.title || "")}">
                </div>
                <div class="full">
                    <label class="form-label" for="bannerSubtitle">Sous-titre</label>
                    <textarea class="form-control" id="bannerSubtitle" rows="3">${escapeHtml(data.subtitle || "")}</textarea>
                </div>
                <div>
                    <label class="form-label" for="bannerPrimaryText">Bouton principal</label>
                    <input class="form-control" id="bannerPrimaryText" value="${escapeHtml(data.primaryButtonText || "")}">
                </div>
                <div>
                    <label class="form-label" for="bannerPrimaryLink">Lien du bouton principal</label>
                    <input class="form-control" id="bannerPrimaryLink" value="${escapeHtml(data.primaryButtonLink || "")}">
                </div>
                <div>
                    <label class="form-label" for="bannerSecondaryText">Bouton secondaire</label>
                    <input class="form-control" id="bannerSecondaryText" value="${escapeHtml(data.secondaryButtonText || "")}">
                </div>
                <div>
                    <label class="form-label" for="bannerSecondaryLink">Lien du bouton secondaire</label>
                    <input class="form-control" id="bannerSecondaryLink" value="${escapeHtml(data.secondaryButtonLink || "")}">
                </div>
                <div class="full">
                    <label class="form-label">Points forts</label>
                    <div class="admin-banner-grid">
                        <input class="form-control" id="bannerFeature1" value="${escapeHtml(data.feature1 || "")}">
                        <input class="form-control" id="bannerFeature2" value="${escapeHtml(data.feature2 || "")}">
                        <input class="form-control" id="bannerFeature3" value="${escapeHtml(data.feature3 || "")}">
                        <input class="form-control" id="bannerFeature4" value="${escapeHtml(data.feature4 || "")}">
                    </div>
                </div>
                <label class="form-check full">
                    <input class="form-check-input" id="bannerIsActive" type="checkbox" ${data.isActive ? "checked" : ""}>
                    <span class="form-check-label">${data.isActive ? "Désactiver" : "Activer"}</span>
                </label>
            </div>
            <div class="admin-banner-actions">
                <button type="submit" class="btn btn-primary">Enregistrer</button>
                ${banner ? adminBannerPushButton(banner) : ""}
                ${banner && banner.isActive ? `<button type="button" class="btn btn-outline-secondary" onclick="deactivateAdminBanner(${banner.id})">Désactiver</button>` : ""}
                ${banner && !banner.isActive ? `<button type="button" class="btn btn-outline-success" onclick="activateAdminBanner(${banner.id})">Activer</button>` : ""}
                ${banner ? `<button type="button" class="btn btn-outline-danger" onclick="deleteAdminBanner(${banner.id})">Supprimer</button>` : ""}
            </div>
        </form>
    `;

    updateAdminBannerPreview();
    document.querySelectorAll("#adminBannerForm input, #adminBannerForm textarea").forEach(input => {
        input.addEventListener("input", updateAdminBannerPreview);
        input.addEventListener("change", updateAdminBannerPreview);
    });
}

function adminBannerPushButton(banner) {
    if (banner.isActive) {
        return `<button type="button" class="btn btn-outline-primary" disabled>Déjà affichée sur la page principale</button>`;
    }
    return `<button type="button" class="btn btn-outline-primary" onclick="pushAdminBannerToHome(${banner.id})">Pousser vers la page principale</button>`;
}

function collectAdminBannerForm() {
    return {
        title: document.getElementById("bannerTitle").value.trim(),
        subtitle: document.getElementById("bannerSubtitle").value.trim(),
        primaryButtonText: document.getElementById("bannerPrimaryText").value.trim(),
        primaryButtonLink: document.getElementById("bannerPrimaryLink").value.trim(),
        secondaryButtonText: document.getElementById("bannerSecondaryText").value.trim(),
        secondaryButtonLink: document.getElementById("bannerSecondaryLink").value.trim(),
        imageUrl: getSelectedAdminBanner()?.imageUrl || "",
        feature1: document.getElementById("bannerFeature1").value.trim(),
        feature2: document.getElementById("bannerFeature2").value.trim(),
        feature3: document.getElementById("bannerFeature3").value.trim(),
        feature4: document.getElementById("bannerFeature4").value.trim(),
        isActive: document.getElementById("bannerIsActive").checked
    };
}

async function saveAdminBanner(event) {
    event.preventDefault();
    const existing = getSelectedAdminBanner();
    const payload = collectAdminBannerForm();
    const path = existing ? `/api/admin/banners/${existing.id}` : "/api/admin/banners";
    const method = existing ? "PUT" : "POST";

    try {
        const saved = await adminBannerFetch(path, {
            method,
            headers: adminBannerHeaders(true),
            body: JSON.stringify(payload)
        });

        if (selectedBannerImageFile) {
            await uploadAdminBannerImage(saved.id, selectedBannerImageFile);
        }

        selectedAdminBannerId = saved.id;
        selectedBannerImageFile = null;
        await refreshAdminBanners();
    } catch (error) {
        alert(error.message);
    }
}

async function uploadAdminBannerImage(id, file) {
    const formData = new FormData();
    formData.append("image", file);

    await adminBannerFetch(`/api/admin/banners/${id}/image`, {
        method: "POST",
        headers: adminBannerHeaders(false),
        body: formData
    });
}

function handleAdminBannerImage(input) {
    const file = input.files && input.files[0];
    selectedBannerImageFile = null;
    if (!file) {
        updateAdminBannerPreview();
        return;
    }

    const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!acceptedTypes.includes(file.type)) {
        alert("Type d'image non accepté. Utilisez JPG, PNG ou WebP.");
        input.value = "";
        updateAdminBannerPreview();
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Image trop volumineuse. Taille maximale : 5 MB.");
        input.value = "";
        updateAdminBannerPreview();
        return;
    }

    selectedBannerImageFile = file;
    updateAdminBannerPreview();
}

async function activateAdminBanner(id) {
    try {
        await adminBannerFetch(`/api/admin/banners/${id}/activate`, {
            method: "PUT",
            headers: adminBannerHeaders(false)
        });
        selectedAdminBannerId = id;
        await refreshAdminBanners();
    } catch (error) {
        alert(error.message);
    }
}

async function pushAdminBannerToHome(id) {
    try {
        await adminBannerFetch(`/api/admin/banners/${id}/activate`, {
            method: "PUT",
            headers: adminBannerHeaders(false)
        });
        selectedAdminBannerId = id;
        selectedBannerImageFile = null;
        await refreshAdminBanners();
        alert("Bannière poussée vers la page principale");
    } catch (error) {
        alert(error.message);
    }
}

async function deactivateAdminBanner(id) {
    const banner = adminBanners.find(item => item.id === id);
    if (!banner) return;

    try {
        await adminBannerFetch(`/api/admin/banners/${id}`, {
            method: "PUT",
            headers: adminBannerHeaders(true),
            body: JSON.stringify({
                ...banner,
                isActive: false
            })
        });
        selectedAdminBannerId = id;
        await refreshAdminBanners();
    } catch (error) {
        alert(error.message);
    }
}

async function deleteAdminBanner(id) {
    if (!confirm("Supprimer cette bannière ?")) {
        return;
    }
    try {
        await adminBannerFetch(`/api/admin/banners/${id}`, {
            method: "DELETE",
            headers: adminBannerHeaders(false)
        });
        selectedAdminBannerId = null;
        selectedBannerImageFile = null;
        await refreshAdminBanners();
    } catch (error) {
        alert(error.message);
    }
}

function updateAdminBannerPreview() {
    const preview = document.getElementById("adminBannerPreview");
    if (!preview || !document.getElementById("adminBannerForm")) return;

    const data = collectAdminBannerForm();
    const features = [data.feature1, data.feature2, data.feature3, data.feature4].filter(Boolean);
    const existingImageUrl = getSelectedAdminBanner()?.imageUrl;
    const imageUrl = selectedBannerImageFile
        ? URL.createObjectURL(selectedBannerImageFile)
        : resolveBannerImageUrl(existingImageUrl);

    preview.innerHTML = `
        <h4>Aperçu</h4>
        ${imageUrl ? `<img class="admin-banner-preview-image" src="${imageUrl}" alt="Aperçu">` : `<div class="admin-banner-image-preview"></div>`}
        <div class="admin-banner-preview-content">
            <h3>${escapeHtml(data.title || "Titre principal")}</h3>
            <p>${escapeHtml(data.subtitle || "Sous-titre")}</p>
            <div class="admin-banner-preview-features">
                ${features.map(feature => `<span>${escapeHtml(feature)}</span>`).join("")}
            </div>
            <div class="admin-banner-actions">
                ${data.primaryButtonText ? `<a class="btn btn-primary" href="${escapeHtml(data.primaryButtonLink || "#")}">${escapeHtml(data.primaryButtonText)}</a>` : ""}
                ${data.secondaryButtonText ? `<a class="btn btn-outline-secondary" href="${escapeHtml(data.secondaryButtonLink || "#")}">${escapeHtml(data.secondaryButtonText)}</a>` : ""}
            </div>
        </div>
    `;
}

function resolveBannerImageUrl(imageUrl) {
    if (!imageUrl) return "";
    return imageUrl.startsWith("http") ? imageUrl : API_BASE + imageUrl;
}

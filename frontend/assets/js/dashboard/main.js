document.addEventListener("DOMContentLoaded", async function () {
    restoreSidebarState();
    await loadCategories();
    await Promise.all([
        loadFavoriteState(),
        loadHistoryBadge(),
        updateNotificationBadge()
    ]);
    loadHomeFeed({ resetFilters: true });
    loadPersistentDashboardBanner();

    if (!isLoggedIn) {
        resetPrivateSidebarBadges();

        document.querySelectorAll(".auth-only").forEach(function (item) {
            item.style.display = "none";
        });

        const fabContainer = document.querySelector(".fab-container");
        if (fabContainer) {
            fabContainer.style.display = "none";
        }

        document.querySelector(".user-menu").style.display =
            "none";

        const header =
            document.querySelector(".app-header");

        const loginButton =
            document.createElement("button");

        loginButton.className =
            "btn btn-primary rounded-pill px-4";

        loginButton.textContent =
            "Connexion";

        loginButton.onclick =
            openLoginPage;

        header.appendChild(loginButton);

        setupModalOutsideClick();
        return;
    }

    localStorage.setItem("currentUserId", currentUser.id);

    document.getElementById("currentUserName").textContent =
        currentUser.fullName;
    updateHeaderVerificationBadge();

    renderHeaderUserAvatar();
    document.querySelectorAll(".auth-only").forEach(function (item) {
        item.style.display = "";
    });
    document.querySelectorAll(".admin-only").forEach(function (item) {
        item.style.display = currentUser.role === "ADMIN" ? "" : "none";
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeCreateOfferModal();
            closeCreateRequestModal();
            closePublicationDetail();
            closeProfileModal();
            closeNotificationPanel();
        }
    });

    setupModalOutsideClick();

    await loadDashboard();
    configureMenuByRole();
    await resumePendingAuthAction();

});

async function resumePendingAuthAction() {
    const pendingAction = readPendingAuthAction();

    if (!pendingAction || !isLoggedIn || !currentUser?.id) {
        return;
    }

    clearPendingAuthAction();

    const payload = pendingAction.payload || {};
    const actionName = pendingAction.actionName;

    if (pendingAction.context?.view) {
        currentPublicationView = pendingAction.context.view;
    }

    try {
        switch (actionName) {
            case "createOffer":
                restoreOfferForm(payload.formData);
                openCreateOfferModal();
                break;
            case "submitOffer":
                restoreOfferForm(payload.formData);
                await submitOffer();
                break;
            case "editOffer":
                await editOffer(payload.publicationId);
                break;
            case "updateOffer":
                restoreOfferForm(payload.formData);
                await updateOffer();
                break;
            case "deleteOffer":
                await deleteOffer(payload.publicationId);
                break;
            case "createRequest":
                restoreRequestForm(payload.formData);
                openCreateRequestModal();
                break;
            case "submitRequest":
                restoreRequestForm(payload.formData);
                await submitRequest();
                break;
            case "editRequest":
                await editRequest(payload.publicationId);
                break;
            case "updateRequest":
                restoreRequestForm(payload.formData);
                await updateRequest();
                break;
            case "deleteRequest":
                await deleteRequest(payload.publicationId);
                break;
            case "toggleFavorite":
                await toggleFavorite(payload.publicationType, payload.publicationId);
                break;
            case "sharePublication":
                if (payload.publication) {
                    openPublicationShareMenu(createAuthResumeShareAnchor(), buildPublicationShareData(payload.publication));
                }
                break;
            case "contactPublication":
                await contactPublication(payload.authorId, payload.authorName, payload.publicationType, payload.publicationId, payload.publicationTitle);
                break;
            case "updatePublicationStatus":
                await updatePublicationStatus(payload.publicationType, payload.publicationId, payload.status);
                break;
            case "reportPublication":
                openReportModal(payload.targetType, encodePublicationPayload(payload.publication));
                break;
            case "openProfile":
                openProfileModal();
                break;
            case "saveProfile":
                openProfileModal();
                restoreProfileForm(payload.formData);
                await saveProfile();
                break;
            case "uploadProfilePhoto":
                openProfileModal();
                break;
            case "uploadPublicationPhotos":
                payload.type === "request" ? openCreateRequestModal() : openCreateOfferModal();
                break;
            case "submitMissionReview":
                await submitMissionReview(payload.missionId, payload.providerId);
                break;
            case "myOffers":
                await loadMyOffers();
                break;
            case "myRequests":
                await loadMyRequests();
                break;
            case "favorites":
                await loadMyFavorites();
                break;
            case "history":
                await loadServiceHistory();
                break;
            case "historyStatus":
                await updateHistoryStatus(payload.historyId, payload.status);
                break;
            case "missions":
                await loadMissionsView();
                break;
            default:
                if (pendingAction.context?.view) {
                    await restorePublicationView(pendingAction.context.view);
                }
        }
    } catch (error) {
        console.error(error);
        showToast("Impossible de reprendre l’action demandée.");
    }
}

function createAuthResumeShareAnchor() {
    const anchor = document.createElement("span");
    anchor.id = "authResumeShareAnchor";
    anchor.style.position = "fixed";
    anchor.style.top = "96px";
    anchor.style.right = "24px";
    anchor.style.width = "1px";
    anchor.style.height = "1px";
    anchor.style.pointerEvents = "none";
    document.body.appendChild(anchor);
    return anchor;
}

async function restorePublicationView(view) {
    if (view === "my-offers") return loadMyOffers();
    if (view === "my-requests") return loadMyRequests();
    if (view === "favorites") return loadMyFavorites();
    if (view === "history") return loadServiceHistory();
    if (view === "offers") return loadAvailableOffers();
    if (view === "requests") return loadAvailableRequests();
    return loadHomeFeed({ resetFilters: false });
}

function renderHeaderUserAvatar() {
    const avatar = document.getElementById("userAvatar");

    if (!avatar || !currentUser) return;

    const photoUrl = typeof resolveAssetUrl === "function" ? resolveAssetUrl(currentUser.photoUrl || "") : "";
    avatar.innerHTML = photoUrl
        ? `<img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(currentUser.fullName || "Utilisateur")}">`
        : escapeHtml((currentUser.fullName || "U").charAt(0).toUpperCase());
}

async function loadPersistentDashboardBanner() {
    const section = document.getElementById("persistentDashboardBanner");
    if (!section) return;

    try {
        const response = await fetch(API_BASE + "/api/admin/banners/active");
        if (!response.ok) {
            throw new Error("Active banner unavailable");
        }
        const banner = await response.json();
        renderPersistentDashboardBanner(banner || {});
    } catch (error) {
        renderPersistentDashboardBanner({});
    }
}

function renderPersistentDashboardBanner(banner) {
    renderPersistentMediaGrid(extractPersistentMediaItems(banner));
    renderPersistentActiveBanner(banner);
}

function extractPersistentMediaItems(banner) {
    const configured = banner.mediaItems || banner.mediaUrls || banner.media || [];
    const items = Array.isArray(configured) ? configured : [];
    return items.slice(0, 4).map(function (item) {
        if (typeof item === "string") {
            return {
                url: item,
                type: isVideoMedia(item) ? "video" : "image"
            };
        }
        return {
            url: item.url || item.src || "",
            type: item.type || (isVideoMedia(item.url || item.src || "") ? "video" : "image"),
            label: item.label || item.title || ""
        };
    }).filter(function (item) {
        return item.url;
    });
}

function renderPersistentMediaGrid(mediaItems) {
    const grid = document.getElementById("persistentMediaGrid");
    if (!grid) return;

    const placeholders = [
        "Service local",
        "Prestataire vérifié",
        "Demande rapide",
        "Communauté active"
    ];

    if (!mediaItems.length) {
        grid.innerHTML = placeholders.map(function (label, index) {
            return `
                <div class="persistent-media-item persistent-media-placeholder">
                    <span>${index + 1}</span>
                    <strong>${escapeHtml(label)}</strong>
                </div>
            `;
        }).join("");
        return;
    }

    const renderedItems = mediaItems.map(function (item) {
        const mediaUrl = dashboardBannerAssetUrl(item.url);
        const label = item.label ? `<span>${escapeHtml(item.label)}</span>` : "";
        if (item.type === "video") {
            return `
                <div class="persistent-media-item">
                    <video src="${escapeHtml(mediaUrl)}" muted loop playsinline controls></video>
                    ${label}
                </div>
            `;
        }
        return `
            <div class="persistent-media-item">
                <img src="${escapeHtml(mediaUrl)}" alt="${escapeHtml(item.label || "Média PrestaLink")}">
                ${label}
            </div>
        `;
    });

    while (renderedItems.length < 4) {
        const label = placeholders[renderedItems.length];
        renderedItems.push(`
            <div class="persistent-media-item persistent-media-placeholder">
                <span>${renderedItems.length + 1}</span>
                <strong>${escapeHtml(label)}</strong>
            </div>
        `);
    }

    grid.innerHTML = renderedItems.join("");
}

function renderPersistentActiveBanner(banner) {
    const container = document.getElementById("persistentActiveBanner");
    if (!container) return;

    const imageUrl = dashboardBannerAssetUrl(banner.imageUrl || "");
    const altText = banner.title || "Banniere PrestaLink";

    container.innerHTML = `
        ${imageUrl
            ? `<img class="persistent-banner-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(altText)}">`
            : `<div class="persistent-banner-image persistent-banner-image-empty"></div>`}
    `;
}
function dashboardBannerAssetUrl(url) {
    if (!url) return "";
    return url.startsWith("http") ? url : API_BASE + url;
}

function isVideoMedia(url) {
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url || "");
}

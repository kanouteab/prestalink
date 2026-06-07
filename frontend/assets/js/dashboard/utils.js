function updateDynamicView(title, items) {
    const dynamicView = document.getElementById("dynamicView");
    if (dynamicView) {
        dynamicView.style.display = "";
    }

    document.getElementById("dynamicTitle").textContent = title;

    const container =
        document.getElementById("dynamicContent");

    container.innerHTML = "";

    if (!items || items.length === 0) {
        container.innerHTML =
            renderEmptyState("Aucun contenu disponible", "Les éléments apparaîtront ici dès qu’ils seront disponibles.");
        return;
    }

    items.forEach(function (item) {
        const div = document.createElement("div");
        div.className = "dynamic-item";
        div.innerHTML = item;
        container.appendChild(div);
    });
}
function hideDynamicView() {
    const dynamicView = document.getElementById("dynamicView");
    const content = document.getElementById("dynamicContent");

    if (content) {
        content.innerHTML = "";
    }

    if (dynamicView) {
        dynamicView.style.display = "none";
    }
}
function updateDynamicSubtitle(text) {
    const subtitle = document.getElementById("dynamicSubtitle");

    if (subtitle) {
        subtitle.textContent = text;
    }
}

function renderEmptyState(title, message, actionHtml = "") {
    return `
        <div class="empty-state">
            <div class="empty-icon">Ø</div>
            <h5>${title}</h5>
            <p>${message}</p>
            ${actionHtml}
        </div>
    `;
}

function renderPublicationActions(type, id) {
    const editFunction = type === "offer" ? "editOffer" : "editRequest";
    const deleteFunction = type === "offer" ? "deleteOffer" : "deleteRequest";

    return `
        <div class="service-actions">
            <button class="service-btn service-btn-outline"
                    onclick="event.stopPropagation(); ${editFunction}(${id})">
                Modifier
            </button>
            <button class="service-btn service-btn-danger"
                    onclick="event.stopPropagation(); ${deleteFunction}(${id}, this)">
                Supprimer
            </button>
        </div>
    `;
}

const PUBLICATION_STATUSES = {
    AVAILABLE: { key: "available", label: "Disponible" },
    IN_PROGRESS: { key: "in-progress", label: "En cours" },
    COMPLETED: { key: "completed", label: "Terminée" },
    SUSPENDED: { key: "suspended", label: "Suspendue" },
    EXPIRED: { key: "expired", label: "Expirée" },
    EN_ATTENTE: { key: "available", label: "Disponible", value: "AVAILABLE" },
    EN_COURS: { key: "in-progress", label: "En cours", value: "IN_PROGRESS" },
    TERMINEE: { key: "completed", label: "Terminée", value: "COMPLETED" },
    ANNULEE: { key: "suspended", label: "Suspendue", value: "SUSPENDED" }
};

function normalizePublicationStatus(status, active = true) {
    if (active === false && !status) {
        return { key: "suspended", label: "Suspendue", value: "SUSPENDED" };
    }

    const normalized = PUBLICATION_STATUSES[status || "AVAILABLE"] || PUBLICATION_STATUSES.AVAILABLE;
    return {
        key: normalized.key,
        label: normalized.label,
        value: normalized.value || status || "AVAILABLE"
    };
}

function renderPublicationStatusBadge(status, active = true) {
    const normalized = normalizePublicationStatus(status, active);
    return `<span class="publication-status-badge publication-status-${normalized.key}">${normalized.label}</span>`;
}

function renderPublicationStatusActions(publication) {
    if (!publication || !isCurrentUserPublicationAuthor(publication.authorId)) {
        return "";
    }

    const status = normalizePublicationStatus(publication.status, publication.active);
    const actions = [];

    if (status.value === "AVAILABLE") {
        actions.push({ value: "IN_PROGRESS", label: "Marquer en cours", className: "service-btn-primary" });
        actions.push({ value: "COMPLETED", label: "Terminer", className: "service-btn-outline" });
        actions.push({ value: "SUSPENDED", label: "Suspendre", className: "service-btn-danger" });
    } else if (status.value === "IN_PROGRESS") {
        actions.push({ value: "COMPLETED", label: "Terminer", className: "service-btn-primary" });
        actions.push({ value: "SUSPENDED", label: "Suspendre", className: "service-btn-danger" });
    } else if (status.value === "SUSPENDED" || status.value === "EXPIRED") {
        actions.push({ value: "AVAILABLE", label: "Réactiver", className: "service-btn-primary" });
    }

    if (!actions.length) {
        return "";
    }

    return `
        <div class="publication-status-actions">
            ${actions.map(action => `
                <button type="button"
                        class="service-btn ${action.className}"
                        onclick="event.stopPropagation(); updatePublicationStatus('${publication.publicationType}', ${Number(publication.id)}, '${action.value}')">
                    ${action.label}
                </button>
            `).join("")}
        </div>
    `;
}

async function updatePublicationStatus(publicationType, publicationId, status) {
    if (!requireAuthOrResume("updatePublicationStatus", {
        publicationType,
        publicationId,
        status
    })) {
        return;
    }

    const type = publicationType === "OFFER" ? "offer" : "request";
    const endpoint = API_BASE + "/api/" + (type === "offer" ? "offers" : "requests") + "/" + publicationId + "/status?status=" + encodeURIComponent(status);

    try {
        const res = await fetch(endpoint, {
            method: "PUT",
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            showToast(await res.text() || "Impossible de modifier le statut.");
            return;
        }

        showToast("Statut mis à jour");
        closePublicationDetail();
        await loadDashboard();
        await reloadCurrentPublicationView();
    } catch (error) {
        console.error(error);
        showToast("Impossible de modifier le statut.");
    }
}

let activeReportPayload = null;

function renderReportActions(publication) {
    if (!publication || !publication.id) {
        return "";
    }

    const encoded = encodePublicationPayload(publication);
    const reportUserButton = publication.authorId && !isCurrentUserPublicationAuthor(publication.authorId)
        ? `
            <button type="button"
                    class="service-btn service-btn-warning"
                    onclick="event.stopPropagation(); openReportModal('USER', '${encoded}')">
                Signaler un utilisateur
            </button>
        `
        : "";

    return `
        <span class="report-actions">
            ${reportUserButton}
            <button type="button"
                    class="service-btn service-btn-warning"
                    onclick="event.stopPropagation(); openReportModal('PUBLICATION', '${encoded}')">
                Signaler une publication
            </button>
        </span>
    `;
}

function openReportModal(targetType, encodedPublication) {
    const publication = JSON.parse(decodeURIComponent(encodedPublication));

    if (!requireReportAuthOrResume(targetType, publication)) {
        return;
    }

    activeReportPayload = {
        targetType,
        reportedUserId: publication.authorId || null,
        publicationType: publication.publicationType || null,
        publicationId: publication.id || null
    };

    document.getElementById("reportModalTitle").textContent =
        targetType === "USER" ? "Signaler un utilisateur" : "Signaler une publication";
    document.getElementById("reportDetails").value = "";

    const modal = document.getElementById("reportModal");
    modal.classList.add("show");
    modal.style.display = "flex";
}

function requireReportAuthOrResume(targetType, publication) {
    if (isLoggedIn && currentUser?.id) {
        return true;
    }

    savePendingAuthAction("reportPublication", {
        targetType,
        publication
    });

    showToast("Connectez-vous pour signaler ce contenu. Votre action reprendra automatiquement après connexion.");

    setTimeout(redirectToLoginOrRegister, 800);
    return false;
}

function closeReportModal() {
    const modal = document.getElementById("reportModal");

    if (!modal) return;

    modal.classList.remove("show");
    modal.style.display = "none";
    activeReportPayload = null;
}

async function submitReport(reason) {
    if (!activeReportPayload) {
        return;
    }

    if (!requireReportAuthOrResume(activeReportPayload.targetType, {
        id: activeReportPayload.publicationId,
        authorId: activeReportPayload.reportedUserId,
        publicationType: activeReportPayload.publicationType
    })) {
        closeReportModal();
        return;
    }

    const body = {
        ...activeReportPayload,
        reason,
        details: document.getElementById("reportDetails").value.trim()
    };

    try {
        const res = await fetch(API_BASE + "/api/reports", {
            method: "POST",
            headers: getAuthHeaders({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            showToast(await res.text() || "Signalement impossible.");
            return;
        }

        closeReportModal();
        showToast("Signalement envoyé");
    } catch (error) {
        console.error(error);
        showToast("Signalement impossible.");
    }
}

function getAuthHeaders(extraHeaders = {}) {
    const headers = { ...extraHeaders };

    if (currentUser?.id) {
        headers["X-Current-User-Id"] = String(currentUser.id);
    }

    return headers;
}

async function fetchJsonWithFallback(primaryUrl, fallbackUrl, emptyFallbackMessage = "") {
    try {
        const primaryRes = await fetch(primaryUrl);

        if (primaryRes.ok) {
            const primaryData = await primaryRes.json();

            if (Array.isArray(primaryData) && primaryData.length > 0) {
                return {
                    data: primaryData,
                    fallbackUsed: false,
                    message: ""
                };
            }
        }
    } catch (error) {
        addEvent("Chargement prioritaire indisponible, affichage général.");
    }

    let fallbackItems = [];

    try {
        const fallbackRes = await fetch(fallbackUrl);
        const fallbackData = fallbackRes.ok ? await fallbackRes.json() : [];
        fallbackItems = Array.isArray(fallbackData) ? fallbackData : [];
    } catch (error) {
        addEvent("Chargement général indisponible.");
    }

    return {
        data: fallbackItems,
        fallbackUsed: fallbackItems.length > 0,
        message: fallbackItems.length > 0 ? emptyFallbackMessage : ""
    };
}

function hasCurrentUserResidenceLocation() {
    return Boolean(
        isLoggedIn &&
        currentUser &&
        [currentUser.streetAddress, currentUser.city, currentUser.postalCode, currentUser.country]
            .some(value => value && String(value).trim())
    );
}

function getZoneFallbackMessage() {
    return hasCurrentUserResidenceLocation()
        ? "Aucune publication trouvée dans votre zone. Voici toutes les publications disponibles."
        : "";
}

function buildOfferDetailPayload(offer) {
    const ownerCountry = offer.provider?.country || "";

    return {
        id: offer.id,
        type: "Offre",
        title: offer.title,
        description: offer.description,
        icon: offer.category?.icon || "???",
        category: offer.category?.name || "Catégorie",
        location: offer.locationLabel || offer.location || "Non précisée",
        latitude: parseCoordinate(offer.latitude),
        longitude: parseCoordinate(offer.longitude),
        distanceKm: getPublicationDistance(offer),
        amount: formatMoney(offer.price, ownerCountry),
        author: offer.provider?.fullName || "Auteur inconnu",
        authorId: offer.provider?.id || null,
        authorPhotoUrl: offer.provider?.photoUrl || "",
        authorRole: offer.provider?.role || "PRESTATAIRE",
        provider: offer.provider || null,
        publicationType: "OFFER",
        status: offer.status || (offer.active ? "AVAILABLE" : "SUSPENDED"),
        active: offer.active,
        date: offer.createdAt || "",
        photoUrls: normalizePublicationPhotos(offer.photoUrls)
    };
}

function isCurrentUserPublicationAuthor(authorId) {
    return Boolean(currentUser?.id && authorId && String(currentUser.id) === String(authorId));
}

function renderContactPublicationAction(authorId, authorName, publicationType, publicationId, publicationTitle) {
    if (!authorId) {
        return "";
    }

    if (isCurrentUserPublicationAuthor(authorId)) {
        return "";
    }

    return `
        <button type="button"
                class="service-btn service-btn-primary contact-publication-btn"
                onclick="event.stopPropagation(); contactPublication(${Number(authorId)}, '${escapeJs(authorName || "Utilisateur")}', '${escapeJs(publicationType || "Publication")}', ${Number(publicationId)}, '${escapeJs(publicationTitle || "Publication")}')">
            Contacter
        </button>
    `;
}

function renderShareButton(publication) {
    if (!publication || !publication.id) {
        return "";
    }

    return `
        <span class="publication-share">
            <button type="button"
                    class="share-btn"
                    onclick="sharePublication(event, '${encodePublicationPayload(publication)}')">
                <span aria-hidden="true">↗</span>
                <span>Partager</span>
            </button>
        </span>
    `;
}

async function sharePublication(event, encodedPublication) {
    event.preventDefault();
    event.stopPropagation();

    let publication;
    try {
        publication = JSON.parse(decodeURIComponent(encodedPublication));
    } catch (error) {
        console.error(error);
        showToast("Impossible de partager cette publication");
        return;
    }

    if (!requireAuthOrResume("sharePublication", { publication })) {
        closePublicationShareMenu();
        return;
    }

    const shareData = buildPublicationShareData(publication);
    const mobileShare = typeof window.matchMedia === "function"
        && window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;

    if (mobileShare && navigator.share) {
        try {
            await navigator.share({
                title: shareData.title,
                text: shareData.text,
                url: shareData.url
            });
            return;
        } catch (error) {
            if (error?.name === "AbortError") {
                return;
            }
        }
    }

    openPublicationShareMenu(event.currentTarget, shareData);
}

function buildPublicationShareData(publication) {
    const type = normalizeSharePublicationType(publication);
    const typeLabel = type === "REQUEST" ? "Demande" : "Offre";
    const title = publication.title || "Publication PrestaLink";
    const amount = publication.amount && publication.amount !== "Non précisée"
        ? publication.amount
        : "";
    const parts = [
        typeLabel + " : " + title,
        publication.category ? "Catégorie : " + publication.category : "",
        publication.location ? "Localisation : " + publication.location : "",
        amount ? "Montant : " + amount : ""
    ].filter(Boolean);

    return {
        title: title,
        text: parts.join("\n"),
        url: buildPublicationShareUrl(type, publication.id)
    };
}

function normalizeSharePublicationType(publication) {
    const value = String(publication.publicationType || publication.type || "").toUpperCase();
    return value.includes("REQUEST") || value.includes("DEMANDE") ? "REQUEST" : "OFFER";
}

function buildPublicationShareUrl(publicationType, publicationId) {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
        publicationType: publicationType,
        id: String(publicationId)
    });

    return baseUrl + "?" + params.toString();
}

let activePublicationShareAnchor = null;

function openPublicationShareMenu(anchor, shareData) {
    closePublicationShareMenu();

    const menu = document.createElement("div");
    menu.id = "publicationShareMenu";
    menu.className = "publication-share-menu";
    menu.innerHTML = `
        <button type="button" onclick="openSharePlatform(event, 'facebook')">Partager sur Facebook</button>
        <button type="button" onclick="openSharePlatform(event, 'instagram')">Partager sur Instagram</button>
        <button type="button" onclick="openSharePlatform(event, 'whatsapp')">Partager sur WhatsApp</button>
        <button type="button" onclick="openSharePlatform(event, 'linkedin')">Partager sur LinkedIn</button>
        <button type="button" onclick="openSharePlatform(event, 'x')">Partager sur X</button>
        <button type="button" onclick="openSharePlatform(event, 'copy')">Copier le lien</button>
    `;
    menu.dataset.shareTitle = shareData.title;
    menu.dataset.shareText = shareData.text;
    menu.dataset.shareUrl = shareData.url;
    document.body.appendChild(menu);

    activePublicationShareAnchor = anchor;
    positionPublicationShareMenu();
    window.addEventListener("scroll", positionPublicationShareMenu, true);
    window.addEventListener("resize", positionPublicationShareMenu);

    setTimeout(() => {
        document.addEventListener("click", handlePublicationShareOutsideClick);
    }, 0);
}

function positionPublicationShareMenu() {
    const menu = document.getElementById("publicationShareMenu");
    const anchor = activePublicationShareAnchor;

    if (!menu || !anchor || !document.body.contains(anchor)) {
        closePublicationShareMenu();
        return;
    }

    const rect = anchor.getBoundingClientRect();
    const menuWidth = menu.offsetWidth || 220;
    const menuHeight = menu.offsetHeight || 260;
    const margin = 8;
    const maxLeft = Math.max(margin, window.innerWidth - menuWidth - margin);
    const left = Math.min(Math.max(rect.left, margin), maxLeft);
    const hasRoomBelow = rect.bottom + margin + menuHeight <= window.innerHeight;
    const top = hasRoomBelow
        ? rect.bottom + margin
        : Math.max(margin, rect.top - menuHeight - margin);

    menu.style.left = left + "px";
    menu.style.top = top + "px";
}

function handlePublicationShareOutsideClick(event) {
    const menu = document.getElementById("publicationShareMenu");

    if (!menu) {
        return;
    }

    if (menu.contains(event.target) || activePublicationShareAnchor?.contains(event.target)) {
        return;
    }

    closePublicationShareMenu();
}

function closePublicationShareMenu() {
    window.removeEventListener("scroll", positionPublicationShareMenu, true);
    window.removeEventListener("resize", positionPublicationShareMenu);
    document.removeEventListener("click", handlePublicationShareOutsideClick);
    activePublicationShareAnchor = null;
    document.getElementById("publicationShareMenu")?.remove();
    document.getElementById("authResumeShareAnchor")?.remove();
}

async function openSharePlatform(event, platform) {
    event.preventDefault();
    event.stopPropagation();

    if (!requireAuthOrResume("sharePublication")) {
        closePublicationShareMenu();
        return;
    }

    const menu = document.getElementById("publicationShareMenu");
    if (!menu) return;

    const shareData = {
        title: menu.dataset.shareTitle || "",
        text: menu.dataset.shareText || "",
        url: menu.dataset.shareUrl || ""
    };
    const encodedUrl = encodeURIComponent(shareData.url);
    const encodedText = encodeURIComponent(shareData.text + "\n" + shareData.url);
    const urls = {
        facebook: "https://www.facebook.com/sharer/sharer.php?u=" + encodedUrl,
        whatsapp: "https://wa.me/?text=" + encodedText,
        linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=" + encodedUrl,
        x: "https://twitter.com/intent/tweet?text=" + encodedText
    };

    if (platform === "copy") {
        await copyPublicationShareText(shareData.url, "Lien copié");
    } else if (platform === "instagram") {
        await copyPublicationShareText(shareData.text + "\n" + shareData.url, "Lien copié pour Instagram");
    } else if (urls[platform]) {
        window.open(urls[platform], "_blank", "noopener");
    } else {
        showToast("Impossible de partager cette publication");
    }

    closePublicationShareMenu();
}

async function copyPublicationShareText(text, message) {
    if (!requireAuthOrResume("sharePublication")) {
        return;
    }

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const input = document.createElement("textarea");
            input.value = text;
            input.setAttribute("readonly", "");
            input.style.position = "fixed";
            input.style.opacity = "0";
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            input.remove();
        }
        showToast(message);
    } catch (error) {
        console.error(error);
        showToast("Impossible de partager cette publication");
    }
}

async function contactPublication(authorId, authorName, publicationType, publicationId, publicationTitle) {
    if (!requireAuthOrResume("contactPublication", {
        authorId,
        authorName,
        publicationType,
        publicationId,
        publicationTitle
    })) {
        return;
    }

    if (isCurrentUserPublicationAuthor(authorId)) {
        showToast("Vous ne pouvez pas discuter avec vous-même.");
        return;
    }

    closePublicationDetail();
    openPublicationChat({
        ownerId: Number(authorId),
        ownerName: authorName || "Utilisateur",
        publicationType: publicationType || "Publication",
        publicationId: Number(publicationId),
        publicationTitle: publicationTitle || "Publication"
    });
}

function encodePublicationPayload(payload) {
    return encodeURIComponent(JSON.stringify(payload)).replace(/'/g, "%27");
}

let selectedPublication = null;

async function openPublicationDetail(publication) {
    selectedPublication = publication;
    recordPublicationView(publication);

    document.getElementById("detailIcon").textContent = publication.icon;
    document.getElementById("detailTitle").textContent = publication.title;
    document.getElementById("detailDescription").textContent =
        publication.description || "Aucune description fournie.";
    document.getElementById("detailPhotos").innerHTML =
        renderPublicationDetailPhotos(publication.photoUrls);
    document.getElementById("detailAuthor").innerHTML =
        renderPublicationOwner(publication);
    document.getElementById("detailType").textContent = publication.type;
    document.getElementById("detailCategory").textContent = publication.category;
    document.getElementById("detailStatus").innerHTML =
        renderPublicationStatusBadge(publication.status, publication.active);
    document.getElementById("detailLocation").textContent = publication.location;
    document.getElementById("detailDistance").textContent =
        Number.isFinite(publication.distanceKm) ? "À " + formatDistanceKm(publication.distanceKm) : "Non précisée";
    document.getElementById("detailDate").textContent =
        publication.date ? new Date(publication.date).toLocaleString() : "Non précisée";
    document.getElementById("detailAmount").textContent = publication.amount;
    document.getElementById("detailTrust").innerHTML =
        publication.provider
            ? renderProviderTrust(publication.provider, publication.location)
            : renderUserTrust(publication.user);
    document.getElementById("detailContactAction").innerHTML =
        renderContactPublicationAction(
            publication.authorId,
            publication.author,
            publication.type,
            publication.id,
            publication.title
        );
    document.getElementById("detailShareAction").innerHTML =
        renderShareButton(publication);
    document.getElementById("detailMapAction").innerHTML =
        renderPublicationMapAction(publication);
    document.getElementById("detailStatusActions").innerHTML =
        renderPublicationStatusActions(publication);
    document.getElementById("detailReportActions").innerHTML =
        renderReportActions(publication);
    updateDetailFavoriteAction(publication);

    document.getElementById("publicationDetailModal").classList.add("show");

    if (publication.authorId && publication.type === "Offre") {
        try {
            const res = await fetch(API_BASE + "/api/providers/" + publication.authorId + "/trust-profile");

            if (res.ok) {
                const profile = await res.json();
                document.getElementById("detailTrust").innerHTML =
                    renderProviderTrust(profile.provider, publication.location) +
                    renderProviderReviews(profile.reviews);
            }
        } catch (error) {
            addEvent("Impossible de charger les avis du prestataire.");
        }
    } else if (!publication.provider) {
        document.getElementById("detailTrust").innerHTML +=
            renderProviderReviews([], "Aucun commentaire pour cet utilisateur actuellement");
    }
}

function closePublicationDetail() {
    document.getElementById("publicationDetailModal")?.classList.remove("show");
    closePublicationShareMenu();
    selectedPublication = null;
}

function openPublicationDetailFromPayload(encodedPayload) {
    try {
        Promise.resolve(openPublicationDetail(JSON.parse(decodeURIComponent(encodedPayload))))
            .catch(error => {
                console.error(error);
                showToast("Impossible d’ouvrir le détail de cette publication.");
            });
    } catch (error) {
        console.error(error);
        showToast("Impossible d’ouvrir le détail de cette publication.");
    }
}

let publicationLightboxPhotos = [];
let publicationLightboxIndex = 0;
let publicationLightboxKeyHandler = null;

function openPublicationPhotoFromPayload(event, encodedPayload, selectedIndex) {
    event.preventDefault();
    event.stopPropagation();

    try {
        const payload = JSON.parse(decodeURIComponent(encodedPayload));
        const photos = normalizePublicationPhotos(payload.photoUrls);
        const index = Number(selectedIndex);

        if (!photos.length || !Number.isInteger(index) || index < 0 || index >= photos.length) {
            return;
        }

        openPublicationPhotoLightbox(photos, index);
    } catch (error) {
        console.error(error);
        showToast("Impossible d’ouvrir cette photo.");
    }
}

function openPublicationPhotoList(event, encodedPhotoUrls, selectedIndex) {
    event.preventDefault();
    event.stopPropagation();

    try {
        const photos = normalizePublicationPhotos(JSON.parse(decodeURIComponent(encodedPhotoUrls)));
        const index = Number(selectedIndex);

        if (!photos.length || !Number.isInteger(index) || index < 0 || index >= photos.length) {
            return;
        }

        openPublicationPhotoLightbox(photos, index);
    } catch (error) {
        console.error(error);
        showToast("Impossible dâ€™ouvrir cette photo.");
    }
}

function openPublicationPhotoLightbox(photoUrls, selectedIndex) {
    publicationLightboxPhotos = normalizePublicationPhotos(photoUrls);
    publicationLightboxIndex = selectedIndex;

    let overlay = document.getElementById("publicationPhotoLightbox");

    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "publicationPhotoLightbox";
        overlay.className = "photo-lightbox-overlay";
        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) {
                closePublicationPhotoLightbox();
            }
        });
        document.body.appendChild(overlay);
    }

    overlay.classList.add("show");
    renderPublicationPhotoLightbox();
    bindPublicationPhotoLightboxKeys();
}

function renderPublicationPhotoLightbox() {
    const overlay = document.getElementById("publicationPhotoLightbox");

    if (!overlay || !publicationLightboxPhotos.length) {
        return;
    }

    const photoUrl = resolveAssetUrl(publicationLightboxPhotos[publicationLightboxIndex]);
    const hasMultiplePhotos = publicationLightboxPhotos.length > 1;

    overlay.innerHTML = `
        <div class="photo-lightbox-content" onclick="event.stopPropagation()">
            <button type="button"
                    class="photo-lightbox-close"
                    aria-label="Fermer"
                    onclick="closePublicationPhotoLightbox()">×</button>
            ${hasMultiplePhotos ? `
                <button type="button"
                        class="photo-lightbox-prev"
                        aria-label="Photo précédente"
                        onclick="showPreviousPublicationPhoto(event)">‹</button>
                <button type="button"
                        class="photo-lightbox-next"
                        aria-label="Photo suivante"
                        onclick="showNextPublicationPhoto(event)">›</button>
            ` : ""}
            <img class="photo-lightbox-image"
                 src="${escapeHtml(photoUrl)}"
                 alt="Photo publication ${publicationLightboxIndex + 1}">
        </div>
    `;
}

function showPreviousPublicationPhoto(event) {
    event?.stopPropagation();

    if (!publicationLightboxPhotos.length) {
        return;
    }

    publicationLightboxIndex =
        (publicationLightboxIndex - 1 + publicationLightboxPhotos.length) % publicationLightboxPhotos.length;
    renderPublicationPhotoLightbox();
}

function showNextPublicationPhoto(event) {
    event?.stopPropagation();

    if (!publicationLightboxPhotos.length) {
        return;
    }

    publicationLightboxIndex = (publicationLightboxIndex + 1) % publicationLightboxPhotos.length;
    renderPublicationPhotoLightbox();
}

function closePublicationPhotoLightbox() {
    const overlay = document.getElementById("publicationPhotoLightbox");

    if (overlay) {
        overlay.classList.remove("show");
    }

    unbindPublicationPhotoLightboxKeys();
}

function bindPublicationPhotoLightboxKeys() {
    if (publicationLightboxKeyHandler) {
        return;
    }

    publicationLightboxKeyHandler = function (event) {
        const overlay = document.getElementById("publicationPhotoLightbox");

        if (!overlay?.classList.contains("show")) {
            return;
        }

        if (event.key === "Escape") {
            closePublicationPhotoLightbox();
        } else if (event.key === "ArrowLeft") {
            showPreviousPublicationPhoto(event);
        } else if (event.key === "ArrowRight") {
            showNextPublicationPhoto(event);
        }
    };

    document.addEventListener("keydown", publicationLightboxKeyHandler);
}

function unbindPublicationPhotoLightboxKeys() {
    if (!publicationLightboxKeyHandler) {
        return;
    }

    document.removeEventListener("keydown", publicationLightboxKeyHandler);
    publicationLightboxKeyHandler = null;
}

function buildRequestDetailPayload(request) {
    const ownerCountry = request.client?.country || "";

    return {
        id: request.id,
        type: "Demande",
        title: request.title,
        description: request.description,
        icon: request.category?.icon || "??",
        category: request.category?.name || "Catégorie",
        location: request.locationLabel || request.location || "Non précisée",
        latitude: parseCoordinate(request.latitude),
        longitude: parseCoordinate(request.longitude),
        distanceKm: getPublicationDistance(request),
        amount: formatMoney(request.budget, ownerCountry),
        author: request.client?.fullName || "Auteur inconnu",
        authorId: request.client?.id || null,
        authorPhotoUrl: request.client?.photoUrl || "",
        authorRole: request.client?.role || "CLIENT",
        user: request.client || null,
        publicationType: "REQUEST",
        status: request.status || "AVAILABLE",
        active: true,
        date: request.createdAt || "",
        photoUrls: normalizePublicationPhotos(request.photoUrls)
    };
}

function getCurrentUserLocationParam() {
    if (!hasCurrentUserResidenceLocation()) {
        return "";
    }

    return [
        currentUser.streetAddress,
        currentUser.city,
        currentUser.postalCode,
        currentUser.country
    ].filter(Boolean).join(" ");
}

function buildLocationQuery() {
    const location = getCurrentUserLocationParam();

    return location ? "?location=" + encodeURIComponent(location) : "";
}

const MAX_PUBLICATION_PHOTOS = 3;
const MAX_IMAGE_ORIGINAL_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const publicationPhotoState = {
    offer: [],
    request: []
};

function initializePublicationPhotos(type, photoUrls = []) {
    publicationPhotoState[type] = normalizePublicationPhotos(photoUrls).map(url => ({
        url,
        previewUrl: url,
        existing: true
    }));
    renderPublicationPhotoPreview(type);
}

function resolveAssetUrl(url) {
    if (!url) return "";
    return url.startsWith("http") || url.startsWith("data:") ? url : API_BASE + url;
}

function normalizePublicationPhotos(photoUrls) {
    return Array.isArray(photoUrls)
        ? photoUrls.filter(Boolean).slice(0, MAX_PUBLICATION_PHOTOS)
        : [];
}

async function handlePublicationPhotoInput(type, input) {
    if (!requireAuthOrResume("uploadPublicationPhotos", { type })) {
        input.value = "";
        return;
    }

    const files = Array.from(input.files || []);
    const currentPhotos = publicationPhotoState[type] || [];
    const remainingSlots = MAX_PUBLICATION_PHOTOS - currentPhotos.length;

    if (remainingSlots <= 0 || files.length > remainingSlots) {
        showToast("Maximum 3 photos par publication.");
    }

    for (const file of files.slice(0, Math.max(remainingSlots, 0))) {
        if (!validateSelectedImage(file)) continue;

        try {
            const compressedFile = await compressImageFile(file);
            const previewUrl = URL.createObjectURL(compressedFile);

            if ((publicationPhotoState[type] || []).length >= MAX_PUBLICATION_PHOTOS) {
                showToast("Maximum 3 photos par publication.");
                break;
            }

            publicationPhotoState[type].push({
                file: compressedFile,
                previewUrl,
                existing: false
            });
            renderPublicationPhotoPreview(type);
        } catch (error) {
            showToast("Upload image impossible.");
        }
    }

    input.value = "";
}

function removePublicationPhoto(type, index) {
    const photo = publicationPhotoState[type][index];
    if (photo?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(photo.previewUrl);
    }

    publicationPhotoState[type].splice(index, 1);
    renderPublicationPhotoPreview(type);
}

function getPublicationPhotoUrls(type) {
    return (publicationPhotoState[type] || [])
        .filter(photo => photo.existing)
        .map(photo => photo.url)
        .filter(Boolean)
        .slice(0, MAX_PUBLICATION_PHOTOS);
}

function getPublicationPhotoFiles(type) {
    return (publicationPhotoState[type] || [])
        .filter(photo => !photo.existing && photo.file)
        .map(photo => photo.file);
}

async function uploadPublicationPhotos(type, publicationId, targetType = type) {
    if (!requireAuthOrResume("uploadPublicationPhotos", {
        type,
        publicationId,
        targetType
    })) {
        return getPublicationPhotoUrls(type);
    }

    const files = getPublicationPhotoFiles(type);

    if (!files.length) {
        return getPublicationPhotoUrls(type);
    }

    const formData = new FormData();
    files.forEach(file => formData.append("images", file));

    const endpoint =
        targetType === "offer"
            ? `/api/offers/${publicationId}/photos`
            : `/api/requests/${publicationId}/photos`;

    const res = await fetch(API_BASE + endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData
    });

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || await res.text() || "Upload image impossible.");
    }

    const photoUrls = await res.json();
    initializePublicationPhotos(type, photoUrls);
    return photoUrls;
}

async function refreshAfterPublicationSave(type) {
    await loadDashboard();

    if (type === "offer") {
        await loadMyOffers();
    } else {
        await loadMyRequests();
    }
}

function validateSelectedImage(file) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        showToast("Type de fichier non autorisé.");
        return false;
    }

    if (file.size > MAX_IMAGE_ORIGINAL_SIZE) {
        showToast("Image trop volumineuse.");
        return false;
    }

    return true;
}

function compressImageFile(file) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const sourceUrl = URL.createObjectURL(file);

        image.onload = function () {
            const scale = Math.min(1, 1200 / image.width, 1200 / image.height);
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(image.width * scale);
            canvas.height = Math.round(image.height * scale);

            const context = canvas.getContext("2d");
            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            const outputType = file.type === "image/png" ? "image/png" : (file.type === "image/webp" ? "image/webp" : "image/jpeg");
            canvas.toBlob(blob => {
                URL.revokeObjectURL(sourceUrl);

                if (!blob) {
                    reject(new Error("Compression image impossible."));
                    return;
                }

                const extension = outputType === "image/webp" ? "webp" : (outputType === "image/png" ? "png" : "jpg");
                resolve(new File([blob], "publication-photo." + extension, { type: outputType }));
            }, outputType, 0.8);
        };

        image.onerror = function () {
            URL.revokeObjectURL(sourceUrl);
            reject(new Error("Image invalide."));
        };

        image.src = sourceUrl;
    });
}

function renderPublicationPhotoPreview(type) {
    const photos = publicationPhotoState[type] || [];
    const preview = document.getElementById(type + "PhotoPreview");
    const count = document.getElementById(type + "PhotoCount");

    if (count) {
        count.textContent = photos.length + "/" + MAX_PUBLICATION_PHOTOS + " photos";
    }

    if (!preview) {
        return;
    }

    preview.innerHTML = photos.map((photo, index) => `
        <div class="publication-photo-item">
            <img src="${escapeHtml(resolveAssetUrl(photo.previewUrl))}" alt="Photo publication ${index + 1}">
            <button type="button"
                    class="publication-photo-remove"
                    aria-label="Retirer la photo"
                    onclick="removePublicationPhoto('${type}', ${index})">
                ×
            </button>
        </div>
    `).join("");
}

function renderPublicationDetailPhotos(photoUrls) {
    const photos = normalizePublicationPhotos(photoUrls);

    if (!photos.length) {
        return "";
    }

    const encodedPhotos = encodeURIComponent(JSON.stringify(photos)).replace(/'/g, "%27");

    return `
        <div class="publication-gallery">
            ${photos.map((url, index) => `
                <button type="button"
                        class="publication-gallery-photo"
                        onclick="openPublicationPhotoList(event, '${encodedPhotos}', ${index})">
                    <img src="${escapeHtml(resolveAssetUrl(url))}" alt="Photo publication ${index + 1}">
                </button>
            `).join("")}
        </div>
    `;
}

function renderPublicationCardPhotos(photoUrls, publicationPayload = null) {
    const photos = normalizePublicationPhotos(photoUrls);

    if (!photos.length) {
        return "";
    }

    const albumClass =
        photos.length === 1
            ? "one-photo"
            : photos.length === 2
                ? "two-photos"
                : "three-photos";
    const encodedPayload = publicationPayload ? encodePublicationPayload(publicationPayload) : "";

    return `
        <div class="publication-photo-album ${albumClass}">
            ${photos.map((url, index) => `
                <button type="button"
                        class="publication-photo-item"
                        onclick="${encodedPayload
                            ? `openPublicationPhotoFromPayload(event, '${encodedPayload}', ${index})`
                            : `event.stopPropagation(); window.open('${escapeJs(resolveAssetUrl(url))}', '_blank', 'noopener')`}">
                    <img src="${escapeHtml(resolveAssetUrl(url))}" alt="Photo publication ${index + 1}">
                </button>
            `).join("")}
        </div>
    `;
}

function renderPublicationOwner(publication) {
    const name = escapeHtml(publication?.author || "Auteur inconnu");
    const photoUrl = resolveAssetUrl(publication?.authorPhotoUrl || "");

    if (!photoUrl) {
        return `<span>${name}</span>`;
    }

    return `
        <span class="publication-owner">
            <img src="${escapeHtml(photoUrl)}" alt="${name}">
            <span>${name}</span>
        </span>
    `;
}

function renderPublicationSearch(scope, options = {}) {
    currentPublicationView = scope;
    const showTypeFilter = options.showTypeFilter === true;
    const categoryOptions = dashboardCategories.map(category => `
        <option value="${category.id}" ${String(publicationSearchState.categoryId) === String(category.id) ? "selected" : ""}>
            ${(category.icon ? category.icon + " " : "") + category.name}
        </option>
    `).join("");

    return `
        <div class="publication-search">
            <div class="publication-search-rows">
                <div class="publication-search-row">
                    <select id="publicationSearchCategory"
                            onchange="handlePublicationSearchInput('categoryId', this.value)">
                        <option value="">Toutes les catégories</option>
                        ${categoryOptions}
                    </select>
                    <input id="publicationSearchLocation"
                           type="search"
                           placeholder="Ville ou localisation"
                           value="${escapeHtml(publicationSearchState.location)}"
                           oninput="handlePublicationSearchInput('location', this.value)">
                    <label class="publication-sort-field" for="publicationSearchRadius">
                        <span>Rayon de recherche</span>
                        <select id="publicationSearchRadius"
                                onchange="handlePublicationSearchInput('radius', this.value)">
                            <option value="all" ${publicationSearchState.radius === "all" ? "selected" : ""}>Tous les rayons</option>
                            <option value="5" ${publicationSearchState.radius === "5" ? "selected" : ""}>5 km</option>
                            <option value="10" ${publicationSearchState.radius === "10" ? "selected" : ""}>10 km</option>
                            <option value="25" ${publicationSearchState.radius === "25" ? "selected" : ""}>25 km</option>
                            <option value="50" ${publicationSearchState.radius === "50" ? "selected" : ""}>50 km</option>
                            <option value="100" ${publicationSearchState.radius === "100" ? "selected" : ""}>100 km</option>
                        </select>
                    </label>
                </div>
                <div class="publication-search-row">
                    <input id="publicationSearchMin"
                           type="number"
                           min="0"
                           placeholder="Montant min."
                           value="${escapeHtml(publicationSearchState.minAmount)}"
                           oninput="handlePublicationSearchInput('minAmount', this.value)">
                    <input id="publicationSearchMax"
                           type="number"
                           min="0"
                           placeholder="Montant max."
                           value="${escapeHtml(publicationSearchState.maxAmount)}"
                           oninput="handlePublicationSearchInput('maxAmount', this.value)">
                    <select id="publicationSearchStatus"
                            onchange="handlePublicationSearchInput('status', this.value)">
                        <option value="all" ${publicationSearchState.status === "all" ? "selected" : ""}>Tous les statuts</option>
                        <option value="AVAILABLE" ${publicationSearchState.status === "AVAILABLE" ? "selected" : ""}>Disponible</option>
                        <option value="IN_PROGRESS" ${publicationSearchState.status === "IN_PROGRESS" ? "selected" : ""}>En cours</option>
                        <option value="COMPLETED" ${publicationSearchState.status === "COMPLETED" ? "selected" : ""}>Terminée</option>
                        <option value="SUSPENDED" ${publicationSearchState.status === "SUSPENDED" ? "selected" : ""}>Suspendue</option>
                        <option value="EXPIRED" ${publicationSearchState.status === "EXPIRED" ? "selected" : ""}>Expirée</option>
                    </select>
                </div>
                <div class="publication-search-row publication-search-row-actions">
                    ${showTypeFilter ? `
                        <select id="publicationSearchType"
                                onchange="handlePublicationSearchInput('type', this.value)">
                            <option value="all" ${publicationSearchState.type === "all" ? "selected" : ""}>Toutes les publications</option>
                            <option value="offer" ${publicationSearchState.type === "offer" ? "selected" : ""}>Offres</option>
                            <option value="request" ${publicationSearchState.type === "request" ? "selected" : ""}>Demandes</option>
                        </select>
                    ` : `<span class="publication-search-placeholder" aria-hidden="true"></span>`}
                    <label class="publication-sort-field" for="publicationSearchSort">
                        <span>Trier par</span>
                        <select id="publicationSearchSort"
                                onchange="handlePublicationSearchInput('sort', this.value)">
                            <option value="recent" ${publicationSearchState.sort === "recent" ? "selected" : ""}>Plus récent</option>
                            <option value="rating" ${publicationSearchState.sort === "rating" ? "selected" : ""}>Mieux noté</option>
                            <option value="nearby" ${publicationSearchState.sort === "nearby" ? "selected" : ""}>Plus proche</option>
                            <option value="active" ${publicationSearchState.sort === "active" ? "selected" : ""}>Le plus actif</option>
                            <option value="price-asc" ${publicationSearchState.sort === "price-asc" ? "selected" : ""}>Prix croissant</option>
                            <option value="price-desc" ${publicationSearchState.sort === "price-desc" ? "selected" : ""}>Prix décroissant</option>
                        </select>
                    </label>
                    <button type="button" class="service-btn service-btn-outline" onclick="resetPublicationSearch()">
                        Réinitialiser
                    </button>
                </div>
            </div>
            <div class="publication-search-map-action">
                <button type="button" class="service-btn service-btn-outline" onclick="togglePublicationMap()">
                    Carte
                </button>
            </div>
        </div>
    `;
}

function handlePublicationSearchInput(key, value) {
    publicationSearchState[key] = value;
    clearTimeout(publicationSearchState.reloadTimer);
    publicationSearchState.reloadTimer = setTimeout(reloadCurrentPublicationView, 180);
}

function resetPublicationSearch() {
    publicationSearchState = {
        keyword: "",
        categoryId: "",
        location: "",
        minAmount: "",
        maxAmount: "",
        radius: "all",
        sort: "recent",
        status: "all",
        type: "all",
        mapVisible: publicationSearchState.mapVisible
    };
    reloadCurrentPublicationView();
}

function reloadCurrentPublicationView() {
    if (currentPublicationView === "offers") return loadAvailableOffers();
    if (currentPublicationView === "requests") return loadAvailableRequests();
    if (currentPublicationView === "my-offers") return loadMyOffers();
    if (currentPublicationView === "my-requests") return loadMyRequests();
    if (currentPublicationView === "favorites") return loadMyFavorites();
    return loadHomeFeed();
}

function filterPublications(items, type) {
    const keyword = normalizeText(publicationSearchState.keyword);
    const categoryId = String(publicationSearchState.categoryId || "");
    const location = normalizeText(publicationSearchState.location);
    const minAmount = publicationSearchState.minAmount === "" ? null : Number(publicationSearchState.minAmount);
    const maxAmount = publicationSearchState.maxAmount === "" ? null : Number(publicationSearchState.maxAmount);
    const radius = publicationSearchState.radius === "all" ? null : Number(publicationSearchState.radius);
    const status = publicationSearchState.status || "all";
    const selectedType = normalizePublicationFilterType(publicationSearchState.type);

    const filtered = (items || [])
        .filter(item => {
        if (selectedType && selectedType !== type) {
            return false;
        }

        const amount = type === "offer" ? Number(item.price) : Number(item.budget);
        const searchable = normalizeText([
            item.title,
            item.description,
            item.location,
            item.category?.name,
            type === "offer" ? item.provider?.fullName : item.client?.fullName
        ].filter(Boolean).join(" "));

        if (keyword && !searchable.includes(keyword)) return false;
        if (categoryId && String(item.category?.id || "") !== categoryId) return false;
        if (location && !normalizeText(item.location).includes(location)) return false;
        if (minAmount !== null && Number.isFinite(amount) && amount < minAmount) return false;
        if (maxAmount !== null && Number.isFinite(amount) && amount > maxAmount) return false;
        if (status !== "all" && normalizePublicationStatus(item.status, item.active).value !== status) return false;
        if (radius !== null && Number.isFinite(getPublicationDistance(item)) && getPublicationDistance(item) > radius) return false;

        return true;
    });

    return sortPublications(filtered, type);
}

function normalizePublicationFilterType(type) {
    const normalized = String(type || "all").trim().toLowerCase();

    if (["offer", "offers", "offre", "offres"].includes(normalized)) {
        return "offer";
    }

    if (["request", "requests", "demande", "demandes"].includes(normalized)) {
        return "request";
    }

    return "";
}

function sortPublications(items, type) {
    const sort = publicationSearchState.sort || "recent";
    const withIndex = (items || []).map((item, index) => ({ item, index }));

    withIndex.sort((left, right) => {
        const result = comparePublications(left.item, right.item, type, sort);
        return result || left.index - right.index;
    });

    return withIndex.map(entry => entry.item);
}

function comparePublications(a, b, type, sort) {
    if (sort === "rating") {
        return getPublicationRating(b, type) - getPublicationRating(a, type);
    }

    if (sort === "nearby") {
        return comparePublicationDistance(a, b, type);
    }

    if (sort === "active") {
        return getPublicationActivity(b, type) - getPublicationActivity(a, type);
    }

    if (sort === "price-asc") {
        return comparePublicationAmount(a, b, type, "asc");
    }

    if (sort === "price-desc") {
        return comparePublicationAmount(a, b, type, "desc");
    }

    return getPublicationDate(b) - getPublicationDate(a);
}

function getPublicationOwner(item, type) {
    return type === "offer" ? item?.provider : item?.client;
}

function getPublicationDate(item) {
    const timestamp = Date.parse(item?.createdAt || item?.date || item?.updatedAt || "");
    return Number.isFinite(timestamp) ? timestamp : 0;
}

function getPublicationAmount(item, type) {
    const amount = Number(type === "offer" ? item?.price : item?.budget);
    return Number.isFinite(amount) ? amount : Number.NaN;
}

function comparePublicationAmount(a, b, type, direction) {
    const amountA = getPublicationAmount(a, type);
    const amountB = getPublicationAmount(b, type);
    const hasAmountA = Number.isFinite(amountA);
    const hasAmountB = Number.isFinite(amountB);

    if (hasAmountA && hasAmountB) {
        return direction === "asc" ? amountA - amountB : amountB - amountA;
    }

    if (hasAmountA !== hasAmountB) {
        return hasAmountA ? -1 : 1;
    }

    return 0;
}

function getPublicationRating(item, type) {
    const owner = getPublicationOwner(item, type);
    const ratingCount = Number(owner?.ratingCount || owner?.reviewCount || owner?.reviewsCount || 0);
    const rating = Number(owner?.ratingAverage ?? owner?.averageRating ?? owner?.rating);

    if (!ratingCount || !Number.isFinite(rating)) {
        return 3;
    }

    return rating;
}

function getPublicationActivity(item, type) {
    const owner = getPublicationOwner(item, type);
    const values = [
        owner?.activityCount,
        owner?.completedServices,
        owner?.publicationCount,
        owner?.publicationsCount,
        owner?.offersCount,
        owner?.requestsCount,
        item?.activityCount,
        item?.publicationCount
    ].map(Number).filter(Number.isFinite);

    return values.length ? Math.max(...values) : 0;
}

function comparePublicationDistance(a, b, type) {
    const distanceA = getPublicationDistance(a);
    const distanceB = getPublicationDistance(b);

    if (Number.isFinite(distanceA) && Number.isFinite(distanceB) && distanceA !== distanceB) {
        return distanceA - distanceB;
    }

    if (Number.isFinite(distanceA) !== Number.isFinite(distanceB)) {
        return Number.isFinite(distanceA) ? -1 : 1;
    }

    const localA = isPublicationLocalMatch(a, type) ? 1 : 0;
    const localB = isPublicationLocalMatch(b, type) ? 1 : 0;

    return localB - localA;
}

function getPublicationDistance(item) {
    const userPoint = getCurrentUserPoint();
    const publicationPoint = getPublicationPoint(item);

    if (userPoint && publicationPoint) {
        return haversineDistanceKm(userPoint.latitude, userPoint.longitude, publicationPoint.latitude, publicationPoint.longitude);
    }

    if (item?.distanceMeters !== undefined && item?.distanceMeters !== null) {
        const meters = Number(item.distanceMeters);
        return Number.isFinite(meters) ? meters / 1000 : Number.NaN;
    }

    const distance = Number(item?.distanceKm ?? item?.distanceInKm ?? item?.distance);

    return Number.isFinite(distance) ? distance : Number.NaN;
}

function getCurrentUserPoint() {
    const latitude = parseCoordinate(currentUser?.latitude);
    const longitude = parseCoordinate(currentUser?.longitude);

    return Number.isFinite(latitude) && Number.isFinite(longitude)
        ? { latitude, longitude }
        : null;
}

function getPublicationPoint(item) {
    const latitude = parseCoordinate(item?.latitude);
    const longitude = parseCoordinate(item?.longitude);

    return Number.isFinite(latitude) && Number.isFinite(longitude)
        ? { latitude, longitude }
        : null;
}

function parseCoordinate(value) {
    const coordinate = Number(value);
    return Number.isFinite(coordinate) ? coordinate : Number.NaN;
}

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
    const toRadians = degrees => degrees * Math.PI / 180;
    const earthRadiusKm = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function renderDistanceBadge(item) {
    const distance = getPublicationDistance(item);

    if (!Number.isFinite(distance)) {
        return "";
    }

    return `<span class="service-chip distance-badge">À ${formatDistanceKm(distance)}</span>`;
}

function formatDistanceKm(distance) {
    return distance.toLocaleString("fr-FR", {
        maximumFractionDigits: distance < 10 ? 1 : 0
    }) + " km";
}

function getPublicationLocationPayload(locationLabel) {
    return {
        locationLabel: locationLabel || "",
        latitude: parseCoordinate(currentUser?.latitude),
        longitude: parseCoordinate(currentUser?.longitude)
    };
}

let publicationMapInstance = null;

function togglePublicationMap() {
    publicationSearchState.mapVisible = !publicationSearchState.mapVisible;
    reloadCurrentPublicationView();
}

function renderPublicationMap(publications) {
    if (!publicationSearchState.mapVisible) {
        return "";
    }

    const mappedPublications = (publications || []).filter(item => getPublicationPoint(item));

    setTimeout(() => initializePublicationMap(mappedPublications), 0);

    return `
        <section class="publication-map-panel">
            <div class="publication-map-header">
                <strong>Carte</strong>
                <span>${mappedPublications.length} publication${mappedPublications.length > 1 ? "s" : ""} à proximité</span>
            </div>
            <div id="publicationMap" class="publication-map"></div>
        </section>
    `;
}

function renderPublicationMapAction(publication) {
    if (!getPublicationPoint(publication)) {
        return "";
    }

    return `
        <button type="button"
                class="service-btn service-btn-outline"
                onclick="event.stopPropagation(); showPublicationMapFromDetail()">
            Voir sur la carte
        </button>
    `;
}

function showPublicationMapFromDetail() {
    publicationSearchState.mapVisible = true;
    closePublicationDetail();
    reloadCurrentPublicationView();
}

function initializePublicationMap(publications) {
    const mapElement = document.getElementById("publicationMap");

    if (!mapElement || typeof L === "undefined") {
        return;
    }

    if (publicationMapInstance) {
        publicationMapInstance.remove();
    }

    const userPoint = getCurrentUserPoint();
    const firstPoint = publications.length ? getPublicationPoint(publications[0]) : userPoint;
    const center = firstPoint ? [firstPoint.latitude, firstPoint.longitude] : [45.5017, -73.5673];

    publicationMapInstance = L.map(mapElement).setView(center, 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
    }).addTo(publicationMapInstance);

    const bounds = [];

    if (userPoint) {
        L.marker([userPoint.latitude, userPoint.longitude])
            .addTo(publicationMapInstance)
            .bindPopup("Votre position");
        bounds.push([userPoint.latitude, userPoint.longitude]);
    }

    publications.forEach(publication => {
        const point = getPublicationPoint(publication);
        if (!point) return;

        L.marker([point.latitude, point.longitude])
            .addTo(publicationMapInstance)
            .bindPopup(`<strong>${escapeHtml(publication.title || "Publication")}</strong><br>${escapeHtml(publication.mapType || publication.type || "")}`);
        bounds.push([point.latitude, point.longitude]);
    });

    if (bounds.length > 1) {
        publicationMapInstance.fitBounds(bounds, { padding: [24, 24] });
    }
}

function isPublicationLocalMatch(item, type) {
    const currentLocation = normalizeText(getCurrentUserLocationParam());
    const currentParts = [
        currentUser?.city,
        currentUser?.location,
        currentUser?.streetAddress,
        currentUser?.postalCode,
        currentUser?.country,
        currentLocation
    ].map(normalizeText).filter(Boolean);
    const owner = getPublicationOwner(item, type);
    const publicationLocation = normalizeText([
        item?.location,
        owner?.city,
        owner?.location,
        owner?.streetAddress,
        owner?.postalCode,
        owner?.country
    ].filter(Boolean).join(" "));

    if (!currentLocation || !publicationLocation) {
        return false;
    }

    return currentParts.some(part => publicationLocation.includes(part) || part.includes(publicationLocation));
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeJs(value) {
    return String(value || "")
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'")
        .replaceAll("\n", " ")
        .replaceAll("\r", " ");
}

function formatProviderRating(provider) {
    const count = Number(provider?.ratingCount || 0);

    if (count === 0) {
        return "Nouveau prestataire";
    }

    const average = Number(provider?.ratingAverage ?? provider?.rating ?? 0);
    const reviewLabel = count > 1 ? "avis" : "avis";

    return average.toFixed(1) + "/5, " + count + " " + reviewLabel;
}

function renderVerifiedProfileBadge(user) {
    if (!user || !user.verifiedProfile) {
        return `<span class="verified-profile-badge verified-profile-badge-muted">Profil non vérifié</span>`;
    }

    const label = user.fullyVerifiedProfile ? "Profil vérifié complet" : "Profil vérifié";
    return `<span class="verified-profile-badge">? ${label}</span>`;
}

function renderEmailVerificationStatus(user) {
    const verified = Boolean(user?.emailVerified);
    return `
        <span class="verification-status ${verified ? "verification-status-ok" : "verification-status-pending"}">
            ${verified ? "? Email vérifié" : "Email non vérifié"}
        </span>
    `;
}

function renderPhoneVerificationStatus(user) {
    const verified = Boolean(user?.phoneVerified);
    return `
        <span class="verification-status ${verified ? "verification-status-ok" : "verification-status-pending"}">
            ${verified ? "? Téléphone vérifié" : "Téléphone non vérifié"}
        </span>
    `;
}

function renderVerificationBadges(user) {
    if (!user) return "";

    const badges = [];

    if (user.verifiedProfile) {
        badges.push(renderVerifiedProfileBadge(user));
    }

    if (user.emailVerified) {
        badges.push(renderEmailVerificationStatus(user));
    }

    if (user.phoneVerified) {
        badges.push(renderPhoneVerificationStatus(user));
    }

    return badges.length
        ? `<div class="trust-verification-badges">${badges.join("")}</div>`
        : "";
}

function renderProviderTrust(provider, publicationLocation = "") {
    if (!provider) {
        return "";
    }

    const badges = [];
    const statusLabel = provider.accountStatusLabel || "";
    const isRestricted =
        statusLabel === "Compte gelé temporairement" ||
        statusLabel === "Compte suspendu temporairement";

    if (provider.newProvider || Number(provider.ratingCount || 0) === 0) {
        badges.push(`<span class="trust-badge trust-badge-new">Nouveau prestataire</span>`);
    }

    if (provider.verifiedProfile) {
        badges.push(`<span class="trust-badge trust-badge-verified">? Profil vérifié</span>`);
    }

    if (isSameLocality(provider, publicationLocation)) {
        badges.push(`<span class="trust-badge trust-badge-local">Prioritaire dans votre zone</span>`);
    }

    if (isRestricted) {
        badges.push(`<span class="trust-badge trust-badge-warning">${statusLabel}</span>`);
    }

    const emptyReview =
        Number(provider.ratingCount || 0) === 0
            ? `<div class="trust-empty">Aucun commentaire pour ce prestataire actuellement</div>`
            : "";

    return `
        <div class="provider-trust">
            <div class="trust-rating">
                <span>Note : ${formatProviderRating(provider)}</span>
                <span>${provider.completedServices || 0} services terminés</span>
            </div>
            ${renderVerificationBadges(provider)}
            <div class="trust-badges">${badges.join("")}</div>
            ${emptyReview}
        </div>
    `;
}

function renderProviderReviews(reviews, emptyMessage = "Aucun commentaire pour cet utilisateur actuellement") {
    if (!reviews || reviews.length === 0) {
        return `
            <div class="review-list-empty">
                ${emptyMessage}
            </div>
        `;
    }

    return `
        <div class="review-list">
            ${reviews.map(review => `
                <div class="review-item">
                    <strong>${review.rating}/5</strong>
                    <span>${review.comment || "Aucun commentaire ajouté."}</span>
                    <small>${review.clientName || "Client"} · ${review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}</small>
                </div>
            `).join("")}
        </div>
    `;
}

function renderUserTrust(user) {
    if (!user) {
        return "";
    }

    const ratingCount = Number(user.ratingCount || 0);
    const ratingAverage = Number(user.ratingAverage ?? user.rating ?? 0);
    const ratingLabel = ratingCount > 0
        ? ratingAverage.toFixed(1) + "/5, " + ratingCount + " avis"
        : "Aucune note disponible";

    return `
        <div class="provider-trust">
            <div class="trust-rating">
                <span>Note : ${ratingLabel}</span>
            </div>
            ${renderVerificationBadges(user)}
        </div>
    `;
}

function isSameLocality(provider, publicationLocation = "") {
    const currentLocation = getCurrentUserLocationParam();
    const target = normalizeText(publicationLocation || currentLocation);
    const providerLocality = normalizeText([
        provider.streetAddress,
        provider.postalCode,
        provider.country
    ].filter(Boolean).join(" "));

    const providerCountry = normalizeText(provider.country);

    return Boolean(
        target &&
        providerLocality &&
        (providerLocality.includes(target) ||
            (providerCountry && target.includes(providerCountry)) ||
            (providerCountry && normalizeText(publicationLocation).includes(providerCountry)))
    );
}

function isRequestSameLocality(request) {
    const currentLocation = normalizeText(getCurrentUserLocationParam());
    const requestLocation = normalizeText([
        request?.location,
        request?.client?.streetAddress,
        request?.client?.postalCode,
        request?.client?.country
    ].filter(Boolean).join(" "));

    const requestCountry = normalizeText(request?.client?.country);

    return Boolean(
        currentLocation &&
        requestLocation &&
        (requestLocation.includes(currentLocation) ||
            (requestCountry && currentLocation.includes(requestCountry)))
    );
}

function normalizeText(value) {
    return (value || "").toLowerCase().trim();
}

function discoverServices() {

    addEvent(
        "Découverte des services PrestaLink"
    );

    updateDynamicView(
        "Services disponibles",
        [

            `
            <strong>?? Plomberie</strong><br>
            Réparation, fuite, installation sanitaire
            `,

            `
            <strong>? Électricité</strong><br>
            Dépannage, installation électrique, maintenance
            `,

            `
            <strong>?? Entretien ménager</strong><br>
            Nettoyage résidentiel et commercial
            `,

            `
            <strong>?? Transport</strong><br>
            Livraison et déménagement
            `,

            `
            <strong>??? Réparation générale</strong><br>
            Maintenance et interventions diverses
            `
        ]
    );
}

function showToast(message, duration = 3000) {
    if (typeof duration !== "number") {
        duration = 3000;
    }

    const toast =
        document.getElementById("toastMessage");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toast.hideTimeout);

    toast.hideTimeout = setTimeout(function () {

        toast.classList.remove("show");

    }, duration);
}

function getValidPublicationId(publicationId) {
    const id = Number(publicationId);

    if (!Number.isInteger(id) || id <= 0) {
        showToast("Identifiant de publication invalide");
        addEvent("Identifiant de publication invalide");
        console.error("Identifiant de publication invalide :", publicationId);
        return null;
    }

    return id;
}

function removePublicationCard(button) {
    if (!button) return;

    const card = button.closest(".service-card");

    if (card) {
        card.remove();
    }
}

async function deletePublication(publicationType, publicationId, button) {
    const id = getValidPublicationId(publicationId);

    if (!id) {
        return;
    }

    const normalizedType = String(publicationType || "").toLowerCase();

    if (!requireAuthOrResume(normalizedType === "request" ? "deleteRequest" : "deleteOffer", {
        publicationType,
        publicationId: id
    })) {
        return;
    }

    let endpoint;
    let confirmMessage;
    let successMessage;
    let failureMessage;

    if (publicationType === "offer") {
        endpoint = API_BASE + "/api/offers/" + id;
        confirmMessage = "Confirmer la suppression de cette offre ?";
        successMessage = "Offre supprimée avec succès";
        failureMessage = "Impossible de supprimer l’offre";
    } else if (publicationType === "request") {
        endpoint = API_BASE + "/api/requests/" + id;
        confirmMessage = "Confirmer la suppression de cette demande ?";
        successMessage = "Demande supprimée avec succès";
        failureMessage = "Impossible de supprimer la demande";
    } else {
        showToast("Type de publication inconnu");
        addEvent("Type de publication inconnu");
        console.error("Type de publication inconnu :", publicationType);
        return;
    }

    if (!confirm(confirmMessage)) {
        return;
    }

    try {
        const res = await fetch(endpoint, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            const errorText = await res.text();

            showToast(failureMessage);
            addEvent(failureMessage);
            console.error(failureMessage, {
                id,
                endpoint,
                status: res.status,
                response: errorText
            });

            return;
        }

        removePublicationCard(button);
        closePublicationDetail();
        closeCreateOfferModal();
        closeCreateRequestModal();

        addEvent(successMessage);
        showToast(successMessage);
        favoritePublicationKeys.delete(favoriteKey(publicationType.toUpperCase(), id));
        updateFavoriteBadge();

        await loadDashboard();

        if (publicationType === "offer") {
            await loadMyOffers();
        } else {
            await loadMyRequests();
        }
    } catch (error) {
        showToast(failureMessage);
        addEvent(failureMessage);
        console.error(failureMessage, {
            id,
            endpoint,
            error
        });
    }
}

async function deleteOffer(offerId, button) {
    return deletePublication("offer", offerId, button);
}

async function deleteRequest(requestId, button) {
    return deletePublication("request", requestId, button);
}

function favoriteKey(publicationType, publicationId) {
    return String(publicationType).toUpperCase() + ":" + String(publicationId);
}

function normalizeFavoriteType(publicationType) {
    const value = String(publicationType || "").trim().toUpperCase();

    if (value === "OFFER" || value === "OFFRE") {
        return "OFFER";
    }

    if (value === "REQUEST" || value === "DEMANDE") {
        return "REQUEST";
    }

    return "";
}

function normalizeFavoriteId(publicationId) {
    const id = Number(publicationId);

    return Number.isInteger(id) && id > 0 ? id : null;
}

function isFavorite(publicationType, publicationId) {
    const type = normalizeFavoriteType(publicationType);
    const id = normalizeFavoriteId(publicationId);

    return Boolean(type && id && favoritePublicationKeys.has(favoriteKey(type, id)));
}

function isPublicationDetailOpen() {
    return Boolean(document.getElementById("publicationDetailModal")?.classList.contains("show"));
}

function isDetailFavoriteButton(button) {
    return Boolean(button?.closest?.("#publicationDetailModal"));
}

function isSelectedFavoritePublication(publicationType, publicationId) {
    if (!selectedPublication) {
        return false;
    }

    return normalizeFavoriteType(selectedPublication.publicationType || selectedPublication.type) === publicationType
        && String(selectedPublication.id) === String(publicationId);
}

function closePublicationDetailAfterFavoriteAdd() {
    if (typeof closePublicationDetail === "function") {
        closePublicationDetail();
    }

    document.getElementById("publicationDetailModal")?.classList.remove("show");
}

async function loadFavoriteState() {
    favoritePublicationKeys = new Set();

    if (!isLoggedIn) {
        updateFavoriteBadge(0);
        return [];
    }

    try {
        const res = await fetch(API_BASE + "/api/favorites/me", {
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            throw new Error("Chargement des favoris indisponible");
        }

        const favorites = await res.json();

        (favorites || [])
            .filter(favorite => favorite.available !== false)
            .forEach(favorite => {
                favoritePublicationKeys.add(favoriteKey(favorite.publicationType, favorite.publicationId));
            });

        updateFavoriteBadge(favoritePublicationKeys.size);
        return favorites || [];
    } catch (error) {
        console.error(error);
        updateFavoriteBadge(0);
        return [];
    }
}

function updateFavoriteBadge(count = favoritePublicationKeys.size) {
    const badge = document.getElementById("myFavoritesBadge");

    if (badge) {
        badge.textContent = count;
    }
}

function renderFavoriteButton(publicationType, publicationId, options = {}) {
    const type = normalizeFavoriteType(publicationType);
    const id = normalizeFavoriteId(publicationId);
    const active = isFavorite(type, id);
    const compact = options.compact === true ? " favorite-btn-compact" : "";
    const label = active ? "Retirer des favoris" : "Ajouter aux favoris";

    if (!type || !id) {
        return "";
    }

    return `
        <button type="button"
                class="favorite-btn${active ? " is-favorite" : ""}${compact}"
                title="${label}"
                aria-label="${label}"
                onclick="event.stopPropagation(); toggleFavorite('${type}', ${id}, this)">
            <span class="favorite-icon" aria-hidden="true">${active ? "&#9829;" : "&#9825;"}</span>
            <span class="favorite-label">${label}</span>
        </button>
    `;
}

async function toggleFavorite(publicationType, publicationId, button) {
    if (!requireAuthOrResume("toggleFavorite", {
        publicationType,
        publicationId
    })) {
        return;
    }

    if (button?.dataset.favoriteBusy === "true") {
        return;
    }

    const type = normalizeFavoriteType(publicationType);
    const id = normalizeFavoriteId(publicationId);

    if (!type || !id) {
        showToast("Publication invalide");
        return;
    }

    const shouldCloseDetailAfterAdd =
        isDetailFavoriteButton(button) || isSelectedFavoritePublication(type, id);
    const wasFavorite = isFavorite(type, id);
    let updated = false;

    if (button) {
        button.dataset.favoriteBusy = "true";
        button.disabled = true;
    }

    try {
        updated = wasFavorite
            ? await removeFavorite(type, id)
            : await addFavorite(type, id);
    } finally {
        if (button?.isConnected) {
            button.dataset.favoriteBusy = "false";
            button.disabled = false;
        }
    }

    if (!updated) {
        return;
    }

    refreshFavoriteButtons(type, id);

    if (isSelectedFavoritePublication(type, id)) {
        updateDetailFavoriteAction(selectedPublication);
    }

    if (!wasFavorite && shouldCloseDetailAfterAdd) {
        closePublicationDetailAfterFavoriteAdd();
    }

    if (currentPublicationView === "favorites") {
        await loadMyFavorites();
    }
}

async function addFavorite(publicationType, publicationId) {
    const type = normalizeFavoriteType(publicationType);
    const id = normalizeFavoriteId(publicationId);

    if (!type || !id) {
        showToast("Publication invalide");
        return false;
    }

    if (isFavorite(type, id)) {
        showToast("Cette publication est déjà dans vos favoris.");
        return true;
    }

    try {
        const res = await fetch(API_BASE + "/api/favorites", {
            method: "POST",
            headers: getAuthHeaders({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify({
                publicationType: type,
                publicationId: id
            })
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToast(data.error || "Impossible d’ajouter cette publication aux favoris.");
            return false;
        }

        const favorite = await res.json().catch(() => ({}));
        const savedType = normalizeFavoriteType(favorite.publicationType) || type;
        const savedId = normalizeFavoriteId(favorite.publicationId) || id;

        favoritePublicationKeys.add(favoriteKey(savedType, savedId));
        updateFavoriteBadge();
        showToast("Publication ajoutée aux favoris");
        return true;
    } catch (error) {
        console.error(error);
        showToast("Impossible d’ajouter cette publication aux favoris.");
        return false;
    }
}

async function removeFavorite(publicationType, publicationId) {
    const type = normalizeFavoriteType(publicationType);
    const id = normalizeFavoriteId(publicationId);

    if (!type || !id) {
        showToast("Publication invalide");
        return false;
    }

    try {
        const res = await fetch(API_BASE + "/api/favorites/" + type + "/" + id, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToast(data.error || "Impossible de retirer cette publication des favoris.");
            return false;
        }

        favoritePublicationKeys.delete(favoriteKey(type, id));
        updateFavoriteBadge();
        showToast("Publication retirée des favoris");
        return true;
    } catch (error) {
        console.error(error);
        showToast("Impossible de retirer cette publication des favoris.");
        return false;
    }
}

function refreshFavoriteButtons(publicationType, publicationId) {
    const type = normalizeFavoriteType(publicationType);
    const id = normalizeFavoriteId(publicationId);

    if (!type || !id) return;

    document
        .querySelectorAll(`[data-favorite-type="${type}"][data-favorite-id="${id}"]`)
        .forEach(container => {
            container.innerHTML = renderFavoriteButton(type, id, {
                compact: container.dataset.favoriteCompact === "true"
            });
        });
}

function renderFavoriteButtonSlot(publicationType, publicationId, options = {}) {
    const type = normalizeFavoriteType(publicationType);
    const id = normalizeFavoriteId(publicationId);

    if (!type || !id) {
        return "";
    }

    return `
        <span data-favorite-type="${type}"
              data-favorite-id="${id}"
              data-favorite-compact="${options.compact === true}">
            ${renderFavoriteButton(type, id, options)}
        </span>
    `;
}

function updateDetailFavoriteAction(pub) {
    const container = document.getElementById("detailFavoriteAction");

    if (!container || !pub) return;

    container.innerHTML = renderFavoriteButtonSlot(pub.publicationType || pub.type, pub.id);
}

async function loadMyFavorites() {
    if (!isLoggedIn) {
        requireAuthOrResume("favorites");
        return;
    }

    currentPublicationView = "favorites";
    const favorites = await loadFavoriteState();

    const items = favorites.map(favorite => {
        if (favorite.available === false) {
            return `
                <div class="service-card favorite-unavailable-card">
                    <div class="service-title">Cette publication n’est plus disponible.</div>
                    <div class="service-desc">Elle a peut-être été supprimée par son auteur.</div>
                    ${renderFavoriteButtonSlot(favorite.publicationType, favorite.publicationId)}
                </div>
            `;
        }

        if (favorite.publicationType === "OFFER" && favorite.offer) {
            return renderFavoriteOfferCard(favorite.offer);
        }

        if (favorite.publicationType === "REQUEST" && favorite.request) {
            return renderFavoriteRequestCard(favorite.request);
        }

        return "";
    }).filter(Boolean);

    updateDynamicSubtitle("Retrouvez vos offres et demandes enregistrées.");
    updateDynamicView(
        "Mes favoris",
        items.length ? items : [
            renderEmptyState("Aucun favori enregistré", "Les publications ajoutées aux favoris apparaîtront ici.")
        ]
    );
}

function renderFavoriteOfferCard(offer) {
    return `
        <div class="service-card service-card-offer offer-card"
             onclick="openPublicationDetailFromPayload('${encodePublicationPayload(buildOfferDetailPayload(offer))}')">
            <div class="service-card-header">
                <div class="d-flex gap-3">
                    <div class="service-icon">${offer.category?.icon || "🛠️"}</div>
                    <div>
                        <div class="service-title">${escapeHtml(offer.title)}</div>
                        <div class="service-desc">${escapeHtml(offer.description || "")}</div>
                        <div class="service-meta">
                            <span class="service-chip">📍 ${escapeHtml(offer.location || "Non précisée")}</span>
                            <span class="service-chip">${escapeHtml(offer.category?.name || "Catégorie")}</span>
                            <span class="service-chip">Offre</span>
                            ${renderPublicationStatusBadge(offer.status, offer.active)}
                        </div>
                        ${renderProviderTrust(offer.provider, offer.location)}
                    </div>
                </div>
                <div class="service-price">${formatMoney(offer.price, offer.provider?.country)}</div>
            </div>
            <div class="service-actions">
                ${renderFavoriteButtonSlot("OFFER", offer.id)}
                ${renderShareButton(buildOfferDetailPayload(offer))}
            </div>
        </div>
    `;
}

function renderFavoriteRequestCard(request) {
    return `
        <div class="service-card service-card-request request-card"
             onclick="openPublicationDetailFromPayload('${encodePublicationPayload(buildRequestDetailPayload(request))}')">
            <div class="service-card-header">
                <div class="d-flex gap-3">
                    <div class="service-icon">${request.category?.icon || "📨"}</div>
                    <div>
                        <div class="service-title">${escapeHtml(request.title)}</div>
                        <div class="service-desc">${escapeHtml(request.description || "")}</div>
                        <div class="service-meta">
                            <span class="service-chip">📍 ${escapeHtml(request.location || "Non précisée")}</span>
                            <span class="service-chip">${escapeHtml(request.category?.name || "Catégorie")}</span>
                            <span class="service-chip">Demande</span>
                            ${renderPublicationStatusBadge(request.status)}
                        </div>
                        ${renderUserTrust(request.client)}
                    </div>
                </div>
                <div class="service-price">${formatMoney(request.budget, request.client?.country)}</div>
            </div>
            <div class="service-actions">
                ${renderFavoriteButtonSlot("REQUEST", request.id)}
                ${renderShareButton(buildRequestDetailPayload(request))}
            </div>
        </div>
    `;
}

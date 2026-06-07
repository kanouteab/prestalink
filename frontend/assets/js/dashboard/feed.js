function showHome() {
    return loadHomeFeed({ resetFilters: true });
}

async function loadHomeFeed(options = {}) {
    if (options.resetFilters) {
        resetHomeFeedFilters();
    }

    currentPublicationView = "home";

    try {
        const [offersResult, requestsResult] = await Promise.all([
            fetchHomeFeedOffers(),
            fetchHomeFeedRequests()
        ]);

        const offers = normalizeHomeFeedItems(offersResult, "offer")
            .filter(isActiveHomePublication);

        const requests = normalizeHomeFeedItems(requestsResult, "request")
            .filter(isActiveHomePublication);

        console.info("Accueil offres chargées :", offers.length);
        console.info("Accueil demandes chargées :", requests.length);

        const feedItems = [
            ...offers.map(offer => ({
                type: "offer",
                item: offer,
                html: renderHomeOfferCard(offer)
            })),
            ...requests.map(request => ({
                type: "request",
                item: request,
                html: renderHomeRequestCard(request)
            }))
        ].sort(compareHomeFeedItems);

        updateDynamicSubtitle("Toutes les offres et demandes disponibles sur PrestaLink.");

        updateDynamicView(
            "Accueil",
            [
                renderPublicationSearch("home", { showTypeFilter: true }),
                renderPublicationMap([
                    ...offers.map(offer => ({ ...offer, mapType: "Offre" })),
                    ...requests.map(request => ({ ...request, mapType: "Demande" }))
                ]),
                ...(feedItems.length ? feedItems.map(entry => entry.html) : [
                    renderEmptyState("Aucune publication disponible pour le moment.", "")
                ])
            ]
        );
    } catch (error) {
        console.error("Erreur chargement Accueil :", error);
        updateDynamicView("Accueil", [
            renderEmptyState(
                "Impossible de charger les publications.",
                "Veuillez réessayer plus tard."
            )
        ]);
    }
}

async function fetchHomeFeedRequests() {
    try {
        let response = await fetch(API_BASE + "/api/requests/feed");

        if (!response.ok) {
            response = await fetch(API_BASE + "/api/requests");
        }

        if (!response.ok) {
            return [];
        }

        return normalizeHomeFeedResponse(await response.json());
    } catch (error) {
        console.error("Erreur chargement demandes Accueil :", error);
        return [];
    }
}

function resetHomeFeedFilters() {
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
}

async function fetchHomeFeedOffers() {
    try {
        let response = await fetch(API_BASE + "/api/offers/feed");

        if (response.ok) {
            const feedOffers = normalizeHomeFeedResponse(await response.json());

            if (feedOffers.length > 0) {
                return feedOffers;
            }
        }

        response = await fetch(API_BASE + "/api/offers");

        if (!response.ok) {
            return [];
        }

        return normalizeHomeFeedResponse(await response.json());
    } catch (error) {
        console.error("Erreur chargement offres Accueil :", error);
        return [];
    }
}

function normalizeHomeFeedResponse(response) {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.content)) {
        return response.content;
    }

    return [];
}

function normalizeHomeFeedItems(items, type) {
    const publicationType = type === "offer" ? "OFFER" : "REQUEST";

    return normalizeHomeFeedResponse(items).map(item => ({
        ...item,
        publicationType: item.publicationType || publicationType,
        active: type === "request" ? item.active !== false : item.active
    }));
}

function isActiveHomePublication(publication) {
    const status = normalizePublicationStatus(publication.status, publication.active).value;
    return publication.active !== false && !["COMPLETED", "SUSPENDED", "EXPIRED", "ANNULEE"].includes(status);
}

function compareHomeFeedItems(left, right) {
    const sort = publicationSearchState.sort || "recent";

    if (sort === "nearby") {
        return comparePublicationDistance(left.item, right.item);
    }

    if (sort === "price-asc") {
        return compareHomeFeedAmount(left, right, "asc");
    }

    if (sort === "price-desc") {
        return compareHomeFeedAmount(left, right, "desc");
    }

    if (sort === "rating") {
        return getPublicationRating(right.item, right.type) - getPublicationRating(left.item, left.type);
    }

    if (sort === "active") {
        return getPublicationActivity(right.item, right.type) - getPublicationActivity(left.item, left.type);
    }

    return getPublicationDate(right.item) - getPublicationDate(left.item);
}

function compareHomeFeedAmount(left, right, direction) {
    const leftAmount = getPublicationAmount(left.item, left.type);
    const rightAmount = getPublicationAmount(right.item, right.type);
    const leftHasAmount = Number.isFinite(leftAmount);
    const rightHasAmount = Number.isFinite(rightAmount);

    if (leftHasAmount && rightHasAmount) {
        return direction === "asc" ? leftAmount - rightAmount : rightAmount - leftAmount;
    }

    if (leftHasAmount !== rightHasAmount) {
        return leftHasAmount ? -1 : 1;
    }

    return getPublicationDate(right.item) - getPublicationDate(left.item);
}

function renderHomeOfferCard(o) {
    return `
        <div class="publication-card-wrapper">
            <div class="service-card service-card-offer offer-card"
                 onclick="openPublicationDetailFromPayload('${encodePublicationPayload(buildOfferDetailPayload(o))}')">
                <div class="service-card-header">
                    <div class="d-flex gap-3">
                        <div class="service-icon">${o.category?.icon || "🛠️"}</div>

                        <div>
                            <div class="service-title">${escapeHtml(o.title || "")}</div>
                            <div class="service-desc">${escapeHtml(o.description || "")}</div>

                            <div class="service-meta">
                                <span class="service-chip">📍 ${escapeHtml(o.location || "Non précisée")}</span>
                                ${renderDistanceBadge(o)}
                                <span class="service-chip">${escapeHtml(o.category?.name || "Catégorie")}</span>
                                ${renderPublicationStatusBadge(o.status, o.active)}
                                <span class="service-chip">Note : ${formatProviderRating(o.provider)}</span>
                            </div>
                            ${renderProviderTrust(o.provider, o.location)}
                        </div>
                    </div>

                    <div class="service-price">${formatMoney(o.price, o.provider?.country)}</div>
                </div>

                <div class="service-actions">
                    ${renderFavoriteButtonSlot("OFFER", o.id)}
                    ${renderShareButton(buildOfferDetailPayload(o))}
                    ${renderContactPublicationAction(o.provider?.id, o.provider?.fullName, "Offre", o.id, o.title)}
                </div>
            </div>
            ${renderPublicationCardPhotos(o.photoUrls, buildOfferDetailPayload(o))}
        </div>
    `;
}

function renderHomeRequestCard(r) {
    return `
        <div class="publication-card-wrapper">
            <div class="service-card service-card-request request-card"
                 onclick="openPublicationDetailFromPayload('${encodePublicationPayload(buildRequestDetailPayload(r))}')">
                <div class="service-card-header">
                    <div class="d-flex gap-3">
                        <div class="service-icon">${r.category?.icon || "📨"}</div>

                        <div>
                            <div class="service-title">${escapeHtml(r.title || "")}</div>
                            <div class="service-desc">${escapeHtml(r.description || "")}</div>

                            <div class="service-meta">
                                <span class="service-chip">📍 ${escapeHtml(r.location || "Non précisée")}</span>
                                ${renderDistanceBadge(r)}
                                <span class="service-chip">${escapeHtml(r.category?.name || "Catégorie")}</span>
                                ${renderPublicationStatusBadge(r.status, r.active)}
                                ${isRequestSameLocality(r) ? '<span class="service-chip service-chip-local">Même localité</span>' : ''}
                            </div>
                            ${renderUserTrust(r.client)}
                        </div>
                    </div>

                    <div class="service-price">
                        ${formatMoney(r.budget, r.client?.country)}
                    </div>
                </div>

                <div class="service-actions">
                    ${renderFavoriteButtonSlot("REQUEST", r.id)}
                    ${renderShareButton(buildRequestDetailPayload(r))}
                    ${renderContactPublicationAction(r.client?.id, r.client?.fullName, "Demande", r.id, r.title)}
                </div>
            </div>
            ${renderPublicationCardPhotos(r.photoUrls, buildRequestDetailPayload(r))}
        </div>
    `;
}

async function updateSidebarPublicationBadges() {
    if (!isLoggedIn) {
        resetPrivateSidebarBadges();
        return;
    }

    const offersBadge = document.getElementById("myOffersBadge");
    const requestsBadge = document.getElementById("myRequestsBadge");

    if (!offersBadge || !requestsBadge) return;

    try {
        const [offersRes, requestsRes] = await Promise.all([
            fetch(API_BASE + "/api/offers"),
            fetch(API_BASE + "/api/requests")
        ]);

        if (!offersRes.ok || !requestsRes.ok) {
            throw new Error("Impossible de charger les compteurs de publications");
        }

        const offers = await offersRes.json();
        const requests = await requestsRes.json();

        offersBadge.textContent =
                offers.filter(isCurrentUserOffer).length;

        requestsBadge.textContent =
                requests.filter(isCurrentUserRequest).length;
    } catch (error) {
        console.error("Impossible de mettre à jour les badges de publications", error);
        addEvent("Impossible de mettre à jour les badges de publications");
    }
}

function resetPrivateSidebarBadges() {
    updateFavoriteBadge(0);
    updateHistoryBadge(0);

    const offersBadge = document.getElementById("myOffersBadge");
    const requestsBadge = document.getElementById("myRequestsBadge");

    if (offersBadge) {
        offersBadge.textContent = "0";
    }

    if (requestsBadge) {
        requestsBadge.textContent = "0";
    }
}

async function refreshPrivateSidebarBadges() {
    if (!isLoggedIn || !currentUser?.id) {
        resetPrivateSidebarBadges();
        return;
    }

    await Promise.all([
        loadFavoriteState(),
        loadHistoryBadge(),
        updateSidebarPublicationBadges()
    ]);
}

function applySidebarState(collapsed) {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    document.body.classList.toggle("sidebar-open", !collapsed);

    const toggle = document.getElementById("sidebarToggle");

    if (toggle) {
        toggle.setAttribute("aria-expanded", String(!collapsed));
        toggle.setAttribute("aria-label", collapsed ? "Ouvrir le menu" : "Fermer le menu");
        toggle.setAttribute("title", collapsed ? "Ouvrir le menu" : "Fermer le menu");
    }
}

function toggleSidebar() {
    const collapsed = !document.body.classList.contains("sidebar-collapsed");
    localStorage.setItem("prestalink_sidebar_collapsed", collapsed ? "true" : "false");
    applySidebarState(collapsed);
}

function restoreSidebarState() {
    const collapsed = localStorage.getItem("prestalink_sidebar_collapsed") === "true";
    applySidebarState(collapsed);
}

function expandSidebarForSearch() {
    if (document.body.classList.contains("sidebar-collapsed")) {
        localStorage.setItem("prestalink_sidebar_collapsed", "false");
        applySidebarState(false);
    }

    setTimeout(function () {
        document.getElementById("globalSearchInput")?.focus();
    }, 0);
}

function handleGlobalSearchInput(value) {
    clearTimeout(handleGlobalSearchInput.timer);
    handleGlobalSearchInput.timer = setTimeout(function () {
        runGlobalSearch(value);
    }, 180);
}

async function runGlobalSearch(rawQuery) {
    const query = String(rawQuery || "").trim();

    if (!query) {
        return loadHomeFeed();
    }

    const normalizedQuery = normalizeText(query);

    try {
        const [usersRes, offersRes, requestsRes] = await Promise.all([
            fetch(API_BASE + "/api/users"),
            fetch(API_BASE + "/api/offers/feed"),
            fetch(API_BASE + "/api/requests")
        ]);

        const users = usersRes.ok ? await usersRes.json() : [];
        const offers = offersRes.ok ? await offersRes.json() : [];
        const requests = requestsRes.ok ? await requestsRes.json() : [];

        const results = [
            ...buildUserSearchResults(users, normalizedQuery),
            ...buildOfferSearchResults(offers, normalizedQuery),
            ...buildRequestSearchResults(requests, normalizedQuery)
        ];

        renderGlobalSearchResults(query, results);
    } catch (error) {
        console.error("Erreur de recherche globale", error);
        updateDynamicSubtitle("Recherche indisponible pour le moment.");
        updateDynamicView("Résultats de recherche", [
            renderEmptyState("Aucun résultat trouvé.", "Aucun résultat pour cette recherche.")
        ]);
    }
}

function buildUserSearchResults(users, normalizedQuery) {
    return (users || [])
        .filter(user => searchMatch([
            user.id,
            user.fullName,
            user.email,
            user.phone,
            user.role,
            user.status,
            user.streetAddress,
            user.postalCode,
            user.country
        ], normalizedQuery))
        .map(user => ({
            type: "USER",
            id: user.id,
            title: user.fullName || "Utilisateur",
            subtitle: [user.role, user.country].filter(Boolean).join(" · "),
            location: [user.streetAddress, user.postalCode, user.country].filter(Boolean).join(" "),
            user: user,
            payload: user
        }));
}

function buildOfferSearchResults(offers, normalizedQuery) {
    return (offers || [])
        .filter(offer => searchMatch([
            offer.id,
            offer.title,
            offer.description,
            offer.location,
            offer.price,
            offer.category?.name,
            offer.provider?.fullName,
            offer.provider?.country
        ], normalizedQuery))
        .map(offer => ({
            type: "OFFER",
            id: offer.id,
            title: offer.title || "Offre",
            subtitle: offer.description || "Offre de service",
            category: offer.category?.name || "",
            location: offer.location || "",
            ownerName: offer.provider?.fullName || "",
            user: offer.provider || null,
            payload: offer
        }));
}

function buildRequestSearchResults(requests, normalizedQuery) {
    return (requests || [])
        .filter(request => searchMatch([
            request.id,
            request.title,
            request.description,
            request.location,
            request.budget,
            request.category?.name,
            request.client?.fullName,
            request.client?.country,
            request.status
        ], normalizedQuery))
        .map(request => ({
            type: "REQUEST",
            id: request.id,
            title: request.title || "Demande",
            subtitle: request.description || "Demande de service",
            category: request.category?.name || "",
            location: request.location || "",
            ownerName: request.client?.fullName || "",
            user: request.client || null,
            payload: request
        }));
}

function searchMatch(values, normalizedQuery) {
    return normalizeText(values.filter(value => value !== null && value !== undefined).join(" ")).includes(normalizedQuery);
}

function renderGlobalSearchResults(query, results) {
    updateDynamicSubtitle("Résultats pour : " + query);

    if (!results.length) {
        updateDynamicView("Résultats de recherche", [
            renderEmptyState("Aucun résultat trouvé.", "Aucun résultat pour cette recherche.")
        ]);
        return;
    }

    updateDynamicView(
        "Résultats de recherche",
        results.map(result => renderGlobalSearchResult(result))
    );
}

function renderGlobalSearchResult(result) {
    const badge = result.type === "USER"
        ? "Utilisateur"
        : result.type === "OFFER"
            ? "Offre"
            : "Demande";
    const action = result.type === "USER"
        ? `openSearchUserResult(${result.id})`
        : result.type === "OFFER"
            ? `openPublicationDetailFromPayload('${encodePublicationPayload(buildOfferDetailPayload(result.payload))}')`
            : `openPublicationDetailFromPayload('${encodePublicationPayload(buildRequestDetailPayload(result.payload))}')`;

    return `
        <div class="global-search-result" role="button" tabindex="0" onclick="${action}">
            <span class="global-search-badge global-search-${result.type.toLowerCase()}">${badge}</span>
            <strong>${escapeHtml(result.title)}</strong>
            ${result.user?.verifiedProfile ? renderVerifiedProfileBadge(result.user) : ""}
            <small>${escapeHtml(result.subtitle || "")}</small>
            <span>${escapeHtml([result.category, result.location, result.ownerName].filter(Boolean).join(" · "))}</span>
            ${result.type === "OFFER" ? renderFavoriteButtonSlot("OFFER", result.id, { compact: true }) : ""}
            ${result.type === "REQUEST" ? renderFavoriteButtonSlot("REQUEST", result.id, { compact: true }) : ""}
            ${result.type === "OFFER" ? renderShareButton(buildOfferDetailPayload(result.payload)) : ""}
            ${result.type === "REQUEST" ? renderShareButton(buildRequestDetailPayload(result.payload)) : ""}
        </div>
    `;
}

async function openSearchUserResult(userId) {
    const res = await fetch(API_BASE + "/api/users");
    const users = res.ok ? await res.json() : [];
    const user = users.find(item => String(item.id) === String(userId));

    if (!user) {
        showToast("Utilisateur introuvable.");
        return;
    }

    updateDynamicSubtitle("Profil utilisateur");
    updateDynamicView("Utilisateur", [
        `
        <div class="search-user-detail">
            <strong>${escapeHtml(user.fullName || "Utilisateur")}</strong>
            ${renderVerificationBadges(user)}
            <span>${escapeHtml([user.role, user.status].filter(Boolean).join(" · "))}</span>
            <small>${escapeHtml([user.streetAddress, user.postalCode, user.country].filter(Boolean).join(" "))}</small>
        </div>
        `
    ]);
}

function toggleFabMenu() {
    document.getElementById("fabMenu")
        .classList.toggle("show");
}

function closeFabMenu() {
    document.getElementById("fabMenu")
        .classList.remove("show");
}

function closeUserDropdown() {
    document.getElementById("userDropdown")
        .classList.remove("show");
}

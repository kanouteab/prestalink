async function loadMyRequests() {
    if (!isLoggedIn) {
        requireAuthOrResume("myRequests");
        return;
    }

    currentPublicationView = "my-requests";
    const res = await fetch(API_BASE + "/api/requests");
    const requests = await res.json();

    const myRequests = filterPublications(requests.filter(isCurrentUserRequest), "request");
    const createAction = `
        <button class="service-btn service-btn-primary"
                onclick="openNewRequestModal()">
            Créer une demande
        </button>
    `;

    const items = myRequests.map(r => `
    <div class="publication-card-wrapper">
    <div class="service-card request-card"
         onclick="openPublicationDetailFromPayload('${encodePublicationPayload(buildRequestDetailPayload(r))}')">
        <div class="service-card-header">

            <div class="d-flex gap-3">

                <div class="service-icon">
                    ${r.category?.icon || "📨"}
                </div>

                <div>
                    <div class="service-title">
                        ${r.title}
                    </div>

                    <div class="service-desc">
                        ${r.description || "Aucune description fournie."}
                    </div>

                    <div class="service-meta">
                        <span class="service-chip">
                            📍 ${r.location || "Localisation non précisée"}
                        </span>
                        ${renderDistanceBadge(r)}

                        <span class="service-chip">
                            ${r.category?.name || "Catégorie"}
                        </span>

                        ${renderPublicationStatusBadge(r.status)}
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
        </div>
        ${renderPublicationActions("request", r.id)}

    </div>
    ${renderPublicationCardPhotos(r.photoUrls, buildRequestDetailPayload(r))}
    </div>
`);

    updateDynamicSubtitle("Gérez les demandes que vous avez publiées.");
    updateDynamicView(
        "Mes demandes",
        [
            renderPublicationSearch("my-requests"),
            renderPublicationMap(myRequests.map(request => ({ ...request, mapType: "Demande" }))),
            ...(items.length ? items : [
                renderEmptyState(
                    "Vous n’avez encore publié aucune demande",
                    "Créez votre première demande pour la rendre visible dans la section Demandes.",
                    createAction
                )
            ])
        ]
    );
    updateSidebarPublicationBadges();
}

async function loadAvailableRequests() {
    currentPublicationView = "requests";
    const providerQuery =
        currentUser?.role === "PRESTATAIRE"
            ? "?providerId=" + encodeURIComponent(currentUser.id)
            : buildLocationQuery();
    const result = await fetchJsonWithFallback(
        API_BASE + "/api/requests" + providerQuery,
        API_BASE + "/api/requests",
        getZoneFallbackMessage()
    );
    const requests = filterPublications(result.data, "request");

    const items = requests.map(r => `
        <div class="publication-card-wrapper">
        <div class="service-card service-card-request request-card"
             onclick="openPublicationDetailFromPayload('${encodePublicationPayload(buildRequestDetailPayload(r))}')">
            <div class="service-card-header">
                <div class="d-flex gap-3">
                    <div class="service-icon">${r.category?.icon || "📨"}</div>

                    <div>
                        <div class="service-title">${r.title}</div>
                        <div class="service-desc">${r.description || ""}</div>

                        <div class="service-meta">
                            <span class="service-chip">📍 ${r.location || "Non précisée"}</span>
                            ${renderDistanceBadge(r)}
                            <span class="service-chip">${r.category?.name || "Catégorie"}</span>
                            ${renderPublicationStatusBadge(r.status)}
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
    `);

    updateDynamicSubtitle("Toutes les demandes publiques publiées sur PrestaLink.");
    updateDynamicView(
        "Demandes",
        [
            renderPublicationSearch("requests"),
            renderPublicationMap(requests.map(request => ({ ...request, mapType: "Demande" }))),
            ...(result.message ? [`<div class="fallback-note">${result.message}</div>`] : []),
            ...(items.length ? items : [
                renderEmptyState("Aucune demande disponible", "Les nouvelles demandes publiques apparaîtront ici.")
            ])
        ]
    );
}

async function submitRequest() {
    if (!requireAuthOrResume("submitRequest", { formData: collectRequestFormData() })) {
        return;
    }

    addEvent("Tentative de publication demande");

    const title = document.getElementById("requestTitle").value.trim();
    const description = document.getElementById("requestDescription").value.trim();
    const budgetValue = document.getElementById("requestBudget").value;
    const location = document.getElementById("requestLocation").value.trim();
    const categoryId = document.getElementById("requestCategoryId").value;

    if (!title || !description || !location || !categoryId) {
        addEvent("Tous les champs marqués par * sont obligatoires.");
        return;
    }

    const url =
        API_BASE +
        "/api/requests?clientId=" +
        currentUser.id +
        "&categoryId=" +
        Number(categoryId);

    const requestBody = {
        title: title,
        description: description,
        budget: budgetValue ? Number(budgetValue) : null,
        location: location,
        ...getPublicationLocationPayload(location),
        photoUrls: getPublicationPhotoUrls("request")
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: getAuthHeaders({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(requestBody)
        });

        if (!res.ok) {
            const errorText = await res.text();

            addEvent("URL appelée : " + url);
            addEvent("Erreur publication Demande : " + errorText);

            return;
        }

        showToast("Demande publiée avec succès");

        const savedRequest = await res.json();
        await uploadPublicationPhotos("request", savedRequest.id);

        closeCreateRequestModal();

        document.getElementById("requestTitle").value = "";
        document.getElementById("requestDescription").value = "";
        document.getElementById("requestBudget").value = "";
        document.getElementById("requestLocation").value = "";
        document.getElementById("requestCategoryId").value = "";
        initializePublicationPhotos("request");

        await refreshAfterPublicationSave("request");

    } catch (error) {
        showToast(error.message || "Erreur serveur lors de la publication demande");
        addEvent("Erreur serveur lors de la publication demande");
    }
}

async function editRequest(requestId) {
    if (!requireAuthOrResume("editRequest", { publicationId: requestId, publicationType: "REQUEST" })) {
        return;
    }

    try {
        const res = await fetch(API_BASE + "/api/requests/" + requestId);

        if (!res.ok) {
            addEvent("Impossible de charger la demande ID " + requestId);
            return;
        }

        const request = await res.json();
        const icon = request.category?.icon || "📨";

        document.getElementById("requestPublicationBadge")
            .innerHTML = `<span>${icon}</span>`;

        document.getElementById("requestTitle").value = request.title || "";
        document.getElementById("requestDescription").value = request.description || "";
        document.getElementById("requestBudget").value = request.budget || "";
        document.getElementById("requestLocation").value = request.location || "";
        document.getElementById("requestPublicationType").value = "REQUEST";
        initializePublicationPhotos("request", request.photoUrls);

        if (request.category?.id) {
            document.getElementById("requestCategoryId").value = request.category.id;
        }

        document.getElementById("createRequestModal")
            .setAttribute("data-edit-id", requestId);

        document.getElementById("requestModalTitle").textContent = "Modifier une demande";
        document.getElementById("requestSubmitButton").textContent = "Modifier";

        showToast("Modification de la demande");
        openCreateRequestModal();

    } catch (error) {
        console.error(error);
        addEvent("Erreur JS modification demande : " + error.message);
    }
}

async function updateRequest() {
    if (!requireAuthOrResume("updateRequest", { formData: collectRequestFormData() })) {
        return;
    }

    addEvent("Tentative de modification demande");

    const requestId =
        document.getElementById("createRequestModal")
            .getAttribute("data-edit-id");

    if (!requestId) {
        addEvent("Aucune demande sélectionnée pour modification.");
        return;
    }

    const publicationType =
        document.getElementById("requestPublicationType").value;

    const title = document.getElementById("requestTitle").value.trim();
    const description = document.getElementById("requestDescription").value.trim();
    const budgetValue = document.getElementById("requestBudget").value;
    const location = document.getElementById("requestLocation").value.trim();
    const categoryId = document.getElementById("requestCategoryId").value;

    if (!title || !description || !location || !categoryId) {
        addEvent("Tous les champs marqués par * sont obligatoires.");
        return;
    }

    if (publicationType === "OFFER") {
        const offerBody = {
            title: title,
            description: description,
            price: budgetValue ? Number(budgetValue) : 0,
            location: location,
            ...getPublicationLocationPayload(location),
            active: true,
            photoUrls: getPublicationPhotoUrls("request")
        };

        let createdOffer = null;
        let originalRequestDeleted = false;

        try {
            const createOfferRes = await fetch(
                API_BASE +
                "/api/offers?providerId=" +
                currentUser.id +
                "&categoryId=" +
                Number(categoryId),
                {
                    method: "POST",
                    headers: getAuthHeaders({
                        "Content-Type": "application/json"
                    }),
                    body: JSON.stringify(offerBody)
                }
            );

            if (!createOfferRes.ok) {
                addEvent("Erreur conversion demande vers offre : " + await createOfferRes.text());
                return;
            }

            createdOffer = await createOfferRes.json();
            await uploadPublicationPhotos("request", createdOffer.id, "offer");

            const deleteRequestRes = await fetch(
                API_BASE + "/api/requests/" + requestId,
                { method: "DELETE", headers: getAuthHeaders() }
            );

            if (!deleteRequestRes.ok) {
                if (createdOffer.id) {
                    await fetch(
                        API_BASE + "/api/offers/" + createdOffer.id,
                        { method: "DELETE", headers: getAuthHeaders() }
                    );
                }

                addEvent("Offre créée, mais ancienne demande non supprimée.");
                return;
            }

            originalRequestDeleted = true;

            const verifyRequestRes = await fetch(API_BASE + "/api/requests/" + requestId);

            if (verifyRequestRes.ok) {
                if (createdOffer.id) {
                    await fetch(
                        API_BASE + "/api/offers/" + createdOffer.id,
                        { method: "DELETE", headers: getAuthHeaders() }
                    );
                }

                addEvent("Offre créée, mais vérification de suppression de la demande échouée.");
                return;
            }

            addEvent("Demande originale supprimée");
            addEvent("Demande convertie en offre");
            showToast("Demande convertie en offre");

            document.getElementById("createRequestModal")
                .removeAttribute("data-edit-id");

            document.getElementById("requestSubmitButton")
                .setAttribute("onclick", "submitRequest()");

            document.getElementById("requestSubmitButton")
                .textContent = "Publier";

            closeCreateRequestModal();

            await loadMyOffers();
            await loadMyRequests();
            await loadDashboard();
        } catch (error) {
            console.error(error);

            if (!originalRequestDeleted && createdOffer && createdOffer.id) {
                await fetch(
                    API_BASE + "/api/offers/" + createdOffer.id,
                    { method: "DELETE", headers: getAuthHeaders() }
                );
            }

            addEvent("Erreur serveur lors de la conversion demande vers offre");
        }

        return;
    }

    const requestBody = {
        title: title,
        description: description,
        budget: budgetValue ? Number(budgetValue) : null,
        location: location,
        ...getPublicationLocationPayload(location),
        photoUrls: getPublicationPhotoUrls("request")
    };

    const res = await fetch(
        API_BASE +
        "/api/requests/" + requestId +
        "?clientId=" +
        currentUser.id +
        "&categoryId=" +
        Number(categoryId),
        {
            method: "PUT",
            headers: getAuthHeaders({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(requestBody)
        }
    );

    if (!res.ok) {
        addEvent("Erreur modification demande : " + await res.text());
        return;
    }

    showToast("Demande modifiée avec succès");

    await uploadPublicationPhotos("request", requestId);

    document.getElementById("createRequestModal")
        .removeAttribute("data-edit-id");

    document.getElementById("requestSubmitButton")
        .setAttribute("onclick", "submitRequest()");

    document.getElementById("requestSubmitButton")
        .textContent = "Publier";

    closeCreateRequestModal();

    await refreshAfterPublicationSave("request");
}

async function openEditRequestSelector() {
    closeUserDropdown();
    return loadMyRequests();
}

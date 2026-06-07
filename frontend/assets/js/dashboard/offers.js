async function loadMyOffers() {
    if (!isLoggedIn) {
        requireAuthOrResume("myOffers");
        return;
    }

    currentPublicationView = "my-offers";
    const res = await fetch(API_BASE + "/api/offers");
    const offers = await res.json();

    const myOffers = filterPublications(offers.filter(isCurrentUserOffer), "offer");
    const createAction = `
        <button class="service-btn service-btn-primary"
                onclick="openNewOfferModal()">
            Créer une offre
        </button>
    `;

    const items = myOffers.map(o => `
    <div class="publication-card-wrapper">
    <div class="service-card offer-card"
         onclick="openPublicationDetailFromPayload('${encodePublicationPayload(buildOfferDetailPayload(o))}')">
        <div class="service-card-header">

            <div class="d-flex gap-3">

                <div class="service-icon">
                    ${o.category?.icon || "🛠️"}
                </div>

                <div>
                    <div class="service-title">
                        ${o.title}
                    </div>

                    <div class="service-desc">
                        ${o.description || "Aucune description fournie."}
                    </div>

                    <div class="service-meta">
                        <span class="service-chip">
                            📍 ${o.location || "Localisation non précisée"}
                        </span>
                        ${renderDistanceBadge(o)}

                        <span class="service-chip">
                            ${o.category?.name || "Catégorie"}
                        </span>

                        ${renderPublicationStatusBadge(o.status, o.active)}

                        <span class="service-chip">
                            Note : ${formatProviderRating(o.provider)}
                        </span>
                    </div>
                    ${renderProviderTrust(o.provider, o.location)}
                </div>

            </div>

            <div class="service-price">
                ${formatMoney(o.price, o.provider?.country)}
            </div>

        </div>
        <div class="service-actions">
            ${renderFavoriteButtonSlot("OFFER", o.id)}
            ${renderShareButton(buildOfferDetailPayload(o))}
        </div>
        ${renderPublicationActions("offer", o.id)}

    </div>
    ${renderPublicationCardPhotos(o.photoUrls, buildOfferDetailPayload(o))}
    </div>
`);

    updateDynamicSubtitle("Gérez les offres que vous avez publiées.");
    updateDynamicView(
        "Mes offres",
        [
            renderPublicationSearch("my-offers"),
            renderPublicationMap(myOffers.map(offer => ({ ...offer, mapType: "Offre" }))),
            ...(items.length ? items : [
                renderEmptyState(
                    "Vous n’avez encore publié aucune offre",
                    "Créez votre première offre pour la rendre visible dans la section Offres.",
                    createAction
                )
            ])
        ]
    );
    updateSidebarPublicationBadges();
}

async function submitOffer() {
    if (!requireAuthOrResume("submitOffer", { formData: collectOfferFormData() })) {
        return;
    }

    addEvent("Tentative de publication offre");

    const title = document.getElementById("offerTitle").value.trim();
    const description = document.getElementById("offerDescription").value.trim();
    const price = document.getElementById("offerPrice").value;
    const location = document.getElementById("offerLocation").value.trim();
    const categoryId = document.getElementById("offerCategoryId").value;

    if (!title || !description || !price || !location || !categoryId) {
        addEvent("Tous les champs marqués par * sont obligatoires.");
        return;
    }

    const url =
        API_BASE +
        "/api/offers?providerId=" +
        currentUser.id +
        "&categoryId=" +
        Number(categoryId);

    const offerBody = {
        title: title,
        description: description,
        price: Number(price),
        location: location,
        ...getPublicationLocationPayload(location),
        active: true,
        photoUrls: getPublicationPhotoUrls("offer")
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: getAuthHeaders({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(offerBody)
        });

        if (!res.ok) {
            const errorText = await res.text();

            addEvent("URL appelée : " + url);
            addEvent("Erreur publication offre : " + errorText);

            return;
        }

        showToast("Offre publiée avec succès");

        const savedOffer = await res.json();
        await uploadPublicationPhotos("offer", savedOffer.id);

        closeCreateOfferModal();

        document.getElementById("offerTitle").value = "";
        document.getElementById("offerDescription").value = "";
        document.getElementById("offerPrice").value = "";
        document.getElementById("offerLocation").value = "";
        document.getElementById("offerCategoryId").value = "";
        initializePublicationPhotos("offer");

        await refreshAfterPublicationSave("offer");
    } catch (error) {
        showToast(error.message || "Erreur serveur lors de la publication offre");
        addEvent("Erreur serveur lors de la publication offre");
    }
}

async function updateOffer() {
    if (!requireAuthOrResume("updateOffer", { formData: collectOfferFormData() })) {
        return;
    }

    addEvent("Tentative de modification offre");

    const offerId =
        document.getElementById("createOfferModal")
            .getAttribute("data-edit-id");

    if (!offerId) {
        addEvent("Aucune offre sélectionnée pour modification.");
        return;
    }

    const publicationType =
        document.getElementById("offerPublicationType").value;

    const title = document.getElementById("offerTitle").value.trim();
    const description = document.getElementById("offerDescription").value.trim();
    const price = document.getElementById("offerPrice").value;
    const location = document.getElementById("offerLocation").value.trim();
    const categoryId = document.getElementById("offerCategoryId").value;

    if (!title || !description || !location || !categoryId) {
        addEvent("Tous les champs marqués par * sont obligatoires.");
        return;
    }

    if (publicationType === "REQUEST") {
        const requestBody = {
            title: title,
            description: description,
            budget: price ? Number(price) : null,
            location: location,
            ...getPublicationLocationPayload(location),
            photoUrls: getPublicationPhotoUrls("offer")
        };

        let createdRequest = null;
        let originalOfferDeleted = false;

        try {
            const createRequestRes = await fetch(
                API_BASE +
                "/api/requests?clientId=" +
                currentUser.id +
                "&categoryId=" +
                Number(categoryId),
                {
                    method: "POST",
                    headers: getAuthHeaders({
                        "Content-Type": "application/json"
                    }),
                    body: JSON.stringify(requestBody)
                }
            );

            if (!createRequestRes.ok) {
                addEvent("Erreur conversion offre vers demande : " + await createRequestRes.text());
                return;
            }

            createdRequest = await createRequestRes.json();
            await uploadPublicationPhotos("offer", createdRequest.id, "request");

            const deleteOfferRes = await fetch(
                API_BASE + "/api/offers/" + offerId,
                { method: "DELETE", headers: getAuthHeaders() }
            );

            if (!deleteOfferRes.ok) {
                if (createdRequest.id) {
                    await fetch(
                        API_BASE + "/api/requests/" + createdRequest.id,
                        { method: "DELETE", headers: getAuthHeaders() }
                    );
                }

                addEvent("Demande créée, mais ancienne offre non supprimée.");
                return;
            }

            originalOfferDeleted = true;

            const verifyOfferRes = await fetch(API_BASE + "/api/offers/" + offerId);

            if (verifyOfferRes.ok) {
                if (createdRequest.id) {
                    await fetch(
                        API_BASE + "/api/requests/" + createdRequest.id,
                        { method: "DELETE", headers: getAuthHeaders() }
                    );
                }

                addEvent("Demande créée, mais vérification de suppression de l’offre échouée.");
                return;
            }

            addEvent("Offre originale supprimée");
            addEvent("Offre convertie en demande");
            showToast("Offre convertie en demande");

            document.getElementById("createOfferModal")
                .removeAttribute("data-edit-id");

            document.getElementById("offerSubmitButton")
                .setAttribute("onclick", "submitOffer()");

            document.getElementById("offerSubmitButton")
                .textContent = "Publier";

            closeCreateOfferModal();

            await loadMyRequests();
            await loadMyOffers();
            await loadDashboard();
        } catch (error) {
            console.error(error);

            if (!originalOfferDeleted && createdRequest && createdRequest.id) {
                await fetch(
                    API_BASE + "/api/requests/" + createdRequest.id,
                    { method: "DELETE", headers: getAuthHeaders() }
                );
            }

            addEvent("Erreur serveur lors de la conversion offre vers demande");
        }

        return;
    }

    const offerBody = {
        title: title,
        description: description,
        price: Number(price),
        location: location,
        ...getPublicationLocationPayload(location),
        active: true,
        photoUrls: getPublicationPhotoUrls("offer")
    };

    const res = await fetch(
        API_BASE +
        "/api/offers/" + offerId +
        "?providerId=" + currentUser.id +
        "&categoryId=" +
        Number(categoryId),
        {
            method: "PUT",
            headers: getAuthHeaders({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(offerBody)
        }
    );

    if (!res.ok) {
        addEvent("Erreur modification offre : " + await res.text());
        return;
    }

    showToast("Offre modifiée avec succès");

    await uploadPublicationPhotos("offer", offerId);

    document.getElementById("createOfferModal")
        .removeAttribute("data-edit-id");

    document.getElementById("offerSubmitButton")
        .setAttribute("onclick", "submitOffer()");

    document.getElementById("offerSubmitButton")
        .textContent = "Publier";

    closeCreateOfferModal();

    await refreshAfterPublicationSave("offer");
}

async function editOffer(offerId) {
    if (!requireAuthOrResume("editOffer", { publicationId: offerId, publicationType: "OFFER" })) {
        return;
    }

    try {
        const res = await fetch(API_BASE + "/api/offers/" + offerId);

        if (!res.ok) {
            addEvent("Impossible de charger l'offre ID " + offerId);
            return;
        }

        const offer = await res.json();
        const icon = offer.category?.icon || "🛠️";

        document.getElementById("offerPublicationBadge")
            .innerHTML = `<span>${icon}</span>`;

        document.getElementById("offerTitle").value = offer.title || "";
        document.getElementById("offerDescription").value = offer.description || "";
        document.getElementById("offerPrice").value = offer.price || "";
        document.getElementById("offerLocation").value = offer.location || "";
        document.getElementById("offerPublicationType").value = "OFFER";
        initializePublicationPhotos("offer", offer.photoUrls);

        if (offer.category?.id) {
            document.getElementById("offerCategoryId").value = offer.category.id;
        }

        document.getElementById("createOfferModal")
            .setAttribute("data-edit-id", offerId);

        document.getElementById("offerModalTitle").textContent = "Modifier une offre";
        document.getElementById("offerSubmitButton").textContent = "Modifier";

        showToast("Modification de l'offre");
        openCreateOfferModal();

    } catch (error) {
        console.error(error);
        addEvent("Erreur JS modification offre : " + error.message);
    }
}

async function openEditOfferSelector() {
    closeUserDropdown();
    return loadMyOffers();
}

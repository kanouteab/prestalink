async function loadMissionsView() {
    if (!requireAuthOrResume("missions")) {
        return;
    }

    const res = await fetch(API_BASE + "/api/missions");
    const missions = await res.json();

    const myMissions = missions.filter(function (m) {
        if (currentUser.role === "CLIENT") {
            return m.client && m.client.id === currentUser.id;
        }

        if (currentUser.role === "PRESTATAIRE") {
            return m.provider && m.provider.id === currentUser.id;
        }

        return false;
    });

    const items = myMissions.map(function (m) {
        return `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>Mission #${m.id}</strong><br>
                    <small>Client : ${m.client.fullName}</small><br>
                    <small>Prestataire : ${m.provider.fullName}</small><br>
                    <small>Statut : ${m.status}</small>
                </div>

                <div class="text-end">
                    ${currentUser.role === "CLIENT" && m.status === "TERMINEE" ? `
                        <button class="btn btn-sm btn-outline-success mt-2"
                                onclick="submitMissionReview(${m.id}, ${m.provider.id})">
                            Noter
                        </button>
                    ` : ""}
                </div>
            </div>
        `;
    });

    updateDynamicView("Mes missions", items);
}

async function loadUsersView() {

    const res =
        await fetch(API_BASE + "/api/users");

    const users =
        await res.json();

    const items = users.map(function(u) {

        return `
            <div class="search-user-detail">
                <strong>${u.fullName}</strong>
                ${renderVerificationBadges(u)}
                <span>${u.role} | ${u.status}</span>
            </div>
        `;
    });

    updateDynamicView(
        "Utilisateurs",
        items
    );
}

async function submitMissionReview(missionId, providerId) {
    if (!requireAuthOrResume("submitMissionReview", { missionId, providerId })) {
        return;
    }

    const ratingValue = prompt("Note du prestataire de 1 à 5");

    if (ratingValue === null) {
        return;
    }

    const rating = Number(ratingValue);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        showToast("La note doit être comprise entre 1 et 5.");
        return;
    }

    const comment = prompt("Commentaire optionnel") || "";

    const res = await fetch(API_BASE + "/api/providers/" + providerId + "/reviews", {
        method: "POST",
        headers: getAuthHeaders({
            "Content-Type": "application/json"
        }),
        body: JSON.stringify({
            missionId: missionId,
            rating: rating,
            comment: comment
        })
    });

    if (!res.ok) {
        showToast(await res.text());
        return;
    }

    showToast("Avis publié avec succès.");
    loadMissionsView();
}

async function loadProvidersView() {

    const res =
        await fetch(API_BASE + "/api/providers/recommended" + buildLocationQuery());

    const providers =
        await res.json();

    const items = providers.map(function(p) {

        return `
            <div class="service-card">
                <div class="service-card-header">
                    <div>
                        <div class="service-title">${p.fullName}</div>
                        <div class="service-desc">${p.status || "Statut non précisé"}</div>
                        ${renderProviderTrust(p)}
                    </div>
                </div>
            </div>
        `;
    });

    updateDynamicSubtitle("Prestataires classés par localité, disponibilité et réputation.");
    updateDynamicView(
        "Prestataires disponibles",
        items
    );
}

async function loadPendingRequestsView() {

    const res =
        await fetch(API_BASE + "/api/requests" + buildLocationQuery());

    const requests =
        await res.json();

    const pendingRequests =
        requests.filter(r => normalizePublicationStatus(r.status).value === "AVAILABLE");

    const items = pendingRequests.map(function(r) {

        return `
            <div class="d-flex justify-content-between align-items-center">

                <div>
                    <strong>${r.title}</strong><br>

                    <small class="text-muted">
                        Client : ${r.client.fullName}
                    </small><br>

                    <small>
                        📍 ${r.location}
                    </small><br>
                    ${renderUserTrust(r.client)}
                    ${isRequestSameLocality(r) ? '<span class="service-chip service-chip-local">Même localité</span>' : ''}
                </div>

                <div class="text-end">

                    <span class="badge bg-warning text-dark">
                        ${r.status}
                    </span><br>

                    <strong class="text-success">
                        ${formatMoney(r.budget, r.client?.country)}
                    </strong>

                </div>

            </div>
        `;
    });

    updateDynamicView(
        "Demandes en attente",
        items
    );
}

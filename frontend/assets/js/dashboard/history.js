function updateHistoryBadge(count = 0) {
    const badge = document.getElementById("historyBadge");

    if (badge) {
        badge.textContent = String(count);
    }
}

function getHistoryItemCount(history) {
    return (history?.providedServices || []).length + (history?.requestedServices || []).length;
}

async function loadHistoryBadge() {
    if (!isLoggedIn || !currentUser?.id) {
        updateHistoryBadge(0);
        return 0;
    }

    try {
        const res = await fetch(API_BASE + "/api/history/me", {
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            throw new Error("Impossible de charger le compteur d’historique");
        }

        const history = await res.json();
        const count = getHistoryItemCount(history);
        updateHistoryBadge(count);
        return count;
    } catch (error) {
        console.error(error);
        updateHistoryBadge(0);
        return 0;
    }
}

async function loadServiceHistory() {
    if (!isLoggedIn || !currentUser?.id) {
        requireAuthOrResume("history");
        return;
    }

    currentPublicationView = "history";

    try {
        const res = await fetch(API_BASE + "/api/history/me", {
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToast(data.error || "Impossible de charger l’historique.");
            return;
        }

        const history = await res.json();
        const provided = history.providedServices || [];
        const requested = history.requestedServices || [];
        const hasHistory = provided.length || requested.length;
        updateHistoryBadge(provided.length + requested.length);

        updateDynamicSubtitle("Suivez vos prestations réalisées et demandées.");
        updateDynamicView("Historique", [
            hasHistory
                ? renderHistorySection("Prestations réalisées", provided, "provided")
                : "",
            hasHistory
                ? renderHistorySection("Prestations demandées", requested, "requested")
                : renderEmptyState("Aucun historique disponible", "Vos prestations apparaîtront ici dès qu’elles seront créées.")
        ].filter(Boolean));
    } catch (error) {
        console.error(error);
        showToast("Impossible de charger l’historique.");
    }
}

async function updateHistoryStatus(historyId, status) {
    if (!isLoggedIn || !currentUser?.id) {
        requireAuthOrResume("historyStatus", { historyId, status });
        return false;
    }

    try {
        const res = await fetch(API_BASE + "/api/history/" + historyId + "/status", {
            method: "PUT",
            headers: getAuthHeaders({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify({ status: status })
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToast(data.error || "Impossible de modifier le statut.");
            return false;
        }

        await loadHistoryBadge();

        if (currentPublicationView === "history") {
            await loadServiceHistory();
        }

        return true;
    } catch (error) {
        console.error(error);
        showToast("Impossible de modifier le statut.");
        return false;
    }
}

function renderHistorySection(title, items, sectionType) {
    const cards = items.length
        ? items.map(item => renderHistoryCard(item, sectionType)).join("")
        : `<div class="history-empty-section">Aucun historique disponible</div>`;

    return `
        <section class="history-section">
            <div class="history-section-header">
                <h3>${title}</h3>
                <span>${items.length}</span>
            </div>
            <div class="history-list">
                ${cards}
            </div>
        </section>
    `;
}

function renderHistoryCard(item, sectionType) {
    const status = normalizeHistoryStatus(item.status);
    const otherUserLabel = sectionType === "provided" ? "Client" : "Prestataire";
    const otherUserName = item.otherUserName || (sectionType === "provided" ? item.clientName : item.providerName) || "Non assigné";
    const date = item.updatedAt || item.createdAt;
    const publicationLabel = item.requestId
        ? "Demande #" + item.requestId
        : item.offerId
            ? "Offre #" + item.offerId
            : "Publication liée";

    return `
        <article class="history-card">
            <div class="history-card-main">
                <div class="history-card-title-row">
                    <h4>${escapeHtml(item.title || "Prestation")}</h4>
                    <span class="history-status history-status-${status.key}">
                        ${status.label}
                    </span>
                </div>
                <p>${escapeHtml(item.description || "Aucune description fournie.")}</p>
                <div class="history-meta">
                    <span>${otherUserLabel} : ${escapeHtml(otherUserName)}</span>
                    <span>${formatHistoryDate(date)}</span>
                    <span>${publicationLabel}</span>
                </div>
            </div>
        </article>
    `;
}

function normalizeHistoryStatus(status) {
    if (PUBLICATION_STATUSES[status]) {
        return normalizePublicationStatus(status);
    }

    if (status === "COMPLETED") {
        return { key: "completed", label: "Terminée" };
    }

    if (status === "CANCELLED") {
        return { key: "cancelled", label: "Annulée" };
    }

    return { key: "pending", label: "En attente" };
}

function formatHistoryDate(value) {
    if (!value) {
        return "Date non précisée";
    }

    return new Date(value).toLocaleString();
}

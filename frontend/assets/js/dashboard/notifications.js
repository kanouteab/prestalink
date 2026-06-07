async function loadNotifications() {
    if (!isLoggedIn || !currentUser?.id) {
        return [];
    }

    const res = await fetch(API_BASE + "/api/notifications/me", {
        headers: getAuthHeaders()
    });

    const notifications = res.ok ? await res.json() : [];
    renderNotifications(notifications);
    updateNotificationBadgeFromItems(notifications);
    return notifications;
}

async function updateNotificationBadge() {
    const badge = document.getElementById("notificationBadge");

    if (!badge || !isLoggedIn || !currentUser?.id) {
        if (badge) badge.textContent = "0";
        return 0;
    }

    const res = await fetch(API_BASE + "/api/notifications/me/unread-count", {
        headers: getAuthHeaders()
    });
    const count = res.ok ? Number(await res.text()) : 0;
    badge.textContent = String(count);
    badge.classList.toggle("is-empty", count === 0);
    return count;
}

function updateNotificationBadgeFromItems(notifications) {
    const count = (notifications || []).filter(notification => !notification.isRead).length;
    const badge = document.getElementById("notificationBadge");

    if (badge) {
        badge.textContent = String(count);
        badge.classList.toggle("is-empty", count === 0);
    }
}

function renderNotifications(notifications) {
    const container = document.getElementById("notificationsList");

    if (!container) return;

    if (!notifications || notifications.length === 0) {
        container.innerHTML = `<div class="notification-empty">Aucune notification</div>`;
        return;
    }

    container.innerHTML = notifications.map(notification => `
        <button type="button"
                class="notification-item ${notification.isRead ? "" : "is-unread"}"
                onclick="markNotificationRead(${Number(notification.id)})">
            <span class="notification-dot"></span>
            <span class="notification-content">
                <strong>${escapeHtml(notification.message || notification.title || notificationText(notification.type))}</strong>
                <small>${formatNotificationTime(notification.createdAt)}</small>
            </span>
        </button>
    `).join("");
}

function notificationText(type) {
    const labels = {
        NEW_REQUEST: "Nouvelle demande reçue",
        NEW_OFFER: "Nouvelle offre publiée",
        NEW_COMMENT: "Nouveau commentaire reçu",
        NEW_RATING: "Nouvelle note reçue",
        PUBLICATION_EXPIRED: "Votre publication a expiré",
        OFFER_VIEWED: "Votre offre a été consultée",
        REQUEST_VIEWED: "Votre demande a été consultée"
    };

    return labels[type] || "Notifications";
}

function formatNotificationTime(value) {
    if (!value) {
        return "";
    }

    return new Date(value).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    });
}

async function toggleNotificationPanel() {
    const panel = document.getElementById("notificationPanel");

    if (!panel) return;

    panel.classList.toggle("show");

    if (panel.classList.contains("show")) {
        await loadNotifications();
    }
}

function closeNotificationPanel() {
    document.getElementById("notificationPanel")?.classList.remove("show");
}

async function markNotificationRead(notificationId) {
    await fetch(API_BASE + "/api/notifications/" + notificationId + "/read", {
        method: "PUT",
        headers: getAuthHeaders()
    });

    await loadNotifications();
}

async function markAllNotificationsRead() {
    await fetch(API_BASE + "/api/notifications/read-all", {
        method: "PUT",
        headers: getAuthHeaders()
    });

    await loadNotifications();
}

async function recordPublicationView(publication) {
    if (!isLoggedIn || !currentUser?.id || !publication?.id || !publication?.publicationType) {
        return;
    }

    if (String(publication.authorId || "") === String(currentUser.id)) {
        return;
    }

    const type = publication.publicationType === "OFFER" ? "offers" : "requests";
    const key = "publication-view-" + type + "-" + publication.id + "-" + currentUser.id;
    const now = Date.now();
    const previous = Number(localStorage.getItem(key) || 0);

    if (now - previous < 10 * 60 * 1000) {
        return;
    }

    localStorage.setItem(key, String(now));

    await fetch(API_BASE + "/api/" + type + "/" + publication.id + "/view", {
        method: "POST",
        headers: getAuthHeaders()
    }).catch(() => {});
}

document.addEventListener("click", function (event) {
    const center = event.target.closest?.(".notification-center");

    if (!center) {
        closeNotificationPanel();
    }
});

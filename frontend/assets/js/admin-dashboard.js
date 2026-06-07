const ADMIN_TOKEN_KEY = "prestalinkAdminToken";
const ADMIN_INFO_KEY = "prestalinkAdmin";

function getAdminToken() {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

function setAdminSession(token, admin) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    sessionStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(admin));
    window.prestalinkAdminToken = token;
}

function clearAdminSession() {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_INFO_KEY);
    window.prestalinkAdminToken = "";
}

function adminAuthHeaders(json) {
    const headers = {
        "Authorization": "Bearer " + getAdminToken()
    };
    if (json) {
        headers["Content-Type"] = "application/json";
    }
    return headers;
}

async function handleAdminLogin(event) {
    event.preventDefault();
    const error = document.getElementById("adminLoginError");
    error.textContent = "";

    try {
        const response = await fetch(API_BASE + "/api/admin/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                email: document.getElementById("adminEmail").value.trim(),
                password: document.getElementById("adminPassword").value
            })
        });
        if (!response.ok) {
            throw new Error("Email ou mot de passe administrateur incorrect");
        }

        const data = await response.json();
        setAdminSession(data.token, data.admin);
        window.location.href = "admin.html";
    } catch (adminError) {
        error.textContent = adminError.message;
    }
}

function showAdminRecoveryPanel(panelId) {
    ["adminForgotPasswordPanel", "adminFindEmailPanel"].forEach(function (id) {
        const panel = document.getElementById(id);
        if (panel) {
            panel.classList.toggle("d-none", id !== panelId || !panel.classList.contains("d-none"));
        }
    });
}

async function requestAdminPasswordReset() {
    const message = document.getElementById("adminPasswordRecoveryMessage");
    message.textContent = "";
    message.style.color = "#198754";

    try {
        const response = await fetch(API_BASE + "/api/admin/auth/forgot-password", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                email: document.getElementById("adminForgotEmail").value.trim(),
                username: document.getElementById("adminForgotEmail").value.trim()
            })
        });
        const data = await response.json().catch(() => ({}));
        message.textContent = data.message || "Si un compte existe, un lien de réinitialisation a été envoyé.";
        if (data.resetCode) {
            document.getElementById("adminResetToken").value = data.resetCode;
        }
    } catch (error) {
        message.style.color = "#b42318";
        message.textContent = "Impossible de contacter le serveur.";
    }
}

async function resetAdminPassword() {
    const message = document.getElementById("adminPasswordRecoveryMessage");
    message.textContent = "";
    message.style.color = "#198754";

    try {
        const response = await fetch(API_BASE + "/api/admin/auth/reset-password", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                token: document.getElementById("adminResetToken").value.trim(),
                newPassword: document.getElementById("adminNewPassword").value,
                confirmPassword: document.getElementById("adminConfirmNewPassword").value
            })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            message.style.color = "#b42318";
            message.textContent = data.message || data.error || "Réinitialisation impossible.";
            return;
        }

        message.textContent = data.message || "Mot de passe réinitialisé avec succès";
    } catch (error) {
        message.style.color = "#b42318";
        message.textContent = "Impossible de contacter le serveur.";
    }
}

async function findAdminEmail() {
    const message = document.getElementById("adminEmailRecoveryMessage");
    message.textContent = "";
    message.style.color = "#198754";

    try {
        const response = await fetch(API_BASE + "/api/admin/auth/find-email", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                username: document.getElementById("adminFindUsername").value.trim(),
                fullName: document.getElementById("adminFindFullName").value.trim()
            })
        });
        const data = await response.json().catch(() => ({}));

        if (data.found && data.maskedEmail) {
            message.textContent = "Compte trouvé : " + data.maskedEmail;
            return;
        }

        message.style.color = "#b42318";
        message.textContent = data.message || "Aucun compte trouvé avec ces informations";
    } catch (error) {
        message.style.color = "#b42318";
        message.textContent = "Impossible de contacter le serveur.";
    }
}

async function initializeAdminDashboard() {
    const token = getAdminToken();
    if (!token) {
        window.location.href = "admin-login.html";
        return;
    }

    window.prestalinkAdminToken = token;

    try {
        const response = await fetch(API_BASE + "/api/admin/auth/me", {
            headers: adminAuthHeaders(false)
        });
        if (!response.ok) {
            throw new Error("Session administrateur expirée");
        }
        const admin = await response.json();
        sessionStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(admin));
        renderAdminIdentity(admin);
        loadAdminHome();
    } catch (error) {
        clearAdminSession();
        window.location.href = "admin-login.html";
    }
}

function renderAdminIdentity(admin) {
    const identity = document.getElementById("adminIdentity");
    if (identity) {
        identity.textContent = admin.fullName + " - " + admin.role;
    }
}

function loadAdminHome() {
    const dynamicView = document.getElementById("dynamicView");
    dynamicView.innerHTML = `
        <div class="admin-action-grid">
            <button class="admin-action-card" type="button" onclick="loadAdminBanners()">
                <strong>Gérer la bannière d'accueil</strong>
                <span>Créer, modifier et activer la bannière principale.</span>
            </button>
            <button class="admin-action-card" type="button" onclick="loadAdminBranding()">
                <strong>Branding</strong>
                <span>Gérer l'identité visuelle active de PrestaLink.</span>
            </button>
            <button class="admin-action-card" type="button" onclick="loadAdminUsers()">
                <strong>Gérer les utilisateurs</strong>
                <span>Consulter les comptes inscrits.</span>
            </button>
            <button class="admin-action-card" type="button" onclick="loadAdminPublications()">
                <strong>Gérer les publications</strong>
                <span>Voir les offres et demandes.</span>
            </button>
            <button class="admin-action-card" type="button" onclick="loadAdminReports()">
                <strong>Voir les signalements</strong>
                <span>Examiner les rapports de modération.</span>
            </button>
            <button class="admin-action-card" type="button" onclick="loadAdminStats()">
                <strong>Voir les statistiques</strong>
                <span>Suivre les volumes principaux.</span>
            </button>
        </div>
    `;
}

async function adminFetch(path) {
    const response = await fetch(API_BASE + path, {
        headers: adminAuthHeaders(false)
    });
    if (response.status === 401 || response.status === 403) {
        clearAdminSession();
        window.location.href = "admin-login.html";
        throw new Error("Session administrateur expirée");
    }
    if (!response.ok) {
        throw new Error("Impossible de charger cette section");
    }
    return response.json();
}

async function loadAdminUsers() {
    renderLoading("Utilisateurs");
    const users = await adminFetch("/api/admin/users");
    renderAdminTable("Utilisateurs", ["ID", "Nom", "Email", "Rôle", "Statut", "Création"], users.map(user => [
        user.id,
        user.fullName,
        user.email,
        user.role,
        user.accountStatus,
        formatAdminDate(user.createdAt)
    ]));
}

async function loadAdminPublications() {
    renderLoading("Publications");
    const publications = await adminFetch("/api/admin/publications");
    renderAdminTable("Publications", ["ID", "Type", "Titre", "Statut", "Auteur", "Création"], publications.map(publication => [
        publication.id,
        publication.type,
        publication.title,
        publication.status,
        publication.author,
        formatAdminDate(publication.createdAt)
    ]));
}

async function loadAdminReports() {
    renderLoading("Signalements");
    const reports = await adminFetch("/api/admin/reports");
    renderAdminTable("Signalements", ["ID", "Cible", "Raison", "Publication", "Signalé par", "Utilisateur signalé", "Création"], reports.map(report => [
        report.id,
        report.targetType,
        report.reason,
        [report.publicationType, report.publicationId].filter(Boolean).join(" #"),
        report.reporter,
        report.reportedUser,
        formatAdminDate(report.createdAt)
    ]));
}

async function loadAdminStats() {
    renderLoading("Statistiques");
    const stats = await adminFetch("/api/admin/stats");
    document.getElementById("dynamicView").innerHTML = `
        <div class="admin-section-panel">
            <h3>Statistiques</h3>
            <div class="admin-stat-grid">
                ${adminStat("Utilisateurs", stats.users)}
                ${adminStat("Offres", stats.offers)}
                ${adminStat("Demandes", stats.requests)}
                ${adminStat("Publications", stats.publications)}
                ${adminStat("Signalements", stats.reports)}
            </div>
        </div>
    `;
}

function renderLoading(title) {
    document.getElementById("dynamicView").innerHTML = `
        <div class="admin-section-panel">
            <h3>${escapeHtml(title)}</h3>
            <p class="text-muted">Chargement...</p>
        </div>
    `;
}

function renderAdminTable(title, headers, rows) {
    const body = rows.length
        ? rows.map(row => `<tr>${row.map(value => `<td>${escapeHtml(value ?? "")}</td>`).join("")}</tr>`).join("")
        : `<tr><td colspan="${headers.length}" class="text-muted">Aucune donnée.</td></tr>`;

    document.getElementById("dynamicView").innerHTML = `
        <div class="admin-section-panel">
            <h3>${escapeHtml(title)}</h3>
            <div class="admin-table-wrap">
                <table class="table table-sm align-middle">
                    <thead>
                        <tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
                    </thead>
                    <tbody>${body}</tbody>
                </table>
            </div>
        </div>
    `;
}

function adminStat(label, value) {
    return `
        <div class="admin-stat">
            <strong>${escapeHtml(value ?? 0)}</strong>
            <span>${escapeHtml(label)}</span>
        </div>
    `;
}

function formatAdminDate(value) {
    if (!value) {
        return "";
    }
    return new Date(value).toLocaleString("fr-FR");
}

async function logoutAdmin() {
    try {
        await fetch(API_BASE + "/api/admin/auth/logout", {
            method: "POST",
            headers: adminAuthHeaders(false)
        });
    } finally {
        clearAdminSession();
        window.location.href = "admin-login.html";
    }
}

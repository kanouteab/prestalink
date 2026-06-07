const API_BASE = window.PRESTALINK_CONFIG?.API_BASE || "";
const PENDING_AUTH_ACTION_KEY = "prestalinkPendingAuthAction";

function getPostLoginRedirectUrl() {
    try {
        const pendingAction = JSON.parse(localStorage.getItem(PENDING_AUTH_ACTION_KEY) || "null");
        return pendingAction?.returnUrl || "../prestalink-dashboard.html";
    } catch (error) {
        return "../prestalink-dashboard.html";
    }
}

async function login() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserId");

    const email =
        document.getElementById("emailInput")
            .value
            .trim();

    const password =
        document.getElementById("passwordInput")
            .value
            .trim();

    const message =
        document.getElementById("message");

    if (!email || !password) {

        message.style.color = "red";

        message.textContent =
            "Email et mot de passe obligatoires.";

        return;
    }

    try {

        const res = await fetch(
            API_BASE + "/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await parseLoginResponse(res);

        if (!res.ok) {

            message.style.color = "red";

            message.textContent =
                data.error ||
                "Email ou mot de passe incorrect.";

            return;
        }

        const user = data.user || data;

        if (!user || !user.id) {
            message.style.color = "red";
            message.textContent = "Réponse de connexion invalide.";
            return;
        }

        localStorage.setItem(
            "currentUser",
            JSON.stringify(user)
        );

        localStorage.setItem(
            "currentUserId",
            String(user.id)
        );

        message.style.color = "green";

        message.textContent =
            "Connexion réussie...";

        setTimeout(function () {

            window.location.href = getPostLoginRedirectUrl();

        }, 800);

    } catch (error) {

        message.style.color = "red";

        message.textContent =
            "Impossible de contacter le serveur.";
    }
}

async function parseLoginResponse(res) {
    const text = await res.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        return {
            error: res.ok
                ? "Réponse de connexion invalide."
                : "Email ou mot de passe incorrect."
        };
    }
}

function showRecoveryPanel(panelId) {
    ["forgotPasswordPanel", "findEmailPanel"].forEach(function (id) {
        const panel = document.getElementById(id);
        if (panel) {
            panel.classList.toggle("hidden", id !== panelId || !panel.classList.contains("hidden"));
        }
    });
}

async function requestPasswordReset() {
    const message = document.getElementById("passwordRecoveryMessage");
    message.textContent = "";
    message.style.color = "#198754";

    try {
        const response = await fetch(API_BASE + "/api/auth/forgot-password", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                email: document.getElementById("forgotPasswordEmailInput").value.trim()
            })
        });
        const data = await parseLoginResponse(response);

        message.textContent = data.message || "Si un compte existe, un lien de réinitialisation a été envoyé.";
        if (data.resetCode) {
            document.getElementById("resetTokenInput").value = data.resetCode;
        }
    } catch (error) {
        message.style.color = "#dc3545";
        message.textContent = "Impossible de contacter le serveur.";
    }
}

async function resetPassword() {
    const message = document.getElementById("passwordRecoveryMessage");
    message.textContent = "";
    message.style.color = "#198754";

    try {
        const response = await fetch(API_BASE + "/api/auth/reset-password", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                token: document.getElementById("resetTokenInput").value.trim(),
                newPassword: document.getElementById("newPasswordInput").value,
                confirmPassword: document.getElementById("confirmNewPasswordInput").value
            })
        });
        const data = await parseLoginResponse(response);

        if (!response.ok) {
            message.style.color = "#dc3545";
            message.textContent = data.error || data.message || "Réinitialisation impossible.";
            return;
        }

        message.textContent = data.message || "Mot de passe réinitialisé avec succès";
    } catch (error) {
        message.style.color = "#dc3545";
        message.textContent = "Impossible de contacter le serveur.";
    }
}

async function findEmail() {
    const message = document.getElementById("emailRecoveryMessage");
    message.textContent = "";
    message.style.color = "#198754";

    try {
        const response = await fetch(API_BASE + "/api/auth/find-email", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                phone: document.getElementById("findEmailPhoneInput").value.trim(),
                fullName: document.getElementById("findEmailFullNameInput").value.trim()
            })
        });
        const data = await parseLoginResponse(response);

        if (data.found && data.maskedEmail) {
            message.textContent = "Compte trouvé : " + data.maskedEmail;
            return;
        }

        message.style.color = "#dc3545";
        message.textContent = data.message || "Aucun compte trouvé avec ces informations";
    } catch (error) {
        message.style.color = "#dc3545";
        message.textContent = "Impossible de contacter le serveur.";
    }
}


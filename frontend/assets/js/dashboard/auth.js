function configureMenuByRole() {
    if (!currentUser) return;

    const clientItems = document.querySelectorAll(".menu-client");
    const providerItems = document.querySelectorAll(".menu-provider");

    if (currentUser.role === "CLIENT") {
        providerItems.forEach(item => item.style.display = "none");
    }

    if (currentUser.role === "PRESTATAIRE") {
        clientItems.forEach(item => item.style.display = "none");
    }
}

function getCurrentUserId() {
    if (!currentUser || currentUser.id === undefined || currentUser.id === null) {
        return null;
    }

    return String(currentUser.id);
}

function isCurrentUserOffer(offer) {
    const userId = getCurrentUserId();

    return userId !== null &&
            offer.provider &&
            String(offer.provider.id) === userId;
}

function isCurrentUserRequest(request) {
    const userId = getCurrentUserId();

    return userId !== null &&
            request.client &&
            String(request.client.id) === userId;
}

function toggleUserDropdown() {
    document.getElementById("userDropdown").classList.toggle("show");
}

let selectedProfilePhotoFile = null;
let selectedProfilePhotoPreviewUrl = "";

function logout() {
    closeUserDropdown();
    resetPrivateSidebarBadges();
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserId");

    window.location.href = "prestalink-dashboard.html";
}

function openProfileModal() {
    if (!requireAuthOrResume("openProfile")) {
        return;
    }

    closeUserDropdown()
    document.getElementById("userDropdown").classList.remove("show");

    document.getElementById("profileFullName").value = currentUser.fullName || "";
    document.getElementById("profileEmail").value = currentUser.email || "";
    document.getElementById("profilePhone").value = currentUser.phone || "";
    document.getElementById("profileStreetAddress").value =
        currentUser.streetAddress || "";

    document.getElementById("profileCity").value =
        currentUser.city || "";

    document.getElementById("profilePostalCode").value =
        currentUser.postalCode || "";

    document.getElementById("profileLatitude").value =
        currentUser.latitude ?? "";

    document.getElementById("profileLongitude").value =
        currentUser.longitude ?? "";

    document.getElementById("profileCountry").value =
        isOtherCountry(currentUser.country) ? "Autre" : currentUser.country || "";

    document.getElementById("profileCustomCountry").value =
        localStorage.getItem("customCountry") || "";

    document.getElementById("profileCustomCurrency").value =
        localStorage.getItem("customCurrency") || "";

    selectedProfilePhotoFile = null;
    renderProfilePhotoPreview(currentUser.photoUrl);
    handleProfileCountryChange();
    updateProfileVerificationPanel();

    document.getElementById("profileModal").classList.add("show");
}

function closeProfileModal() {
    document.getElementById("profileModal").classList.remove("show");
}

function handleProfileCountryChange() {
    const selectedCountry = document.getElementById("profileCountry").value;
    const customCountry = document.getElementById("profileCustomCountry");
    const customCurrency = document.getElementById("profileCustomCurrency");
    const showCustomFields = isOtherCountry(selectedCountry);

    customCountry.style.display = showCustomFields ? "block" : "none";
    customCurrency.style.display = showCustomFields ? "block" : "none";
}

async function saveProfile() {
    if (!requireAuthOrResume("saveProfile", { formData: collectProfileFormData() })) {
        return;
    }

    const selectedCountry = document.getElementById("profileCountry").value;
    const customCountry = document.getElementById("profileCustomCountry").value.trim();
    const customCurrency = document.getElementById("profileCustomCurrency").value.trim();

    if (isOtherCountry(selectedCountry) && (!customCountry || !customCurrency)) {
        showToast("Veuillez renseigner le pays et la devise", "error");
        addEvent("Devise personnalisee manquante");
        return;
    }

    const updatedUser = {
        fullName: document.getElementById("profileFullName").value,
        email: document.getElementById("profileEmail").value,
        phone: document.getElementById("profilePhone").value,
        role: currentUser.role,
        streetAddress: document.getElementById("profileStreetAddress").value,
        city: document.getElementById("profileCity").value,
        postalCode: document.getElementById("profilePostalCode").value,
        country: isOtherCountry(selectedCountry) ? "Autre" : selectedCountry,
        latitude: parseNullableNumber(document.getElementById("profileLatitude").value),
        longitude: parseNullableNumber(document.getElementById("profileLongitude").value)
    };

    const res = await fetch(API_BASE + "/api/users/" + currentUser.id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedUser)
    });

    const data = await res.json();

    if (!res.ok) {
        showToast("Erreur modification profil", "error");
        addEvent("Erreur modification profil");
        return;
    }

    if (isOtherCountry(selectedCountry)) {
        localStorage.setItem("customCountry", customCountry);
        localStorage.setItem("customCurrency", customCurrency);
    } else {
        localStorage.removeItem("customCountry");
        localStorage.removeItem("customCurrency");
    }

    localStorage.setItem("currentUser", JSON.stringify(data));
    updateLocalCurrentUser(data);

    showToast("Profil modifié avec succès", "success");
    addEvent("Profil modifié avec succès");

    closeProfileModal();
}

async function handleProfilePhotoInput(input) {
    if (!requireAuthOrResume("uploadProfilePhoto")) {
        input.value = "";
        return;
    }

    const file = input.files && input.files[0];
    input.value = "";

    if (!file || !validateSelectedImage(file)) {
        return;
    }

    try {
        selectedProfilePhotoFile = await compressImageFile(file);

        if (selectedProfilePhotoPreviewUrl) {
            URL.revokeObjectURL(selectedProfilePhotoPreviewUrl);
        }

        selectedProfilePhotoPreviewUrl = URL.createObjectURL(selectedProfilePhotoFile);
        renderProfilePhotoPreview(selectedProfilePhotoPreviewUrl);
        const savedUser = await uploadProfilePhoto(selectedProfilePhotoFile);
        selectedProfilePhotoFile = null;
        localStorage.setItem("currentUser", JSON.stringify(savedUser));
        updateLocalCurrentUser(savedUser);
        renderProfilePhotoPreview(savedUser.photoUrl);
        showToast("Photo de profil mise à jour");
    } catch (error) {
        showToast(error.message || "Upload image impossible.");
    }
}

async function uploadProfilePhoto(file) {
    if (!requireAuthOrResume("uploadProfilePhoto")) {
        return null;
    }

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(API_BASE + "/api/users/me/photo", {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData
    });

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || await res.text() || "Upload image impossible.");
    }

    return res.json();
}

function renderProfilePhotoPreview(url) {
    const preview = document.getElementById("profilePhotoPreview");

    if (!preview) return;

    const photoUrl = resolveAssetUrl(url || "");
    preview.innerHTML = photoUrl
        ? `<img src="${escapeHtml(photoUrl)}" alt="Photo de profil">`
        : `<span>${escapeHtml((currentUser?.fullName || "U").charAt(0).toUpperCase())}</span>`;
}

function collectProfileFormData() {
    return {
        fullName: document.getElementById("profileFullName")?.value || "",
        email: document.getElementById("profileEmail")?.value || "",
        phone: document.getElementById("profilePhone")?.value || "",
        streetAddress: document.getElementById("profileStreetAddress")?.value || "",
        city: document.getElementById("profileCity")?.value || "",
        postalCode: document.getElementById("profilePostalCode")?.value || "",
        country: document.getElementById("profileCountry")?.value || "",
        customCountry: document.getElementById("profileCustomCountry")?.value || "",
        customCurrency: document.getElementById("profileCustomCurrency")?.value || "",
        latitude: document.getElementById("profileLatitude")?.value || "",
        longitude: document.getElementById("profileLongitude")?.value || ""
    };
}

function restoreProfileForm(formData = {}) {
    document.getElementById("profileFullName").value = formData.fullName || "";
    document.getElementById("profileEmail").value = formData.email || "";
    document.getElementById("profilePhone").value = formData.phone || "";
    document.getElementById("profileStreetAddress").value = formData.streetAddress || "";
    document.getElementById("profileCity").value = formData.city || "";
    document.getElementById("profilePostalCode").value = formData.postalCode || "";
    document.getElementById("profileCountry").value = formData.country || "";
    document.getElementById("profileCustomCountry").value = formData.customCountry || "";
    document.getElementById("profileCustomCurrency").value = formData.customCurrency || "";
    document.getElementById("profileLatitude").value = formData.latitude || "";
    document.getElementById("profileLongitude").value = formData.longitude || "";
    handleProfileCountryChange();
}

function requestBrowserLocation() {
    if (!navigator.geolocation) {
        showToast("Saisir ma position manuellement");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            document.getElementById("profileLatitude").value = position.coords.latitude.toFixed(6);
            document.getElementById("profileLongitude").value = position.coords.longitude.toFixed(6);
            showToast("Position détectée");
        },
        () => {
            showToast("Localisation refusée");
        },
        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

function parseNullableNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function updateLocalCurrentUser(user) {
    if (!user) return;

    Object.assign(currentUser, user);
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    updateProfileVerificationPanel();
    updateHeaderVerificationBadge();
    renderHeaderUserAvatar();
}

function updateProfileVerificationPanel() {
    const panel = document.getElementById("profileVerificationPanel");
    const message = document.getElementById("profileVerificationMessage");

    if (!panel || !currentUser) return;

    panel.innerHTML = `
        <div class="verification-status-row">
            ${renderVerifiedProfileBadge(currentUser)}
        </div>
        <div class="verification-status-row">
            ${renderEmailVerificationStatus(currentUser)}
            <button type="button" class="verification-action" onclick="resendVerificationEmail()">
                Renvoyer l’email de vérification
            </button>
        </div>
        <div class="verification-status-row">
            ${renderPhoneVerificationStatus(currentUser)}
            <button type="button" class="verification-action" onclick="sendPhoneVerificationCode()">
                Vérifier mon téléphone
            </button>
        </div>
        <div class="phone-verification-form">
            <input id="phoneVerificationCode" maxlength="6" inputmode="numeric" placeholder="Code de vérification">
            <button type="button" class="verification-action verification-action-primary" onclick="verifyPhoneCode()">
                Valider le code
            </button>
        </div>
    `;

    if (message) {
        message.textContent = "";
    }
}

function updateHeaderVerificationBadge() {
    const badge = document.getElementById("currentUserVerification");

    if (!badge || !currentUser) return;

    badge.innerHTML = currentUser.verifiedProfile
        ? '<span class="verified-profile-badge">✓ Profil vérifié</span>'
        : "";
}

async function resendVerificationEmail() {
    const message = document.getElementById("profileVerificationMessage");

    try {
        const res = await fetch(API_BASE + "/api/auth/send-verification-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.id,
                email: currentUser.email
            })
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Impossible d’envoyer l’email de vérification");
        }

        updateLocalCurrentUser(data.user);
        message.textContent = "Email de vérification envoyé";
        showToast("Email de vérification envoyé");
    } catch (error) {
        message.textContent = error.message || "Impossible d’envoyer l’email de vérification";
        showToast(message.textContent);
    }
}

async function sendPhoneVerificationCode() {
    const message = document.getElementById("profileVerificationMessage");
    const phone = document.getElementById("profilePhone").value.trim();

    try {
        const res = await fetch(API_BASE + "/api/auth/send-phone-verification-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.id,
                phone: phone
            })
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Impossible d’envoyer le code");
        }

        updateLocalCurrentUser(data.user);
        message.textContent = "Code de vérification envoyé";
        showToast("Code de vérification envoyé");
    } catch (error) {
        message.textContent = error.message || "Impossible d’envoyer le code";
        showToast(message.textContent);
    }
}

async function verifyPhoneCode() {
    const message = document.getElementById("profileVerificationMessage");
    const code = document.getElementById("phoneVerificationCode").value.trim();

    try {
        const res = await fetch(API_BASE + "/api/auth/verify-phone", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.id,
                code: code
            })
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Code invalide");
        }

        updateLocalCurrentUser(data.user);
        message.textContent = "Vérification réussie";
        showToast("Vérification réussie");
    } catch (error) {
        message.textContent = error.message || "Code invalide";
        showToast(message.textContent);
    }
}

function openLoginPage() {
    window.location.href = "Register/login.html";
}



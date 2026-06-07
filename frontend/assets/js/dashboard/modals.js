function requirePublicationAuth(actionName = "createOffer", payload = {}) {
    return requireAuthOrResume(actionName, payload);
}

function openCreateRequestModal() {
    if (!requirePublicationAuth("createRequest", { formData: collectRequestFormData() })) return;

    closeFabMenu();
    closeCreateOfferModal();

    const modal = document.getElementById("createRequestModal");

    modal.classList.add("show");
    modal.style.display = "flex";
}

function closeCreateRequestModal() {
    const modal = document.getElementById("createRequestModal");

    modal.classList.remove("show");
    modal.style.display = "none";
    resetRequestModal();
}

function closeCreateOfferModal() {
    const modal = document.getElementById("createOfferModal");

    modal.classList.remove("show");
    modal.style.display = "none";
    resetOfferModal();
}

function openCreateOfferModal() {
    if (!requirePublicationAuth("createOffer", { formData: collectOfferFormData() })) return;

    closeFabMenu();
    closeCreateRequestModal();

    const modal = document.getElementById("createOfferModal");

    modal.classList.add("show");
    modal.style.display = "flex";
}

function openNewRequestModal() {
    if (!requirePublicationAuth("createRequest")) return;

    resetRequestModal();
    openCreateRequestModal();
}

function openNewOfferModal() {
    if (!requirePublicationAuth("createOffer")) return;

    resetOfferModal();
    openCreateOfferModal();
}

function resetRequestModal() {
    const modal = document.getElementById("createRequestModal");

    if (!modal) return;

    modal.removeAttribute("data-edit-id");
    document.getElementById("requestModalTitle").textContent = "Créer une demande";
    document.getElementById("requestPublicationBadge").innerHTML = "<span>📨</span>";
    document.getElementById("requestPublicationType").value = "REQUEST";
    document.getElementById("requestTitle").value = "";
    document.getElementById("requestDescription").value = "";
    document.getElementById("requestBudget").value = "";
    document.getElementById("requestLocation").value = "";
    document.getElementById("requestCategoryId").value = "";
    initializePublicationPhotos("request");
    document.getElementById("requestSubmitButton")
        .setAttribute("onclick", "handleRequestSubmit()");
    document.getElementById("requestSubmitButton").textContent = "Publier";
}

function resetOfferModal() {
    const modal = document.getElementById("createOfferModal");

    if (!modal) return;

    modal.removeAttribute("data-edit-id");
    document.getElementById("offerModalTitle").textContent = "Créer une offre";
    document.getElementById("offerPublicationBadge").innerHTML = "<span>🛠️</span>";
    document.getElementById("offerPublicationType").value = "OFFER";
    document.getElementById("offerTitle").value = "";
    document.getElementById("offerDescription").value = "";
    document.getElementById("offerPrice").value = "";
    document.getElementById("offerLocation").value = "";
    document.getElementById("offerCategoryId").value = "";
    initializePublicationPhotos("offer");
    document.getElementById("offerSubmitButton")
        .setAttribute("onclick", "handleOfferSubmit()");
    document.getElementById("offerSubmitButton").textContent = "Publier";
}

function handleOfferSubmit() {
    const editId =
        document.getElementById("createOfferModal")
            .getAttribute("data-edit-id");

    if (!requirePublicationAuth(editId ? "updateOffer" : "submitOffer", {
        publicationId: editId,
        formData: collectOfferFormData()
    })) return;

    if (editId) {
        updateOffer();
    } else {
        submitOffer();
    }
}

function handleRequestSubmit() {
    const editId =
        document.getElementById("createRequestModal")
            .getAttribute("data-edit-id");

    if (!requirePublicationAuth(editId ? "updateRequest" : "submitRequest", {
        publicationId: editId,
        formData: collectRequestFormData()
    })) return;

    if (editId) {
        updateRequest();
    } else {
        submitRequest();
    }
}

function collectOfferFormData() {
    return {
        editId: document.getElementById("createOfferModal")?.getAttribute("data-edit-id") || "",
        publicationType: document.getElementById("offerPublicationType")?.value || "OFFER",
        title: document.getElementById("offerTitle")?.value || "",
        description: document.getElementById("offerDescription")?.value || "",
        price: document.getElementById("offerPrice")?.value || "",
        location: document.getElementById("offerLocation")?.value || "",
        categoryId: document.getElementById("offerCategoryId")?.value || ""
    };
}

function restoreOfferForm(formData = {}) {
    const modal = document.getElementById("createOfferModal");

    if (!modal) return;

    if (formData.editId) {
        modal.setAttribute("data-edit-id", formData.editId);
        document.getElementById("offerSubmitButton").textContent = "Modifier";
    }

    document.getElementById("offerPublicationType").value = formData.publicationType || "OFFER";
    document.getElementById("offerTitle").value = formData.title || "";
    document.getElementById("offerDescription").value = formData.description || "";
    document.getElementById("offerPrice").value = formData.price || "";
    document.getElementById("offerLocation").value = formData.location || "";
    document.getElementById("offerCategoryId").value = formData.categoryId || "";
}

function collectRequestFormData() {
    return {
        editId: document.getElementById("createRequestModal")?.getAttribute("data-edit-id") || "",
        publicationType: document.getElementById("requestPublicationType")?.value || "REQUEST",
        title: document.getElementById("requestTitle")?.value || "",
        description: document.getElementById("requestDescription")?.value || "",
        budget: document.getElementById("requestBudget")?.value || "",
        location: document.getElementById("requestLocation")?.value || "",
        categoryId: document.getElementById("requestCategoryId")?.value || ""
    };
}

function restoreRequestForm(formData = {}) {
    const modal = document.getElementById("createRequestModal");

    if (!modal) return;

    if (formData.editId) {
        modal.setAttribute("data-edit-id", formData.editId);
        document.getElementById("requestSubmitButton").textContent = "Modifier";
    }

    document.getElementById("requestPublicationType").value = formData.publicationType || "REQUEST";
    document.getElementById("requestTitle").value = formData.title || "";
    document.getElementById("requestDescription").value = formData.description || "";
    document.getElementById("requestBudget").value = formData.budget || "";
    document.getElementById("requestLocation").value = formData.location || "";
    document.getElementById("requestCategoryId").value = formData.categoryId || "";
}

function setupModalOutsideClick() {
    const modals = [
        {
            id: "createOfferModal",
            close: closeCreateOfferModal
        },
        {
            id: "createRequestModal",
            close: closeCreateRequestModal
        },
        {
            id: "publicationDetailModal",
            close: closePublicationDetail
        },
        {
            id: "profileModal",
            close: closeProfileModal
        },
        {
            id: "reportModal",
            close: closeReportModal
        }
    ];

    modals.forEach(function (item) {
        const modal = document.getElementById(item.id);

        if (!modal) return;

        modal.addEventListener("mousedown", function (event) {
            if (event.target === modal) {
                item.close();
            }
        });
    });
}

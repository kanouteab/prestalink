const API_BASE = window.PRESTALINK_CONFIG?.API_BASE || "";
const COUNTRY_DATA = {
    "Canada": { flag: "CA", code: "+1" },
    "United States": { flag: "US", code: "+1" },
    "Mauritanie": { flag: "MR", code: "+222" },
    "Mauritania": { flag: "MR", code: "+222" },
    "Senegal": { flag: "SN", code: "+221" },
    "Mali": { flag: "ML", code: "+223" },
    "France": { flag: "FR", code: "+33" },
    "Maroc": { flag: "MA", code: "+212" },
    "Algerie": { flag: "DZ", code: "+213" },
    "Tunisie": { flag: "TN", code: "+216" },
    "Cote d'Ivoire": { flag: "CI", code: "+225" }
};

function isOtherCountry(country) {
    return ["Autre", "Autres", "Other"].includes(country);
}

function handleCountryChange() {
    const selectedCountry = document.getElementById("countryRegister").value;
    const country = isOtherCountry(selectedCountry) ? "Autre" : selectedCountry;
    const flag = document.getElementById("countryFlag");
    const codeInput = document.getElementById("countryCodeRegister");
    const customCountryInput = document.getElementById("customCountryRegister");
    const customCurrencyInput = document.getElementById("customCurrencyRegister");
    const showCustomFields = isOtherCountry(country);

    if (customCountryInput && customCurrencyInput) {
        customCountryInput.style.display = showCustomFields ? "block" : "none";
        customCurrencyInput.style.display = showCustomFields ? "block" : "none";
    }

    if (showCustomFields) {
        flag.textContent = "OTHER";
        codeInput.value = "";
        codeInput.readOnly = false;
        codeInput.placeholder = "+ indicatif";
        return;
    }

    if (COUNTRY_DATA[country]) {
        flag.textContent = COUNTRY_DATA[country].flag;
        codeInput.value = COUNTRY_DATA[country].code;
        codeInput.readOnly = true;
        return;
    }

    flag.textContent = "OTHER";
    codeInput.value = "";
    codeInput.readOnly = true;
}
async function register() {
    console.log("Bouton Créer le compte cliqué");

    const message = document.getElementById("message");

    const fullName = document.getElementById("fullNameRegister").value.trim();
    const email = document.getElementById("emailRegister").value.trim();
    const countryCode = document.getElementById("countryCodeRegister").value.trim();
    const phoneNumber = document.getElementById("phoneRegister").value.trim();
    const phone = countryCode + " " + phoneNumber;

    const password = document.getElementById("passwordRegister").value.trim();
    const confirmPassword = document.getElementById("confirmPasswordRegister").value.trim();

    const streetAddress = document.getElementById("streetAddressRegister").value.trim();
    const postalCode = document.getElementById("postalCodeRegister").value.trim();
    const selectedCountry = document.getElementById("countryRegister").value;
    const customCountry = document.getElementById("customCountryRegister").value.trim();
    const customCurrency = document.getElementById("customCurrencyRegister").value.trim();
    const country = isOtherCountry(selectedCountry) ? "Autre" : selectedCountry;

    if (
        !fullName ||
        !email ||
        !countryCode ||
        !phoneNumber ||
        !password ||
        !confirmPassword ||
        !country ||
        (isOtherCountry(selectedCountry) && (!customCountry || !customCurrency))
    ) {
        message.style.color = "red";

        message.textContent =
            "Veuillez renseigner tous les champs obligatoires.";

        return;
    }

    if (password.length < 8 || password.length > 12) {
        message.style.color = "red";
        message.textContent = "Le mot de passe doit contenir entre 8 et 12 caractères.";
        return;
    }

    if (!/^[A-Z]/.test(password)) {
        message.style.color = "red";
        message.textContent = "Le mot de passe doit commencer par une lettre majuscule.";
        return;
    }

    const digitCount = (password.match(/\d/g) || []).length;

    if (digitCount < 1 || digitCount > 4) {
        message.style.color = "red";

        message.textContent =
            "Le mot de passe doit contenir entre 1 et 4 chiffres.";

        return;
    }

    if (digitCount > 4) {
        message.style.color = "red";
        message.textContent = "Le mot de passe ne doit pas contenir plus de 4 chiffres.";
        return;
    }

    const specialChars = password.match(/[@#$%!*]/g) || [];

    const specialCount = specialChars.length;

    if (specialCount !== 1) {
        message.style.color = "red";

        message.textContent =
            "Le mot de passe doit contenir exactement un caractère spécial parmi [@, #, $, %, !, *].";

        return;
    }



    if (password !== confirmPassword) {
        message.style.color = "red";
        message.textContent = "Les deux mots de passe ne correspondent pas.";
        return;
    }

    try {
        const res = await fetch(API_BASE + "/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName,
                email,
                phone,
                password,
                streetAddress,
                postalCode,
                country
            })
        });

        const data = await res.json();

        if (!res.ok) {
            message.style.color = "red";
            message.textContent = data.error || "Erreur lors de la création du compte.";
            return;
        }

        message.style.color = "green";
        message.textContent = "Compte créé avec succès. Vérifiez votre email, puis connectez-vous.";

        if (isOtherCountry(selectedCountry)) {
            localStorage.setItem("customCountry", customCountry);
            localStorage.setItem("customCurrency", customCurrency);
        }

        setTimeout(function () {
            window.location.href = "login.html";
        }, 1200);

    } catch (error) {
        console.error(error);
        message.style.color = "red";
        message.textContent = "Impossible de contacter le serveur.";
    }
}
document.addEventListener("DOMContentLoaded", handleCountryChange);


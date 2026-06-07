const COUNTRY_CURRENCIES = {
    canada: { code: "CAD", symbol: "$" },
    "united states": { code: "USD", symbol: "$" },
    "etats unis": { code: "USD", symbol: "$" },
    "etats-unis": { code: "USD", symbol: "$" },
    france: { code: "EUR", symbol: "€" },
    senegal: { code: "XOF", symbol: "FCFA" },
    mali: { code: "XOF", symbol: "FCFA" },
    "cote d'ivoire": { code: "XOF", symbol: "FCFA" },
    mauritanie: { code: "MRU", symbol: "UM" },
    mauritania: { code: "MRU", symbol: "UM" },
    maroc: { code: "MAD", symbol: "DH" },
    morocco: { code: "MAD", symbol: "DH" },
    algerie: { code: "DZD", symbol: "DA" },
    algeria: { code: "DZD", symbol: "DA" },
    tunisie: { code: "TND", symbol: "DT" },
    tunisia: { code: "TND", symbol: "DT" }
};

function normalizeCountryName(country) {
    return (country || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[’]/g, "'")
            .trim();
}

function isOtherCountry(country) {
    const normalized = normalizeCountryName(country);

    return normalized === "other" ||
            normalized === "autre" ||
            normalized === "autres";
}

function getCurrencyForCountry(country) {
    const normalizedCountry = normalizeCountryName(country);
    const customCountry = normalizeCountryName(localStorage.getItem("customCountry"));

    if (isOtherCountry(country) || (customCountry && normalizedCountry === customCountry)) {
        const customCurrency =
                localStorage.getItem("customCurrency") || "";

        return {
            code: customCurrency,
            symbol: customCurrency || "$"
        };
    }

    return COUNTRY_CURRENCIES[normalizedCountry] ||
            { code: "USD", symbol: "$" };
}

function getDisplayCountry() {
    const country = currentUser?.country || "";

    if (isOtherCountry(country)) {
        return localStorage.getItem("customCountry") || country;
    }

    return country;
}

function formatMoney(amount, country = "") {
    if (amount === null || amount === undefined || amount === "") {
        return "Budget libre";
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
        return "Budget libre";
    }

    const currency = getCurrencyForCountry(country);
    const formattedAmount = numericAmount.toLocaleString("fr-CA", {
        maximumFractionDigits: 2
    });

    return `${formattedAmount} ${currency.symbol}`;
}


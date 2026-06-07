let activeChatContext = null;

function getConversationKey(userId, otherUserId, publicationType, publicationId) {
    const first = Math.min(Number(userId), Number(otherUserId));
    const second = Math.max(Number(userId), Number(otherUserId));
    const contextType = publicationType || "Publication";
    const contextId = publicationId || "none";

    return "direct:" + first + ":" + second + ":" + contextType + ":" + contextId;
}

function ensureChatDialog() {
    let dialog = document.getElementById("floatingChatDialog");

    if (dialog) {
        return dialog;
    }

    dialog = document.createElement("section");
    dialog.id = "floatingChatDialog";
    dialog.className = "floating-chat-dialog";
    dialog.innerHTML = `
        <div class="floating-chat-header">
            <div>
                <strong id="chatDialogTitle">Discussion</strong>
                <small id="chatDialogContext"></small>
            </div>
            <div class="floating-chat-controls">
                <button type="button" title="Minimiser" aria-label="Minimiser" onclick="minimizeChatDialog()">−</button>
                <button type="button" title="Agrandir" aria-label="Agrandir" onclick="toggleMaximizeChatDialog()">□</button>
                <button type="button" title="Fermer" aria-label="Fermer" onclick="closeChatDialog()">×</button>
            </div>
        </div>
        <div class="floating-chat-context" id="chatPublicationContext"></div>
        <div class="floating-chat-messages" id="chatMessagesList"></div>
        <form class="floating-chat-form" onsubmit="sendChatMessage(event)">
            <input id="chatMessageInput" autocomplete="off" placeholder="Écrire un message...">
            <button type="submit">Envoyer</button>
        </form>
    `;

    document.body.appendChild(dialog);
    return dialog;
}

async function openPublicationChat(context) {
    if (!requireAuthOrResume("contactPublication", {
        authorId: context?.ownerId,
        authorName: context?.ownerName,
        publicationType: context?.publicationType,
        publicationId: context?.publicationId,
        publicationTitle: context?.publicationTitle
    })) {
        return;
    }

    if (!context?.ownerId || String(context.ownerId) === String(currentUser.id)) {
        showToast("Vous ne pouvez pas discuter avec vous-même.");
        return;
    }

    const conversationKey = getConversationKey(
        currentUser.id,
        context.ownerId,
        context.publicationType,
        context.publicationId
    );

    if (activeChatContext?.conversationKey === conversationKey) {
        focusChatDialog();
        return;
    }

    activeChatContext = {
        ...context,
        conversationKey
    };

    const dialog = ensureChatDialog();
    dialog.classList.remove("is-minimized", "is-hidden");
    dialog.classList.add("is-open");

    document.getElementById("chatDialogTitle").textContent =
        "Discussion avec " + activeChatContext.ownerName;
    document.getElementById("chatDialogContext").textContent =
        activeChatContext.publicationType || "";
    document.getElementById("chatPublicationContext").textContent =
        activeChatContext.publicationTitle
            ? "Publication : " + activeChatContext.publicationTitle
            : "";

    await loadChatConversation();
    focusChatDialog();
}

function focusChatDialog() {
    const dialog = ensureChatDialog();

    dialog.classList.remove("is-minimized", "is-hidden");
    dialog.classList.add("is-open");

    setTimeout(function () {
        document.getElementById("chatMessageInput")?.focus();
    }, 0);
}

async function loadChatConversation() {
    const container = document.getElementById("chatMessagesList");

    if (!container || !activeChatContext) return;

    container.innerHTML = `<div class="floating-chat-empty">Chargement de la discussion...</div>`;

    try {
        const url =
            API_BASE +
            "/api/chat/conversation?userId=" + encodeURIComponent(currentUser.id) +
            "&otherUserId=" + encodeURIComponent(activeChatContext.ownerId) +
            "&publicationType=" + encodeURIComponent(activeChatContext.publicationType || "") +
            "&publicationId=" + encodeURIComponent(activeChatContext.publicationId || "");

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error("Impossible de charger la discussion.");
        }

        const messages = await res.json();
        renderChatMessages(messages);
    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="floating-chat-empty">Impossible de charger la discussion.</div>`;
    }
}

function renderChatMessages(messages) {
    const container = document.getElementById("chatMessagesList");

    if (!container) return;

    if (!messages || messages.length === 0) {
        container.innerHTML = `<div class="floating-chat-empty">Aucun message pour le moment.</div>`;
        return;
    }

    container.innerHTML = messages.map(message => {
        const mine = String(message.senderId) === String(currentUser.id);

        return `
            <div class="chat-message ${mine ? "chat-message-mine" : "chat-message-other"}">
                <span>${escapeHtml(message.content || "")}</span>
                <small>${message.sentAt ? new Date(message.sentAt).toLocaleString() : ""}</small>
            </div>
        `;
    }).join("");

    container.scrollTop = container.scrollHeight;
}

async function sendChatMessage(event) {
    event.preventDefault();

    if (!activeChatContext) return;

    const input = document.getElementById("chatMessageInput");
    const content = input.value.trim();

    if (!content) {
        input.focus();
        return;
    }

    try {
        const res = await fetch(API_BASE + "/api/chat/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                senderId: currentUser.id,
                receiverId: activeChatContext.ownerId,
                content: content,
                conversationKey: activeChatContext.conversationKey,
                publicationType: activeChatContext.publicationType,
                publicationId: activeChatContext.publicationId,
                publicationTitle: activeChatContext.publicationTitle
            })
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToast(data.error || "Impossible d’envoyer le message.");
            return;
        }

        input.value = "";
        await loadChatConversation();
        input.focus();
    } catch (error) {
        console.error(error);
        showToast("Impossible d’envoyer le message.");
    }
}

function minimizeChatDialog() {
    document.getElementById("floatingChatDialog")?.classList.add("is-minimized");
}

function toggleMaximizeChatDialog() {
    document.getElementById("floatingChatDialog")?.classList.toggle("is-maximized");
    focusChatDialog();
}

function closeChatDialog() {
    const dialog = document.getElementById("floatingChatDialog");

    if (dialog) {
        dialog.classList.add("is-hidden");
        dialog.classList.remove("is-open", "is-maximized", "is-minimized");
    }
}

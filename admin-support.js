(function () {

    "use strict";

    let conversations = [];
    let filteredConversations = [];
    let selectedConversation = null;
    let selectedConversationId = null;

    let messagePollingInterval = null;
    let conversationPollingInterval = null;

    let lastMessageCreatedAt = null;

    let isLoadingConversations = false;
    let isLoadingMessages = false;
    let isPollingMessages = false;
    let isPollingConversations = false;
    let isSending = false;

    let selectedAttachment = null;

    const $ = (id) =>
        document.getElementById(id);

    const searchInput =
        $("searchInput");

    const conversationList =
        $("conversationList");

    const chatUserName =
        $("chatUserName");

    const chatUserEmail =
        $("chatUserEmail");

    const chatUserStatus =
        $("chatUserStatus");

    const chatUserAvatar =
        $("chatUserAvatar");

    const chatMessages =
        $("chatMessages");

    const typingIndicator =
        $("typingIndicator");

    const messageInput =
        $("messageInput");

    const sendMessageBtn =
        $("sendMessageBtn");

    const attachmentBtn =
        $("attachmentBtn");

    const photosAttachmentInput =
    $("photosAttachmentInput");

const cameraAttachmentInput =
    $("cameraAttachmentInput");

const filesAttachmentInput =
    $("filesAttachmentInput");

const attachmentMenu =
    $("attachmentMenu");

const cameraAttachmentBtn =
    $("cameraAttachmentBtn");

const photosAttachmentBtn =
    $("photosAttachmentBtn");

const filesAttachmentBtn =
    $("filesAttachmentBtn");

    const attachmentPreview =
        $("attachmentPreview");

    const markReadBtn =
        $("markReadBtn");

    const closeConversationBtn =
        $("closeConversationBtn");

    const filterButtons =
        document.querySelectorAll(
            ".filter-btn"
        );

    function showToast(
        message,
        type = "info"
    ) {

        const existing =
            document.querySelector(
                ".support-admin-toast"
            );

        if (existing) {
            existing.remove();
        }

        const toast =
            document.createElement("div");

        toast.className =
            "support-admin-toast";

        toast.textContent =
            message;

        Object.assign(
            toast.style,
            {
                position: "fixed",
                left: "50%",
                bottom: "25px",
                transform:
                    "translateX(-50%)",
                padding:
                    "12px 18px",
                borderRadius:
                    "10px",
                background:
                    type === "error"
                        ? "#dc2626"
                        : "#111827",
                color: "#ffffff",
                fontSize: "13px",
                zIndex: "99999",
                boxShadow:
                    "0 8px 25px rgba(0,0,0,.18)"
            }
        );

        document.body.appendChild(
            toast
        );

        setTimeout(() => {

            if (toast.parentNode) {
                toast.remove();
            }

        }, 3500);

    }

    function formatMessageTime(date) {

        if (!date) {
            return "";
        }

        return new Intl.DateTimeFormat(
            undefined,
            {
                hour: "numeric",
                minute: "2-digit"
            }
        ).format(
            new Date(date)
        );

    }

    function formatMessageDate(date) {

        if (!date) {
            return "";
        }

        const today =
            new Date();

        const messageDate =
            new Date(date);

        const todayStart =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );

        const messageStart =
            new Date(
                messageDate.getFullYear(),
                messageDate.getMonth(),
                messageDate.getDate()
            );

        const difference =
            Math.floor(
                (
                    todayStart -
                    messageStart
                ) / 86400000
            );

        if (difference === 0) {
            return "Today";
        }

        if (difference === 1) {
            return "Yesterday";
        }

        return new Intl.DateTimeFormat(
            undefined,
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        ).format(
            messageDate
        );

    }

    function escapeHtml(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value || "";

        return div.innerHTML;

    }

    function getConversationCustomer(
    conversation
) {

    return conversation || null;

}

    function getCustomerName(
    conversation
) {

    if (!conversation) {
        return "Unknown Customer";
    }

    return (
        conversation.userName ||
        "Customer"
    );

}

    function getCustomerEmail(
    conversation
) {

    if (!conversation) {
        return "";
    }

    return (
        conversation.userEmail ||
        ""
    );

}

    function getCustomerInitial(
        conversation
    ) {

        const name =
            getCustomerName(
                conversation
            );

        return name
            .trim()
            .charAt(0)
            .toUpperCase();

    }

    function getConversationStatus(
    conversation
) {

    return (
        conversation &&
        conversation.status
    ) || "open";

}

    function getConversationUnreadCount(
    conversation
) {

    return (
        conversation &&
        Number(conversation.unreadCount)
    ) || 0;

}

    function getLastMessage(
    conversation
) {

    return (
        conversation &&
        conversation.lastMessage
    ) || "";

}

    function sortConversations(
    list
) {

    return list.sort(
        (a, b) => {

            const dateA =
                a.lastMessageAt ||
                a.createdAt ||
                0;

            const dateB =
                b.lastMessageAt ||
                b.createdAt ||
                0;

            return (
                new Date(dateB) -
                new Date(dateA)
            );

        }
    );

}

    async function loadConversations() {

    if (isLoadingConversations) {
        return;
    }

    isLoadingConversations = true;

    try {

        const result =
            await Parse.Cloud.run(
                "getAdminSupportConversations",
                {
                    filter: "all",
                    search: ""
                }
            );

        conversations =
            Array.isArray(result)
                ? result
                : [];

        conversations.sort(
            (a, b) => {

                const dateA =
                    a.lastMessageAt ||
                    a.createdAt ||
                    0;

                const dateB =
                    b.lastMessageAt ||
                    b.createdAt ||
                    0;

                return (
                    new Date(dateB) -
                    new Date(dateA)
                );

            }
        );

        applyConversationFilter();

    } catch (error) {

        console.error(
            "Unable to load conversations:",
            error
        );

        showToast(
            error.message ||
            "Unable to load support conversations.",
            "error"
        );

    } finally {

        isLoadingConversations = false;

    }

}

    function applyConversationFilter() {

        const activeButton =
            document.querySelector(
                ".filter-btn.active"
            );

        const filter =
            activeButton
                ? activeButton.dataset.filter
                : "all";

        const search =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";

        filteredConversations =
            conversations.filter(
                (conversation) => {

                    const status =
                        getConversationStatus(
                            conversation
                        );

                    const name =
                        getCustomerName(
                            conversation
                        ).toLowerCase();

                    const email =
                        getCustomerEmail(
                            conversation
                        ).toLowerCase();

                    const lastMessage =
                        getLastMessage(
                            conversation
                        ).toLowerCase();

                    const matchesFilter =
                        filter === "all" ||
                        status === filter;

                    const matchesSearch =
                        !search ||
                        name.includes(search) ||
                        email.includes(search) ||
                        lastMessage.includes(
                            search
                        );

                    return (
                        matchesFilter &&
                        matchesSearch
                    );

                }
            );

        renderConversationList();

    }

    function renderConversationList() {

        if (!conversationList) {
            return;
        }

        conversationList.innerHTML = "";

        if (
            !filteredConversations.length
        ) {

            const empty =
                document.createElement(
                    "div"
                );

            empty.className =
                "empty-conversations";

            empty.innerHTML = `
                <i class="ri-chat-off-line"></i>
                <p>No conversations found.</p>
            `;

            conversationList.appendChild(
                empty
            );

            return;

        }

        filteredConversations.forEach(
            (conversation) => {

                const customer =
                    getConversationCustomer(
                        conversation
                    );

                const name =
                    getCustomerName(
                        conversation
                    );

                const email =
                    getCustomerEmail(
                        conversation
                    );

                const lastMessage =
                    getLastMessage(
                        conversation
                    );

                const unreadCount =
                    getConversationUnreadCount(
                        conversation
                    );

                const status =
                    getConversationStatus(
                        conversation
                    );

                const lastMessageAt =
    conversation.lastMessageAt ||
    conversation.createdAt;

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "conversation-card";

                if (
                    conversation.id ===
                    selectedConversationId
                ) {

                    card.classList.add(
                        "active"
                    );

                }

                card.dataset.id =
                    conversation.id;

                const avatar =
                    document.createElement(
                        "div"
                    );

                avatar.className =
                    "conversation-avatar";

                avatar.textContent =
                    getCustomerInitial(
                        conversation
                    );

                const details =
                    document.createElement(
                        "div"
                    );

                details.className =
                    "conversation-details";

                const top =
                    document.createElement(
                        "div"
                    );

                top.className =
                    "conversation-top";

                const customerName =
                    document.createElement(
                        "div"
                    );

                customerName.className =
                    "conversation-name";

                customerName.textContent =
                    name;

                const badge =
                    document.createElement(
                        "span"
                    );

                badge.className =
                    "conversation-count";

                badge.textContent =
                    unreadCount;

                if (!unreadCount) {
                    badge.style.display =
                        "none";
                }

                top.appendChild(
                    customerName
                );

                top.appendChild(
                    badge
                );

                const message =
                    document.createElement(
                        "div"
                    );

                message.className =
                    "conversation-last-message";

                message.textContent =
                    lastMessage ||
                    "No messages yet";

                const bottom =
                    document.createElement(
                        "div"
                    );

                bottom.className =
                    "conversation-bottom";

                const time =
                    document.createElement(
                        "span"
                    );

                time.className =
                    "conversation-time";

                time.textContent =
                    lastMessageAt
                        ? formatMessageTime(
                            lastMessageAt
                        )
                        : "";

                const statusBadge =
                    document.createElement(
                        "span"
                    );

                statusBadge.className =
                    "conversation-status " +
                    status;

                statusBadge.textContent =
                    status;

                bottom.appendChild(
                    time
                );

                bottom.appendChild(
                    statusBadge
                );

                details.appendChild(
                    top
                );

                details.appendChild(
                    message
                );

                details.appendChild(
                    bottom
                );

                card.appendChild(
                    avatar
                );

                card.appendChild(
                    details
                );

                card.addEventListener(
                    "click",
                    () => {

                        selectConversation(
                            conversation
                        );

                    }
                );

                conversationList.appendChild(
                    card
                );

            }
        );

    }

    async function selectConversation(
        conversation
    ) {

        if (!conversation) {
            return;
        }

        selectedConversation =
    conversation;

selectedConversationId =
    conversation.id;

lastMessageCreatedAt =
    null;

        updateChatHeader(
            conversation
        );

        renderConversationList();

        await loadConversationMessages();

        await markSelectedConversationRead();

        updateConversationLocally();

    }

    function updateChatHeader(
        conversation
    ) {

        if (!conversation) {
            return;
        }

        const name =
            getCustomerName(
                conversation
            );

        const email =
            getCustomerEmail(
                conversation
            );

        const status =
            getConversationStatus(
                conversation
            );

        if (chatUserName) {
            chatUserName.textContent =
                name;
        }

        if (chatUserEmail) {
            chatUserEmail.textContent =
                email;
        }

        if (chatUserAvatar) {

            chatUserAvatar.innerHTML =
                getCustomerInitial(
                    conversation
                );

        }

        if (chatUserStatus) {

            chatUserStatus.textContent =
                status;

            chatUserStatus.className =
                "chat-status " +
                status;

        }

        updateConversationActionButtons();

    }

    function updateConversationActionButtons() {

        if (
            !selectedConversation
        ) {
            return;
        }

        const status =
            getConversationStatus(
                selectedConversation
            );

        if (closeConversationBtn) {

            closeConversationBtn.disabled =
                status === "closed";

            closeConversationBtn.title =
                status === "closed"
                    ? "Conversation closed"
                    : "Close conversation";

        }

        if (markReadBtn) {

            markReadBtn.disabled =
                false;

        }

        if (messageInput) {

            messageInput.disabled =
                status === "closed";

        }

        if (sendMessageBtn) {

            sendMessageBtn.disabled =
                status === "closed";

        }

    }

    async function loadConversationMessages() {

    if (
        !selectedConversation ||
        isLoadingMessages
    ) {
        return;
    }

    isLoadingMessages = true;

    try {

        const result =
            await Parse.Cloud.run(
                "getAdminSupportMessages",
                {
                    conversationId:
                        selectedConversation.id
                }
            );

        const messages =
            result &&
            Array.isArray(result.messages)
                ? result.messages
                : [];

        renderMessages(
            messages
        );

        if (messages.length) {

            lastMessageCreatedAt =
                messages[
                    messages.length - 1
                ].createdAt
                    ? new Date(
                        messages[
                            messages.length - 1
                        ].createdAt
                    )
                    : null;

        } else {

            lastMessageCreatedAt =
                null;

        }

        if (
            selectedConversation
        ) {

            selectedConversation =
                {
                    ...selectedConversation,
                    ...(result.conversation || {})
                };

        }

        scrollChatToBottom();

    } catch (error) {

        console.error(
            "Unable to load messages:",
            error
        );

        showToast(
            error.message ||
            "Unable to load conversation messages.",
            "error"
        );

    } finally {

        isLoadingMessages = false;

    }

}

    function renderMessages(
    messages
) {

    if (!chatMessages) {
        return;
    }

    chatMessages.innerHTML = "";

    if (
        !messages ||
        !messages.length
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-chat";

        empty.innerHTML = `
            <i class="ri-chat-3-line"></i>
            <h3>No messages yet</h3>
            <p>Send a message to start the conversation.</p>
        `;

        chatMessages.appendChild(
            empty
        );

        return;

    }

    let previousDate = null;

    messages.forEach(
        (message) => {

            const messageDate =
                message.createdAt
                    ? new Date(
                        message.createdAt
                    )
                    : new Date();

            const dateKey =
                messageDate.toDateString();

            if (
                previousDate !==
                dateKey
            ) {

                const divider =
                    document.createElement("div");

                divider.className =
                    "chat-date-divider";

                divider.textContent =
                    formatMessageDate(
                        messageDate
                    );

                chatMessages.appendChild(
                    divider
                );

                previousDate =
                    dateKey;

            }

            chatMessages.appendChild(
                createMessageElement(
                    message
                )
            );

        }
    );

}

    function createMessageElement(
    message
) {

    const senderType =
        message.senderType || "";

    const isAdmin =
        senderType === "support";

    const text =
        message.message || "";

    const createdAt =
        message.createdAt
            ? new Date(message.createdAt)
            : new Date();

    const row =
        document.createElement("div");

    row.className =
        isAdmin
            ? "message-row admin-message"
            : "message-row user-message";

    row.dataset.messageId =
        message.id;

    const bubble =
        document.createElement("div");

    bubble.className =
        "message";

    if (text) {

        const paragraphs =
            text.split(/\n+/);

        paragraphs.forEach(
            (paragraph) => {

                const p =
                    document.createElement("p");

                p.textContent =
                    paragraph;

                bubble.appendChild(
                    p
                );

            }
        );

    }

    const attachment =
        message.attachment;

    if (
        attachment &&
        attachment.url
    ) {

        const url =
            attachment.url;

        const name =
    attachment.name ||
    decodeURIComponent(
        url.split("/").pop()
    ) ||
    "Attachment";

        const extension =
            name
                .split(".")
                .pop()
                .toLowerCase();

        const imageExtensions = [
            "jpg",
            "jpeg",
            "png",
            "gif",
            "webp",
            "bmp",
            "svg"
        ];

        const isImage =
            imageExtensions.includes(
                extension
            );

        if (isImage) {

            const imageLink =
                document.createElement("a");

            imageLink.href =
                url;

            imageLink.target =
                "_blank";

            imageLink.rel =
                "noopener noreferrer";

            imageLink.className =
                "message-image-link";

            const image =
                document.createElement("img");

            image.src =
                url;

            image.alt =
                name;

            image.className =
                "message-attachment-image";

            image.loading =
                "lazy";

            imageLink.appendChild(
                image
            );

            bubble.appendChild(
                imageLink
            );

        } else {

            const fileLink =
                document.createElement("a");

            fileLink.href =
                url;

            fileLink.target =
                "_blank";

            fileLink.rel =
                "noopener noreferrer";

            fileLink.className =
                "message-file";

            fileLink.innerHTML = `
                <i class="ri-file-text-line"></i>
                <span class="message-file-name">
                    ${escapeHtml(name)}
                </span>
                <i class="ri-external-link-line"></i>
            `;

            bubble.appendChild(
                fileLink
            );

        }

    }

    const time =
        document.createElement("span");

    time.className =
        "message-time";

    time.textContent =
        formatMessageTime(
            createdAt
        );

    bubble.appendChild(
        time
    );

    row.appendChild(
        bubble
    );

    return row;

}

    function appendMessage(
        message
    ) {

        if (
            !chatMessages ||
            !message
        ) {
            return;
        }

        if (
            chatMessages.querySelector(
                `[data-message-id="${message.id}"]`
            )
        ) {
            return;
        }

        const emptyChat =
            chatMessages.querySelector(
                ".empty-chat"
            );

        if (emptyChat) {
            emptyChat.remove();
        }

        const element =
            createMessageElement(
                message
            );

        chatMessages.appendChild(
            element
        );

        scrollChatToBottom();

    }

    function scrollChatToBottom() {

        if (!chatMessages) {
            return;
        }

        requestAnimationFrame(
            () => {

                chatMessages.scrollTop =
                    chatMessages.scrollHeight;

            }
        );

    }

    async function sendAdminMessage() {

    if (isSending) {
        return;
    }

    if (!selectedConversation) {

        showToast(
            "Select a conversation first.",
            "error"
        );

        return;

    }

    if (
        getConversationStatus(
            selectedConversation
        ) === "closed"
    ) {

        showToast(
            "This conversation is closed.",
            "error"
        );

        return;

    }

    const text =
        messageInput
            ? messageInput.value.trim()
            : "";

    if (
        !text &&
        !selectedAttachment
    ) {
        return;
    }

    isSending = true;

    if (sendMessageBtn) {
        sendMessageBtn.disabled = true;
    }

    try {

        let result;

        if (selectedAttachment) {

            result =
                await Parse.Cloud.run(
                    "sendAdminSupportAttachment",
                    {
                        conversationId:
                            selectedConversation.id,

                        message:
                            text,

                        attachment:
                            selectedAttachment
                    }
                );

        } else {

            result =
                await Parse.Cloud.run(
                    "sendAdminSupportMessage",
                    {
                        conversationId:
                            selectedConversation.id,

                        message:
                            text
                    }
                );

        }

        if (messageInput) {

            messageInput.value =
                "";

            resizeMessageInput();

        }

        clearAttachment();

        appendMessage(
            result
        );

        lastMessageCreatedAt =
            result.createdAt
                ? new Date(
                    result.createdAt
                )
                : new Date();

        selectedConversation =
            {
                ...selectedConversation,

                lastMessage:
                    result.message ||
                    (
                        result.attachment
                            ? `Attachment: ${result.attachment.name}`
                            : ""
                    ),

                lastMessageAt:
                    result.createdAt ||
                    new Date(),

                status:
                    "open"
            };

        updateChatHeader(
            selectedConversation
        );

        updateConversationLocally();

    } catch (error) {

        console.error(
            "Unable to send admin message:",
            error
        );

        showToast(
            error.message ||
            "Message could not be sent.",
            "error"
        );

    } finally {

        isSending = false;

        if (
            sendMessageBtn &&
            selectedConversation &&
            getConversationStatus(
                selectedConversation
            ) !== "closed"
        ) {

            sendMessageBtn.disabled =
                false;

        }

    }

}

    async function markSelectedConversationRead() {

    if (!selectedConversation) {
        return;
    }

    try {

        await Parse.Cloud.run(
            "markAdminSupportMessagesRead",
            {
                conversationId:
                    selectedConversation.id
            }
        );

        selectedConversation =
            {
                ...selectedConversation,
                unreadCount: 0
            };

        updateConversationLocally();

    } catch (error) {

        console.error(
            "Unable to mark conversation as read:",
            error
        );

    }

}

    function updateConversationLocally() {

        if (
            !selectedConversation
        ) {
            return;
        }

        conversations =
            conversations.map(
                (conversation) =>
                    conversation.id ===
                    selectedConversation.id
                        ? selectedConversation
                        : conversation
            );

        applyConversationFilter();

    }

    async function closeSelectedConversation() {

    if (!selectedConversation) {
        return;
    }

    if (
        getConversationStatus(
            selectedConversation
        ) === "closed"
    ) {
        return;
    }

    const confirmed =
        window.confirm(
            "Are you sure you want to close this conversation?"
        );

    if (!confirmed) {
        return;
    }

    try {

        await Parse.Cloud.run(
            "closeAdminSupportConversation",
            {
                conversationId:
                    selectedConversation.id
            }
        );

        selectedConversation =
            {
                ...selectedConversation,
                status: "closed"
            };

        updateChatHeader(
            selectedConversation
        );

        updateConversationLocally();

        showToast(
            "Conversation closed.",
            "info"
        );

    } catch (error) {

        console.error(
            "Unable to close conversation:",
            error
        );

        showToast(
            error.message ||
            "Unable to close conversation.",
            "error"
        );

    }

}

    async function reopenSelectedConversation() {

    if (!selectedConversation) {
        return;
    }

    try {

        await Parse.Cloud.run(
            "reopenAdminSupportConversation",
            {
                conversationId:
                    selectedConversation.id
            }
        );

        selectedConversation =
            {
                ...selectedConversation,
                status: "open"
            };

        updateChatHeader(
            selectedConversation
        );

        updateConversationLocally();

        showToast(
            "Conversation reopened.",
            "info"
        );

    } catch (error) {

        console.error(
            "Unable to reopen conversation:",
            error
        );

        showToast(
            error.message ||
            "Unable to reopen conversation.",
            "error"
        );

    }

}

    async function checkForNewMessages() {

    if (
        !selectedConversation ||
        isPollingMessages
    ) {
        return;
    }

    isPollingMessages = true;

    try {

        const result =
            await Parse.Cloud.run(
                "getAdminSupportMessages",
                {
                    conversationId:
                        selectedConversation.id
                }
            );

        const messages =
            result &&
            Array.isArray(result.messages)
                ? result.messages
                : [];

        if (!messages.length) {
            return;
        }

        const newMessages =
            lastMessageCreatedAt
                ? messages.filter(
                    (message) => {

                        if (!message.createdAt) {
                            return false;
                        }

                        return (
                            new Date(
                                message.createdAt
                            ) >
                            new Date(
                                lastMessageCreatedAt
                            )
                        );

                    }
                )
                : messages;

        newMessages.forEach(
            (message) => {

                appendMessage(
                    message
                );

            }
        );

        const latestMessage =
            messages[
                messages.length - 1
            ];

        if (
            latestMessage &&
            latestMessage.createdAt
        ) {

            lastMessageCreatedAt =
                new Date(
                    latestMessage.createdAt
                );

        }

    } catch (error) {

        console.error(
            "Admin message polling error:",
            error
        );

    } finally {

        isPollingMessages = false;

    }

}

    async function checkForNewConversations() {

    if (isPollingConversations) {
        return;
    }

    isPollingConversations = true;

    try {

        const result =
            await Parse.Cloud.run(
                "getAdminSupportConversations",
                {
                    filter: "all",
                    search: ""
                }
            );

        conversations =
            Array.isArray(result)
                ? result
                : [];

        conversations =
            sortConversations(
                conversations
            );

        if (selectedConversationId) {

            const updated =
                conversations.find(
                    (conversation) =>
                        conversation.id ===
                        selectedConversationId
                );

            if (updated) {

                selectedConversation =
                    updated;

                updateChatHeader(
                    updated
                );

            }

        }

        applyConversationFilter();

    } catch (error) {

        console.error(
            "Conversation polling error:",
            error
        );

    } finally {

        isPollingConversations = false;

    }

}

    function startMessagePolling() {

        stopMessagePolling();

        messagePollingInterval =
            setInterval(
                checkForNewMessages,
                1000
            );

    }

    function stopMessagePolling() {

        if (
            messagePollingInterval
        ) {

            clearInterval(
                messagePollingInterval
            );

            messagePollingInterval =
                null;

        }

    }

    function startConversationPolling() {

        stopConversationPolling();

        conversationPollingInterval =
            setInterval(
                checkForNewConversations,
                2000
            );

    }

    function stopConversationPolling() {

        if (
            conversationPollingInterval
        ) {

            clearInterval(
                conversationPollingInterval
            );

            conversationPollingInterval =
                null;

        }

    }

    function resizeMessageInput() {

        if (!messageInput) {
            return;
        }

        messageInput.style.height =
            "auto";

        messageInput.style.height =
            Math.min(
                messageInput.scrollHeight,
                140
            ) + "px";

    }

    function handleMessageKeydown(
        event
    ) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendAdminMessage();

        }

    }

    function handleSearch() {

        applyConversationFilter();

    }

    function handleFilterClick(
        event
    ) {

        filterButtons.forEach(
            (button) => {

                button.classList.remove(
                    "active"
                );

            }
        );

        event.currentTarget.classList.add(
            "active"
        );

        applyConversationFilter();

    }

    function handleAttachmentClick() {

    if (!attachmentMenu) {
        return;
    }

    attachmentMenu.hidden =
        !attachmentMenu.hidden;

}

function closeAttachmentMenu() {

    if (attachmentMenu) {
        attachmentMenu.hidden = true;
    }

}

function openCameraAttachment() {

    closeAttachmentMenu();

    if (cameraAttachmentInput) {
        cameraAttachmentInput.click();
    }

}

function openPhotosAttachment() {

    closeAttachmentMenu();

    if (photosAttachmentInput) {
        photosAttachmentInput.click();
    }

}

function openFilesAttachment() {

    closeAttachmentMenu();

    if (filesAttachmentInput) {
        filesAttachmentInput.click();
    }

}

async function handleAttachmentChange(
    event
) {

    const file =
        event.target.files &&
        event.target.files[0];

    if (!file) {
        return;
    }

    const maxSize =
        10 * 1024 * 1024;

    if (file.size > maxSize) {

        showToast(
            "Attachment must be 10MB or smaller.",
            "error"
        );

        event.target.value = "";

        return;

    }

    try {

        selectedAttachment =
            new Parse.File(
                file.name,
                file
            );

        await selectedAttachment.save();

        renderAttachmentPreview(
            file.name
        );

    } catch (error) {

        console.error(
            "Unable to upload attachment:",
            error
        );

        selectedAttachment =
            null;

        event.target.value = "";

        showToast(
            "Attachment could not be uploaded.",
            "error"
        );

    }

}

function renderAttachmentPreview(
    fileName
) {

    if (!attachmentPreview) {
        return;
    }

    attachmentPreview.innerHTML = `
        <div class="selected-attachment">
            <i class="ri-attachment-2"></i>
            <span>${escapeHtml(
                fileName
            )}</span>
            <button
                type="button"
                id="removeAttachmentBtn"
                title="Remove attachment">
                <i class="ri-close-line"></i>
            </button>
        </div>
    `;

    const removeButton =
        $("removeAttachmentBtn");

    if (removeButton) {

        removeButton.addEventListener(
            "click",
            clearAttachment
        );

    }

}

function clearAttachment() {

    selectedAttachment =
        null;

    if (photosAttachmentInput) {
        photosAttachmentInput.value =
            "";
    }

    if (cameraAttachmentInput) {
        cameraAttachmentInput.value =
            "";
    }

    if (filesAttachmentInput) {
        filesAttachmentInput.value =
            "";
    }

    if (attachmentPreview) {
        attachmentPreview.innerHTML =
            "";
    }

}

    function setupEventListeners() {

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                handleSearch
            );

        }

        filterButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    handleFilterClick
                );

            }
        );

        if (messageInput) {

            messageInput.addEventListener(
                "keydown",
                handleMessageKeydown
            );

            messageInput.addEventListener(
                "input",
                resizeMessageInput
            );

        }

        if (sendMessageBtn) {

            sendMessageBtn.addEventListener(
                "click",
                sendAdminMessage
            );

        }

        if (attachmentBtn) {

            attachmentBtn.addEventListener(
                "click",
                handleAttachmentClick
            );

        }

        if (cameraAttachmentBtn) {

    cameraAttachmentBtn.addEventListener(
        "click",
        openCameraAttachment
    );

}

if (photosAttachmentBtn) {

    photosAttachmentBtn.addEventListener(
        "click",
        openPhotosAttachment
    );

}

if (filesAttachmentBtn) {

    filesAttachmentBtn.addEventListener(
        "click",
        openFilesAttachment
    );

}

if (cameraAttachmentInput) {

    cameraAttachmentInput.addEventListener(
        "change",
        handleAttachmentChange
    );

}

if (photosAttachmentInput) {

    photosAttachmentInput.addEventListener(
        "change",
        handleAttachmentChange
    );

}

if (filesAttachmentInput) {

    filesAttachmentInput.addEventListener(
        "change",
        handleAttachmentChange
    );

}

document.addEventListener(
    "click",
    (event) => {

        if (
            attachmentMenu &&
            !attachmentMenu.contains(event.target) &&
            attachmentBtn &&
            !attachmentBtn.contains(event.target)
        ) {

            closeAttachmentMenu();

        }

    }
);

        if (markReadBtn) {

            markReadBtn.addEventListener(
                "click",
                markSelectedConversationRead
            );

        }

        if (closeConversationBtn) {

            closeConversationBtn.addEventListener(
                "click",
                async () => {

                    if (
                        selectedConversation &&
                        getConversationStatus(
                            selectedConversation
                        ) === "closed"
                    ) {

                        await reopenSelectedConversation();

                    } else {

                        await closeSelectedConversation();

                    }

                }
            );

        }

    }

    async function initializeAdminSupport() {

        try {

            if (
                typeof Parse ===
                "undefined"
            ) {

                showToast(
                    "Parse is not available.",
                    "error"
                );

                return;

            }

            const user =
                Parse.User.current();

            if (!user) {

                window.location.href =
                    "index.html";

                return;

            }

            await loadConversations();

            setupEventListeners();

            startConversationPolling();

            startMessagePolling();

            resizeMessageInput();

        } catch (error) {

            console.error(
                "Admin support initialization failed:",
                error
            );

            showToast(
                "Unable to load support admin.",
                "error"
            );

        }

    }

    window.sendAdminMessage =
        sendAdminMessage;

    window.reopenSelectedConversation =
        reopenSelectedConversation;

    window.closeSelectedConversation =
        closeSelectedConversation;

    document.addEventListener(
        "visibilitychange",
        async () => {

            if (
                document.visibilityState ===
                "visible"
            ) {

                await checkForNewConversations();

                if (
                    selectedConversation
                ) {

                    await checkForNewMessages();

                }

            }

        }
    );

    window.addEventListener(
        "beforeunload",
        () => {

            stopMessagePolling();

            stopConversationPolling();

        }
    );

    if (
        typeof Parse !==
        "undefined"
    ) {

        initializeAdminSupport();

    } else {

        window.addEventListener(
            "load",
            initializeAdminSupport
        );

    }

})();
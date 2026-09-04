(function () {

    "use strict";
const $ = (id) => document.getElementById(id);
let currentUser = null;
let currentConversation = null;
let typingTimer = null;
let isSending = false;
let isLoadingMessages = false;
let messagePollingInterval = null;
let conversationPollingInterval = null;
let lastMessageCreatedAt = null;
let isPollingMessages = false;
let isPollingConversation = false;
let selectedAttachments = [];
let cameraStream = null;

const attachmentPreview =
    $("attachmentPreview");

const attachmentMenu =
    $("attachmentMenu");

const photoAttachmentBtn =
    $("photoAttachmentBtn");

const fileAttachmentBtn =
    $("fileAttachmentBtn");

const cameraAttachmentBtn =
    $("cameraAttachmentBtn");

const photoAttachmentInput =
    $("photoAttachmentInput");

const fileAttachmentInput =
    $("fileAttachmentInput");
    
const cameraModal =
    $("cameraModal");

const cameraVideo =
    $("cameraVideo");

const cameraCanvas =
    $("cameraCanvas");

const capturePhotoBtn =
    $("capturePhotoBtn");

const closeCameraBtn =
    $("closeCameraBtn");

    const chatContent = $("chatContent");
    const messageInput = $("messageInput");
    const sendMessageBtn = $("sendMessageBtn");
    const attachmentBtn = $("attachmentBtn");
    const typingIndicator = $("typingIndicator");

    function showToast(message, type = "info") {

        const existingToast = document.querySelector(".support-toast");

        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement("div");

        toast.className = "support-toast";
        toast.textContent = message;
        toast.dataset.type = type;

        Object.assign(toast.style, {
            position: "fixed",
            left: "50%",
            bottom: "25px",
            transform: "translateX(-50%)",
            padding: "12px 18px",
            borderRadius: "10px",
            background: "#111827",
            color: "#ffffff",
            fontSize: "13px",
            zIndex: "99999",
            boxShadow: "0 8px 25px rgba(0,0,0,.15)"
        });

        document.body.appendChild(toast);

        setTimeout(() => {

            toast.remove();

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
        ).format(date);
    }

    function formatMessageDate(date) {

        if (!date) {
            return "";
        }

        const today = new Date();

        const messageDate = new Date(date);

        const todayStart = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

        const messageStart = new Date(
            messageDate.getFullYear(),
            messageDate.getMonth(),
            messageDate.getDate()
        );

        const difference =
            Math.floor(
                (todayStart - messageStart) /
                86400000
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
        ).format(messageDate);
    }

    function scrollChatToBottom() {

        if (!chatContent) {
            return;
        }

        requestAnimationFrame(() => {

            chatContent.scrollTop =
                chatContent.scrollHeight;

        });

    }

    function setSendButtonState(disabled, loading = false) {

    if (!sendMessageBtn) {
        return;
    }

    sendMessageBtn.disabled = disabled;

    sendMessageBtn.style.opacity =
        disabled ? "0.6" : "1";

    sendMessageBtn.style.cursor =
        disabled ? "not-allowed" : "pointer";

    if (loading) {

        sendMessageBtn.innerHTML =
            '<i class="ri-loader-4-line send-spinner"></i>';

        return;
    }

    sendMessageBtn.innerHTML =
        '<i class="ri-send-plane-2-line"></i>';

}

    function setInputState(disabled) {

        if (!messageInput) {
            return;
        }

        messageInput.disabled = disabled;

    }

    function clearWelcomeMessage() {

        if (!chatContent) {
            return;
        }

        const welcomeRows =
            chatContent.querySelectorAll(
                ".support-message"
            );

        welcomeRows.forEach((row) => {

            if (
                row.dataset.systemWelcome === "true"
            ) {
                row.remove();
            }

        });

    }

    function createDateDivider(date) {

        const divider =
            document.createElement("div");

        divider.className = "chat-date";

        const span =
            document.createElement("span");

        span.textContent =
            formatMessageDate(date);

        divider.appendChild(span);

        return divider;
    }

    function createMessageElement(message) {

    const senderType =
        typeof message.get === "function"
            ? message.get("senderType")
            : message.senderType;

    const text =
        typeof message.get === "function"
            ? message.get("message") || ""
            : message.message || "";

    const createdAt =
        typeof message.get === "function"
            ? message.createdAt || new Date()
            : message.createdAt
                ? new Date(message.createdAt)
                : new Date();

    const isSupport =
        senderType === "support";

    const row =
        document.createElement("div");

    row.className =
        "message-row " +
        (
            isSupport
                ? "support-message"
                : "user-message"
        );

    row.dataset.messageId =
        message.id;

    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    const avatarIcon =
        document.createElement("i");

    avatarIcon.className =
        isSupport
            ? "ri-customer-service-2-line"
            : "ri-user-3-line";

    avatar.appendChild(
        avatarIcon
    );

    const content =
        document.createElement("div");

    content.className =
        "message-content";

    const bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble";

    if (text) {

        const paragraphs =
            text.split(/\n+/);

        paragraphs.forEach(
            (paragraph) => {

                const p =
                    document.createElement("p");

                p.textContent =
                    paragraph;

                bubble.appendChild(p);

            }
        );

    }

    const attachment =
        typeof message.get === "function"
            ? message.get("attachment")
            : message.attachment;

    if (attachment) {

        const attachmentWrapper =
            document.createElement("div");

        attachmentWrapper.className =
            "message-attachment";

        const attachmentUrl =
            typeof attachment.url === "function"
                ? attachment.url()
                : attachment.url;

        const attachmentName =
            typeof attachment.name === "function"
                ? attachment.name()
                : attachment.name;

        if (
            attachmentUrl &&
            /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(
                attachmentName || ""
            )
        ) {

            const imageLink =
                document.createElement("a");

            imageLink.href =
                attachmentUrl;

            imageLink.target =
                "_blank";

            imageLink.rel =
                "noopener noreferrer";

            const image =
                document.createElement("img");

            image.src =
                attachmentUrl;

            image.alt =
                attachmentName || "Image";

            image.className =
                "message-image";

            imageLink.appendChild(
                image
            );

            attachmentWrapper.appendChild(
                imageLink
            );

        } else {

            const attachmentLink =
                document.createElement("a");

            attachmentLink.href =
                attachmentUrl;

            attachmentLink.target =
                "_blank";

            attachmentLink.rel =
                "noopener noreferrer";

            attachmentLink.className =
                "message-file";

            const attachmentIcon =
                document.createElement("i");

            attachmentIcon.className =
                "ri-file-3-line";

            const attachmentNameElement =
                document.createElement("span");

            attachmentNameElement.textContent =
                attachmentName ||
                "Attachment";

            attachmentLink.appendChild(
                attachmentIcon
            );

            attachmentLink.appendChild(
                attachmentNameElement
            );

            attachmentWrapper.appendChild(
                attachmentLink
            );

        }

        bubble.appendChild(
            attachmentWrapper
        );

    }

    const time =
        document.createElement("span");

    time.className =
        "message-time";

    time.textContent =
        formatMessageTime(
            createdAt
        );

    content.appendChild(
        bubble
    );

    content.appendChild(
        time
    );

    row.appendChild(
        avatar
    );

    row.appendChild(
        content
    );

    return row;

}

    function appendMessage(message, shouldScroll = true) {

        if (!chatContent || !message) {
            return;
        }

        if (!message.id) {
            return;
        }

        const existing =
            chatContent.querySelector(
                `[data-message-id="${message.id}"]`
            );

        if (existing) {
            return;
        }

        const row =
            createMessageElement(message);

        chatContent.appendChild(row);

        if (shouldScroll) {
            scrollChatToBottom();
        }

    }

    function clearMessages() {

        if (!chatContent) {
            return;
        }

        chatContent.innerHTML = "";

    }
    
    function startMessagePolling() {

    stopMessagePolling();

    messagePollingInterval =
        setInterval(
            checkForNewMessages,
            1000
        );

}

    function renderAttachmentPreview() {

    if (!attachmentPreview) {
        return;
    }

    attachmentPreview.innerHTML = "";

    if (!selectedAttachments.length) {

        attachmentPreview.style.display =
            "none";

        return;
    }

    attachmentPreview.style.display =
        "flex";

    selectedAttachments.forEach(
        (file, index) => {

            const card =
                document.createElement("div");

            card.className =
                "selected-attachment";

            const preview =
                document.createElement("div");

            preview.className =
                "selected-attachment-preview";

            if (
                file.type &&
                file.type.startsWith("image/")
            ) {

                const image =
                    document.createElement("img");

                image.src =
                    URL.createObjectURL(file);

                image.alt =
                    file.name;

                preview.appendChild(
                    image
                );

            } else {

                const icon =
                    document.createElement("i");

                icon.className =
                    "ri-file-3-line";

                preview.appendChild(
                    icon
                );

            }

            const info =
                document.createElement("div");

            info.className =
                "selected-attachment-info";

            const name =
                document.createElement("div");

            name.className =
                "selected-attachment-name";

            name.textContent =
                file.name;

            const size =
                document.createElement("div");

            size.className =
                "selected-attachment-size";

            size.textContent =
                formatFileSize(file.size);

            info.appendChild(name);
            info.appendChild(size);

            const removeButton =
                document.createElement("button");

            removeButton.type =
                "button";

            removeButton.className =
                "remove-attachment-btn";

            removeButton.title =
                "Remove attachment";

            removeButton.setAttribute(
                "aria-label",
                `Remove ${file.name}`
            );

            removeButton.innerHTML =
                '<i class="ri-close-line"></i>';

            removeButton.addEventListener(
                "click",
                () => {
                    removeAttachment(index);
                }
            );

            card.appendChild(preview);
            card.appendChild(info);
            card.appendChild(removeButton);

            attachmentPreview.appendChild(
                card
            );

        }
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
            checkConversationStatus,
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

    function formatFileSize(bytes) {

    if (!bytes) {
        return "0 KB";
    }

    if (bytes < 1024) {
        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {

        return (
            bytes / 1024
        ).toFixed(1) + " KB";

    }

    return (
        bytes /
        (1024 * 1024)
    ).toFixed(1) + " MB";

}

    function removeAttachment(index) {

    if (
        index < 0 ||
        index >= selectedAttachments.length
    ) {
        return;
    }

    const removed =
        selectedAttachments.splice(
            index,
            1
        );

    renderAttachmentPreview();

    updateSendButtonState();

}

    function handleAttachment() {

    if (!attachmentMenu) {
        return;
    }

    attachmentMenu.classList.toggle(
        "show"
    );

}

    function closeAttachmentMenu() {

    if (!attachmentMenu) {
        return;
    }

    attachmentMenu.classList.remove(
        "show"
    );

}

    function selectPhotoAttachment() {

    closeAttachmentMenu();

    if (photoAttachmentInput) {
        photoAttachmentInput.click();
    }

}

    function selectFileAttachment() {

    closeAttachmentMenu();

    if (fileAttachmentInput) {
        fileAttachmentInput.click();
    }

}

    function processAttachment(event) {

    const files =
        Array.from(
            event.target.files || []
        );

    if (!files.length) {
        return;
    }

    const maxSize =
        10 * 1024 * 1024;

    for (const file of files) {

        if (
    file.size > maxSize &&
    !file.type.startsWith("image/")
) {

    showToast(
        `${file.name} is larger than 10MB.`,
        "error"
    );

    continue;
}

        addAttachment(file);

    }

    event.target.value = "";

}

    function addAttachment(file) {

    if (!file) {
        return;
    }

    const alreadyExists =
        selectedAttachments.some(
            (attachment) =>
                attachment.name === file.name &&
                attachment.size === file.size &&
                attachment.lastModified === file.lastModified
        );

    if (alreadyExists) {

        showToast(
            `${file.name} is already attached.`,
            "info"
        );

        return;
    }

    selectedAttachments.push(file);
    
    renderAttachmentPreview();

    updateSendButtonState();

}

    function addWelcomeMessage() {

        if (!chatContent) {
            return;
        }

        clearMessages();

        chatContent.appendChild(
            createDateDivider(
                new Date()
            )
        );

        const row =
            document.createElement("div");

        row.className =
            "message-row support-message";

        row.dataset.systemWelcome =
            "true";

        const avatar =
            document.createElement("div");

        avatar.className =
            "message-avatar";

        const icon =
            document.createElement("i");

        icon.className =
            "ri-customer-service-2-line";

        avatar.appendChild(icon);

        const content =
            document.createElement("div");

        content.className =
            "message-content";

        const bubble =
            document.createElement("div");

        bubble.className =
            "message-bubble";

        const first =
            document.createElement("p");

        first.textContent =
            "Hello 👋";

        const second =
            document.createElement("p");

        second.textContent =
            "Welcome to InvoicePro Support. How can we help you today?";

        bubble.appendChild(first);
        bubble.appendChild(second);

        const time =
            document.createElement("span");

        time.className =
            "message-time";

        time.textContent =
            "Just now";

        content.appendChild(bubble);
        content.appendChild(time);

        row.appendChild(avatar);
        row.appendChild(content);

        chatContent.appendChild(row);

        scrollChatToBottom();

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

    function handleMessageKeydown(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }

    function handleTyping() {

    resizeMessageInput();

    updateSendButtonState();

    clearTimeout(
        typingTimer
    );

    if (
        messageInput &&
        messageInput.value.trim()
    ) {

        typingTimer =
            setTimeout(() => {

                hideTypingIndicator();

            }, 1500);

    }

}

    function showTypingIndicator() {

        if (!typingIndicator) {
            return;
        }

        typingIndicator.style.display =
            "flex";

    }

    function hideTypingIndicator() {

        if (!typingIndicator) {
            return;
        }

        typingIndicator.style.display =
            "none";

    }
    
    function capturePhoto() {

    if (!cameraVideo || !cameraCanvas) {
        return;
    }

    const width =
        cameraVideo.videoWidth;

    const height =
        cameraVideo.videoHeight;

    if (!width || !height) {

        showToast(
            "Camera is not ready yet.",
            "error"
        );

        return;
    }

    cameraCanvas.width =
        width;

    cameraCanvas.height =
        height;

    const context =
        cameraCanvas.getContext("2d");

    context.drawImage(
        cameraVideo,
        0,
        0,
        width,
        height
    );

    cameraCanvas.toBlob(
        (blob) => {

            if (!blob) {
                return;
            }

            const file =
                new File(
                    [
                        blob
                    ],
                    `camera-${Date.now()}.jpg`,
                    {
                        type:
                            "image/jpeg"
                    }
                );

            addAttachment(file);

            closeCamera();

        },
        "image/jpeg",
        0.9
    );

}

    function setupEventListeners() {

        if (sendMessageBtn) {

            sendMessageBtn.addEventListener(
                "click",
                sendMessage
            );

        }

        if (messageInput) {

            messageInput.addEventListener(
                "keydown",
                handleMessageKeydown
            );

            messageInput.addEventListener(
                "input",
                handleTyping
            );

        }

        if (attachmentBtn) {

    attachmentBtn.addEventListener(
        "click",
        handleAttachment
    );

}

if (cameraAttachmentBtn) {

    cameraAttachmentBtn.addEventListener(
        "click",
        selectCameraAttachment
    );

}

if (photoAttachmentBtn) {

    photoAttachmentBtn.addEventListener(
        "click",
        selectPhotoAttachment
    );

}

if (fileAttachmentBtn) {

    fileAttachmentBtn.addEventListener(
        "click",
        selectFileAttachment
    );

}

if (capturePhotoBtn) {

    capturePhotoBtn.addEventListener(
        "click",
        capturePhoto
    );

}

if (closeCameraBtn) {

    closeCameraBtn.addEventListener(
        "click",
        closeCamera
    );

}

if (photoAttachmentInput) {

    photoAttachmentInput.addEventListener(
        "change",
        processAttachment
    );

}

if (fileAttachmentInput) {

    fileAttachmentInput.addEventListener(
        "change",
        processAttachment
    );

}

    }
    
    function updateSendButtonState() {

    if (!sendMessageBtn) {
        return;
    }

    const hasText =
        messageInput &&
        messageInput.value.trim().length > 0;

    const hasAttachment =
    selectedAttachments.length > 0;

    const shouldDisable =
        isSending ||
        (!hasText && !hasAttachment);

    setSendButtonState(
        shouldDisable,
        isSending
    );

}

    function closeCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                (track) => {
                    track.stop();
                }
            );

        cameraStream =
            null;

    }

    if (cameraVideo) {
        cameraVideo.srcObject = null;
    }

    if (cameraModal) {
        cameraModal.classList.remove("show");
    }

}

    async function prepareAttachmentFile(file) {

    if (!file) {
        throw new Error("Invalid file.");
    }

    if (
        !file.type ||
        !file.type.startsWith("image/")
    ) {
        return file;
    }

    const bitmap =
        await createImageBitmap(file);

    const canvas =
        document.createElement("canvas");

    canvas.width =
        bitmap.width;

    canvas.height =
        bitmap.height;

    const context =
        canvas.getContext("2d");

    if (!context) {
        bitmap.close();
        throw new Error("Unable to process image.");
    }

    context.drawImage(
        bitmap,
        0,
        0,
        bitmap.width,
        bitmap.height
    );

    bitmap.close();

    const blob =
        await new Promise((resolve) => {

            canvas.toBlob(
                resolve,
                "image/jpeg",
                0.9
            );

        });

    if (!blob) {
        throw new Error("Unable to convert image.");
    }

    const extension =
        ".jpg";

    const baseName =
        file.name.replace(
            /\.[^/.]+$/,
            ""
        );

    return new File(
        [
            blob
        ],
        `${baseName}${extension}`,
        {
            type:
                "image/jpeg",
            lastModified:
                Date.now()
        }
    );
}

    async function getCurrentUser() {

        const user =
            Parse.User.current();

        if (!user) {
            window.location.href =
                "index.html";

            return null;
        }

        if (!user.getSessionToken()) {

            await Parse.User.logOut();

            window.location.href =
                "index.html";

            return null;
        }

        currentUser = user;

        return user;
    }

    async function getOrCreateConversation() {
    
    if (!currentUser) {
        return null;
    }
    
    try {
        
        const result =
            await Parse.Cloud.run(
                "getSupportConversation"
            );
        
        if (!result || !result.id) {
            return null;
        }
        
        const Conversation =
            Parse.Object.extend(
                "SupportConversation"
            );
        
        const query =
            new Parse.Query(
                Conversation
            );
        
        const conversation =
            await query.get(
                result.id
            );
        
        currentConversation =
            conversation;
        
        return conversation;
        
    } catch (error) {
        
        console.error(
            "Unable to get support conversation:",
            error
        );
        
        throw error;
        
    }
    
}

    async function loadConversationMessages() {

    if (
        !currentConversation ||
        isLoadingMessages
    ) {
        return;
    }

    isLoadingMessages = true;

    try {

        const messages =
            await Parse.Cloud.run(
                "getSupportMessages",
                {
                    conversationId:
                        currentConversation.id
                }
            );

        clearMessages();

        if (!messages.length) {

            addWelcomeMessage();

            lastMessageCreatedAt =
                null;

        } else {

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

                        chatContent.appendChild(
                            createDateDivider(
                                messageDate
                            )
                        );

                        previousDate =
                            dateKey;

                    }

                    appendMessage(
                        message,
                        false
                    );

                }
            );

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

            scrollChatToBottom();

        }

        await markConversationAsRead();

    } catch (error) {

        console.error(
            "Unable to load support messages:",
            error
        );

        showToast(
            "Unable to load your conversation.",
            "error"
        );

    } finally {

        isLoadingMessages = false;

    }

}

    async function markConversationAsRead() {

    if (!currentConversation) {
        return;
    }

    try {

        await Parse.Cloud.run(
            "markSupportMessagesRead",
            {
                conversationId:
                    currentConversation.id
            }
        );

    } catch (error) {

        console.error(
            "Unable to mark messages as read:",
            error
        );

    }

}

    async function sendMessage() {

    if (isSending) {
        return;
    }

    if (!currentUser) {
        return;
    }

    if (!currentConversation) {
        await getOrCreateConversation();
    }

    const text =
        messageInput
            ? messageInput.value.trim()
            : "";

    if (
    !text &&
    selectedAttachments.length === 0
) {
    return;
}

    isSending = true;

    setSendButtonState(true, true);

    try {

        clearWelcomeMessage();

        let result = null;

        if (selectedAttachments.length) {

    showToast(
        "Uploading attachments...",
        "info"
    );

    for (
    let index = 0;
    index < selectedAttachments.length;
    index++
) {

    const originalFile =
        selectedAttachments[index];

    console.log(
        `[LiveSupport] Starting attachment ${index + 1} of ${selectedAttachments.length}: ${originalFile.name}`
    );

    let file;

    try {

        file =
            await prepareAttachmentFile(
                originalFile
            );

        console.log(
            `[LiveSupport] Attachment prepared: ${file.name}, ${file.type}, ${file.size} bytes`
        );

    } catch (error) {

        console.error(
            "[LiveSupport] Image preparation failed:",
            error
        );

        throw new Error(
            `Unable to prepare ${originalFile.name}.`
        );

    }

    const parseFile =
        new Parse.File(
            file.name,
            file,
            file.type
        );

    console.log(
        `[LiveSupport] Calling Parse.File.save() for: ${file.name}`
    );

    await parseFile.save();

    console.log(
        `[LiveSupport] Parse.File.save() completed for: ${file.name}`
    );

    console.log(
        `[LiveSupport] File URL: ${parseFile.url()}`
    );

    const attachmentResult =
        await Parse.Cloud.run(
            "sendSupportAttachment",
            {
                conversationId:
                    currentConversation.id,

                message:
                    index === 0
                        ? text
                        : "",

                attachment:
                    parseFile
            }
        );

    console.log(
        `[LiveSupport] sendSupportAttachment completed for: ${file.name}`
    );

    if (attachmentResult) {

        appendMessage(
            attachmentResult,
            false
        );

    }

}


    scrollChatToBottom();

} else {

    result =
        await Parse.Cloud.run(
            "sendSupportMessage",
            {
                conversationId:
                    currentConversation.id,

                message:
                    text
            }
        );

    if (result) {

        appendMessage(
            result
        );

    }

}

        if (messageInput) {

            messageInput.value = "";

            resizeMessageInput();

        }

        selectedAttachments = [];

renderAttachmentPreview();

updateSendButtonState();

        if (result) {

            appendMessage(
                result
            );

        }

    } catch (error) {

        console.error(
            "Unable to send support message:",
            error
        );

        showToast(
            error.message ||
            "Message could not be sent. Please try again.",
            "error"
        );

    } finally {

        isSending = false;

        updateSendButtonState();

    }

}
    
    async function checkForNewMessages() {

    if (
        !currentConversation ||
        isPollingMessages ||
        !lastMessageCreatedAt
    ) {
        return;
    }

    isPollingMessages = true;

    try {

        const messages =
            await Parse.Cloud.run(
                "getSupportMessages",
                {
                    conversationId:
                        currentConversation.id,

                    after:
                        lastMessageCreatedAt.toISOString()
                }
            );

        if (!messages.length) {
            return;
        }

        for (
            const message
            of messages
        ) {

            appendMessage(
                message
            );

            const messageCreatedAt =
                message.createdAt
                    ? new Date(
                        message.createdAt
                    )
                    : null;

            if (
                messageCreatedAt &&
                (
                    !lastMessageCreatedAt ||
                    messageCreatedAt >
                    lastMessageCreatedAt
                )
            ) {

                lastMessageCreatedAt =
                    messageCreatedAt;

            }

            if (
                message.senderType ===
                "support"
            ) {

                await markConversationAsRead();

            }

        }

    } catch (error) {

        console.error(
            "Message polling error:",
            error
        );

    } finally {

        isPollingMessages = false;

    }

}

    async function checkConversationStatus() {

    if (
        !currentConversation ||
        isPollingConversation
    ) {
        return;
    }

    isPollingConversation = true;

    try {

        const SupportConversation =
            Parse.Object.extend(
                "SupportConversation"
            );

        const query =
            new Parse.Query(
                SupportConversation
            );

        const conversation =
            await query.get(
                currentConversation.id
            );

        currentConversation =
            conversation;

        const status =
            conversation.get(
                "status"
            );

        if (
            status === "closed"
        ) {

            setInputState(true);

            setSendButtonState(true, true);

        } else {

            setInputState(false);

            setSendButtonState(false);

        }

    } catch (error) {

        console.error(
            "Conversation polling error:",
            error
        );

    } finally {

        isPollingConversation = false;

    }

}

    async function closeConversation() {

    if (!currentConversation) {
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
            "closeSupportConversation",
            {
                conversationId:
                    currentConversation.id
            }
        );

        setInputState(true);

        setSendButtonState(true, true);

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

    async function reopenConversation() {

    if (!currentConversation) {
        return;
    }

    try {

        await Parse.Cloud.run(
            "reopenSupportConversation",
            {
                conversationId:
                    currentConversation.id
            }
        );

        setInputState(false);

        setSendButtonState(false);

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

    async function selectCameraAttachment() {

    closeAttachmentMenu();

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

        showToast(
            "Camera is not supported on this device or browser.",
            "error"
        );

        return;
    }

    try {

        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: {
                        ideal: "environment"
                    }
                },
                audio: false
            });

        cameraVideo.srcObject =
            cameraStream;

        cameraModal.classList.add("show");

    } catch (error) {

        console.error(
            "[LiveSupport] Camera access failed:",
            error
        );

        showToast(
            "Unable to access your camera. Please allow camera permission.",
            "error"
        );

    }

}

    async function initializeLiveSupport() {

        try {

            setSendButtonState(true, true);

            setInputState(true);

            const user =
                await getCurrentUser();

            if (!user) {
                return;
            }

            const conversation =
                await getOrCreateConversation();

            if (!conversation) {

                showToast(
                    "Unable to start your support conversation.",
                    "error"
                );

                return;
            }

            await loadConversationMessages();

            startMessagePolling();

startConversationPolling();

            setInputState(
                conversation.get("status") ===
                "closed"
            );

            setSendButtonState(
                conversation.get("status") ===
                "closed"
            );

            setupEventListeners();
            
            updateSendButtonState();

            scrollChatToBottom();

        } catch (error) {

            console.error(
                "Live support initialization failed:",
                error
            );

            showToast(
                "Unable to connect to Live Support.",
                "error"
            );

        }

    }

    window.sendSupportMessage =
        sendMessage;

    window.closeSupportConversation =
        closeConversation;

    window.reopenSupportConversation =
        reopenConversation;

    window.markSupportConversationRead =
        markConversationAsRead;

    document.addEventListener(
        "visibilitychange",
        async () => {

            if (
                document.visibilityState ===
                "visible"
            ) {

                await markConversationAsRead();

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
        typeof Parse !== "undefined"
    ) {

        initializeLiveSupport();

    } else {

        window.addEventListener(
            "load",
            initializeLiveSupport
        );

    }

})();
(function () {

    "use strict";

    const accessOverlay =
        document.getElementById("planAccessOverlay");

    const upgradeButton =
        document.getElementById("upgradeButton");

    async function checkPlanAccess() {

        if (!accessOverlay) {
            return;
        }

        try {

            const result =
                await Parse.Cloud.run(
                    "getCurrentSubscription"
                );

            const currentPlan =
                result &&
                result.currentSubscription &&
                result.currentSubscription.plan
                    ? result.currentSubscription.plan
                    : "Free";

            const normalizedPlan =
                String(currentPlan)
                    .trim()
                    .toLowerCase();

            const restricted =
                normalizedPlan === "free" ||
                normalizedPlan === "starter";

            if (restricted) {

                accessOverlay.classList.add(
                    "active"
                );

                document.body.classList.add(
                    "plan-access-blocked"
                );

            } else {

                accessOverlay.classList.remove(
                    "active"
                );

                document.body.classList.remove(
                    "plan-access-blocked"
                );

            }

        } catch (error) {

            accessOverlay.classList.add(
                "active"
            );

            document.body.classList.add(
                "plan-access-blocked"
            );

        }

    }

    if (upgradeButton) {

        upgradeButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "subscription.html";

            }
        );

    }

    if (typeof Parse !== "undefined") {

        checkPlanAccess();

    } else {

        window.addEventListener(
            "load",
            checkPlanAccess
        );

    }

})();
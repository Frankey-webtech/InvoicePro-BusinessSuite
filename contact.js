document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector(".contact-card form");

    if (!form) {
        return;
    }

    const inputs = form.querySelectorAll("input");
    const nameInput = inputs[0];
    const emailInput = inputs[1];
    const subjectInput = inputs[2];
    const messageInput = form.querySelector("textarea");
    const submitButton = form.querySelector('button[type="submit"]');

    function showMessage(type, message) {

        const existing = document.getElementById("contactMessage");

        if (existing) {
            existing.remove();
        }

        const box = document.createElement("div");

        box.id = "contactMessage";
        box.textContent = message;

        box.style.marginTop = "18px";
        box.style.padding = "14px 16px";
        box.style.borderRadius = "10px";
        box.style.fontSize = "14px";
        box.style.lineHeight = "1.5";
        box.style.fontWeight = "500";

        if (type === "success") {
            box.style.background = "#ecfdf5";
            box.style.color = "#047857";
            box.style.border = "1px solid #a7f3d0";
        } else {
            box.style.background = "#fef2f2";
            box.style.color = "#dc2626";
            box.style.border = "1px solid #fecaca";
        }

        form.appendChild(box);
    }

    function showSignupMessage() {

        const existing = document.getElementById("signupRequiredMessage");

        if (existing) {
            existing.remove();
        }

        const overlay = document.createElement("div");

        overlay.id = "signupRequiredMessage";

        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.background = "rgba(0, 0, 0, 0.45)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.padding = "20px";
        overlay.style.zIndex = "99999";

        const card = document.createElement("div");

        card.style.width = "100%";
        card.style.maxWidth = "430px";
        card.style.background = "#ffffff";
        card.style.borderRadius = "18px";
        card.style.padding = "30px";
        card.style.textAlign = "center";
        card.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.2)";

        const icon = document.createElement("div");

        icon.innerHTML = '<i class="ri-user-add-line"></i>';

        icon.style.width = "60px";
        icon.style.height = "60px";
        icon.style.margin = "0 auto 18px";
        icon.style.borderRadius = "50%";
        icon.style.background = "#eef2ff";
        icon.style.color = "#4f46e5";
        icon.style.display = "flex";
        icon.style.alignItems = "center";
        icon.style.justifyContent = "center";
        icon.style.fontSize = "28px";

        const title = document.createElement("h2");

        title.textContent = "Sign Up Required";

        title.style.margin = "0 0 10px";
        title.style.color = "#111827";
        title.style.fontSize = "22px";

        const text = document.createElement("p");

        text.textContent = "You are not a user. Please sign up to send your messages.";

        text.style.margin = "0 0 24px";
        text.style.color = "#6b7280";
        text.style.fontSize = "15px";
        text.style.lineHeight = "1.6";

        const signupButton = document.createElement("button");

        signupButton.type = "button";
        signupButton.textContent = "Sign Up to Send Your Message";

        signupButton.style.width = "100%";
        signupButton.style.padding = "13px 18px";
        signupButton.style.border = "none";
        signupButton.style.borderRadius = "10px";
        signupButton.style.background = "#4f46e5";
        signupButton.style.color = "#ffffff";
        signupButton.style.fontSize = "14px";
        signupButton.style.fontWeight = "600";
        signupButton.style.cursor = "pointer";

        signupButton.addEventListener("click", () => {
            window.location.href = "signup.html";
        });

        const closeButton = document.createElement("button");

        closeButton.type = "button";
        closeButton.textContent = "Cancel";

        closeButton.style.width = "100%";
        closeButton.style.marginTop = "10px";
        closeButton.style.padding = "12px 18px";
        closeButton.style.border = "1px solid #e5e7eb";
        closeButton.style.borderRadius = "10px";
        closeButton.style.background = "#ffffff";
        closeButton.style.color = "#374151";
        closeButton.style.fontSize = "14px";
        closeButton.style.fontWeight = "500";
        closeButton.style.cursor = "pointer";

        closeButton.addEventListener("click", () => {
            overlay.remove();
        });

        card.appendChild(icon);
        card.appendChild(title);
        card.appendChild(text);
        card.appendChild(signupButton);
        card.appendChild(closeButton);

        overlay.appendChild(card);

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                overlay.remove();
            }
        });

        document.body.appendChild(overlay);
    }

    function setLoading(loading) {

        submitButton.disabled = loading;

        if (loading) {
            submitButton.dataset.originalText =
                submitButton.textContent;

            submitButton.textContent = "Sending...";
            submitButton.style.opacity = "0.7";
            submitButton.style.cursor = "not-allowed";
        } else {
            submitButton.textContent =
                submitButton.dataset.originalText ||
                "Send Message";

            submitButton.style.opacity = "1";
            submitButton.style.cursor = "pointer";
        }
    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name =
            nameInput.value.trim();

        const email =
            emailInput.value.trim();

        const subject =
            subjectInput.value.trim();

        const message =
            messageInput.value.trim();

        if (!name) {
            showMessage(
                "error",
                "Please enter your full name."
            );
            nameInput.focus();
            return;
        }

        if (!email) {
            showMessage(
                "error",
                "Please enter your email address."
            );
            emailInput.focus();
            return;
        }

        if (!subject) {
            showMessage(
                "error",
                "Please enter a subject."
            );
            subjectInput.focus();
            return;
        }

        if (!message) {
            showMessage(
                "error",
                "Please enter your message."
            );
            messageInput.focus();
            return;
        }

        const currentUser =
            Parse.User.current();

        if (!currentUser) {
            showSignupMessage();
            return;
        }

        try {

            setLoading(true);

            const conversation =
                await Parse.Cloud.run(
                    "getSupportConversation"
                );

            if (
                !conversation ||
                !conversation.id
            ) {
                throw new Error(
                    "Unable to create your support conversation."
                );
            }

            const formattedMessage =
                `Name: ${name}\n` +
                `Email: ${email}\n` +
                `Subject: ${subject}\n\n` +
                message;

            await Parse.Cloud.run(
                "sendSupportMessage",
                {
                    conversationId:
                        conversation.id,

                    message:
                        formattedMessage
                }
            );

            showMessage(
                "success",
                "Your message has been sent successfully. Our support team will get back to you soon."
            );

            form.reset();

        } catch (error) {

            console.error(
                "Contact message error:",
                error
            );

            let errorMessage =
                "Unable to send your message. Please try again.";

            if (
                error &&
                error.message
            ) {
                errorMessage =
                    error.message;
            }

            if (
                errorMessage
                    .toLowerCase()
                    .includes("not authenticated")
            ) {
                showSignupMessage();
            } else {
                showMessage(
                    "error",
                    errorMessage
                );
            }

        } finally {

            setLoading(false);

        }

    });

});
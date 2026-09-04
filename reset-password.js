"use strict";

document.addEventListener("DOMContentLoaded", async function () {

    const params =
        new URLSearchParams(window.location.search);

    const token =
        params.get("token");

    const modal =
        document.getElementById("resetPasswordModal");

    const form =
        document.getElementById("resetPasswordForm");

    const passwordInput =
        document.getElementById("newPassword");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const submitButton =
        document.getElementById("resetPasswordButton");

    const errorMessage =
        document.getElementById("resetPasswordError");

    const successMessage =
        document.getElementById("resetPasswordSuccess");

    const passwordRequirements =
        document.getElementById("passwordRequirements");

    const successModal =
        document.getElementById("successModal");

    const countdown =
        document.getElementById("countdown");

    if (!modal) {
        return;
    }

    function showModal() {

        modal.classList.add("active");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

    }

    function hideModal() {

        modal.classList.remove("active");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }

    function showSuccessModal() {

        if (!successModal) {
            return;
        }

        successModal.classList.add("active");

        successModal.setAttribute(
            "aria-hidden",
            "false"
        );

    }

    function showError(message) {

        if (!errorMessage) {
            return;
        }

        errorMessage.textContent =
            message;

        errorMessage.style.display =
            "block";

    }

    function clearError() {

        if (!errorMessage) {
            return;
        }

        errorMessage.textContent =
            "";

        errorMessage.style.display =
            "none";

    }

    function showSuccess(message) {

        if (!successMessage) {
            return;
        }

        successMessage.textContent =
            message;

        successMessage.style.display =
            "block";

    }

    function hideForm() {

        if (!form) {
            return;
        }

        form.classList.add("is-hidden");

    }

    function showForm() {

        if (!form) {
            return;
        }

        form.classList.remove("is-hidden");

    }

    function setLoading(loading) {

        if (!submitButton) {
            return;
        }

        if (loading) {

            submitButton.disabled =
                true;

            submitButton.dataset.originalContent =
                submitButton.innerHTML;

            submitButton.innerHTML = `
                <span class="button-spinner"></span>
                <span>Saving Password...</span>
            `;

        } else {

            submitButton.disabled =
                false;

            submitButton.innerHTML =
                submitButton.dataset.originalContent ||
                "Set New Password";

        }

    }

    function validatePassword(password) {

        if (!password) {

            return "Please enter a new password.";

        }

        if (password.length < 8) {

            return "Your password must contain at least 8 characters.";

        }

        if (password.length > 128) {

            return "Your password is too long.";

        }

        return null;

    }

    function updatePasswordRequirement() {

        if (!passwordRequirements || !passwordInput) {
            return;
        }

        const password =
            passwordInput.value;

        passwordRequirements.classList.remove(
            "valid",
            "invalid"
        );

        if (!password) {
            return;
        }

        if (validatePassword(password)) {

            passwordRequirements.classList.add(
                "invalid"
            );

        } else {

            passwordRequirements.classList.add(
                "valid"
            );

        }

    }

    async function validateResetToken() {

        showModal();

        hideForm();

        if (!token) {

            showError(
                "This password reset link is missing or invalid."
            );

            return false;

        }

        if (
            typeof Parse === "undefined" ||
            !Parse.Cloud
        ) {

            showError(
                "Unable to connect to the server. Please try again later."
            );

            return false;

        }

        try {

            const result =
                await Parse.Cloud.run(
                    "validatePasswordResetToken",
                    {
                        token: token
                    }
                );

            if (
                !result ||
                result.valid !== true
            ) {

                showError(
                    result &&
                    result.message
                        ? result.message
                        : "This password reset link is invalid or has expired."
                );

                return false;

            }

            clearError();

            showForm();

            if (passwordInput) {
                passwordInput.focus();
            }

            return true;

        } catch (error) {

            console.error(
                "Reset token validation failed:",
                error
            );

            showError(
                error &&
                error.message
                    ? error.message
                    : "Unable to verify this password reset link."
            );

            return false;

        }

    }

    if (passwordInput) {

        passwordInput.addEventListener(
            "input",
            function () {

                clearError();

                updatePasswordRequirement();

            }
        );

    }

    if (confirmPasswordInput) {

        confirmPasswordInput.addEventListener(
            "input",
            function () {

                clearError();

            }
        );

    }

    if (form) {

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                clearError();

                if (
                    !passwordInput ||
                    !confirmPasswordInput
                ) {

                    showError(
                        "Unable to process the password form."
                    );

                    return;

                }

                const password =
                    passwordInput.value;

                const confirmPassword =
                    confirmPasswordInput.value;

                const passwordError =
                    validatePassword(password);

                if (passwordError) {

                    showError(
                        passwordError
                    );

                    passwordInput.focus();

                    return;

                }

                if (!confirmPassword) {

                    showError(
                        "Please confirm your new password."
                    );

                    confirmPasswordInput.focus();

                    return;

                }

                if (
                    password !==
                    confirmPassword
                ) {

                    showError(
                        "The passwords do not match."
                    );

                    confirmPasswordInput.focus();

                    return;

                }

                if (!token) {

                    showError(
                        "This password reset link is invalid."
                    );

                    return;

                }

                if (
                    typeof Parse === "undefined" ||
                    !Parse.Cloud
                ) {

                    showError(
                        "Unable to connect to the server."
                    );

                    return;

                }

                setLoading(true);

                try {

                    const result =
                        await Parse.Cloud.run(
                            "resetPasswordWithToken",
                            {
                                token: token,
                                password: password
                            }
                        );

                    if (
                        !result ||
                        result.success !== true
                    ) {

                        throw new Error(
                            result &&
                            result.message
                                ? result.message
                                : "Unable to change your password."
                        );

                    }

                    showSuccess(
                        "Your password has been changed successfully."
                    );

                    hideForm();

                    hideModal();

                    showSuccessModal();

                    let seconds = 3;

                    if (countdown) {

                        countdown.textContent =
                            "Redirecting to login in " +
                            seconds +
                            " seconds...";

                    }

                    const countdownTimer =
                        setInterval(
                            function () {

                                seconds--;

                                if (seconds > 0) {

                                    if (countdown) {

                                        countdown.textContent =
                                            "Redirecting to login in " +
                                            seconds +
                                            " seconds...";

                                    }

                                    return;

                                }

                                clearInterval(
                                    countdownTimer
                                );

                                if (countdown) {

                                    countdown.textContent =
                                        "Redirecting to login...";

                                }

                                window.location.replace(
                                    "login.html"
                                );

                            },
                            1000
                        );

                } catch (error) {

                    console.error(
                        "Password reset failed:",
                        error
                    );

                    showError(
                        error &&
                        error.message
                            ? error.message
                            : "Unable to change your password. Please try again."
                    );

                    setLoading(false);

                }

            }
        );

    }

    await validateResetToken();

});
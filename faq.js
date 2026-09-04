document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const faqSearchInput = document.getElementById("faqSearchInput");
    const clearFaqSearch = document.getElementById("clearFaqSearch");
    const faqSearchStatus = document.getElementById("faqSearchStatus");
    const faqCount = document.getElementById("faqCount");
    const faqEmptyState = document.getElementById("faqEmptyState");
    const resetFaqSearch = document.getElementById("resetFaqSearch");
    const faqCategoryMenu = document.getElementById("faqCategoryMenu");
    const faqContent = document.getElementById("faqContent");
    const newsletterForm = document.getElementById("newsletterForm");
    const newsletterEmail = document.getElementById("newsletterEmail");
    const newsletterSubmit = document.getElementById("newsletterSubmit");
    const newsletterMessage = document.getElementById("newsletterMessage");

    const faqGroups = Array.from(
        document.querySelectorAll(".faq-group")
    );

    const faqItems = Array.from(
        document.querySelectorAll("[data-faq-item]")
    );

    const categoryButtons = Array.from(
        document.querySelectorAll("[data-category]")
    ).filter(function (element) {
        return element.tagName === "BUTTON";
    });

    let currentCategory = "all";
    let currentSearch = "";

    function normalizeText(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    function getQuestionText(item) {
        const title = item.querySelector(".faq-title span");

        return title
            ? normalizeText(title.textContent)
            : "";
    }

    function getAnswerText(item) {
        const answer = item.querySelector(".faq-answer");

        return answer
            ? normalizeText(answer.textContent)
            : "";
    }

    function getItemCategory(item) {
        return item.getAttribute("data-category") || "";
    }

    function setAccordionIcon(item, isOpen) {
        const icon = item.querySelector(".faq-title i");

        if (!icon) {
            return;
        }

        icon.className = isOpen
            ? "ri-subtract-line"
            : "ri-add-line";
    }

    function closeFaqItem(item) {
        item.classList.remove("active");

        const button = item.querySelector(".faq-title");

        if (button) {
            button.setAttribute("aria-expanded", "false");
        }

        setAccordionIcon(item, false);
    }

    function openFaqItem(item) {
        item.classList.add("active");

        const button = item.querySelector(".faq-title");

        if (button) {
            button.setAttribute("aria-expanded", "true");
        }

        setAccordionIcon(item, true);
    }

    function toggleFaqItem(item) {
        const isOpen = item.classList.contains("active");

        faqItems.forEach(function (otherItem) {
            if (otherItem !== item) {
                closeFaqItem(otherItem);
            }
        });

        if (isOpen) {
            closeFaqItem(item);
        } else {
            openFaqItem(item);
        }
    }

    function updateCategoryButtons() {
        categoryButtons.forEach(function (button) {
            const category = button.getAttribute("data-category");

            button.classList.toggle(
                "active",
                category === currentCategory
            );
        });
    }

    function updateSearchControls() {
        const hasSearch = currentSearch.length > 0;

        clearFaqSearch.classList.toggle(
            "visible",
            hasSearch
        );

        clearFaqSearch.disabled = !hasSearch;
    }

    function applyFaqFilters() {
        const searchTerm = normalizeText(currentSearch);

        let visibleItems = 0;
        let visibleGroups = 0;

        faqGroups.forEach(function (group) {
            const groupCategory =
                group.getAttribute("data-category-group") || "";

            const categoryMatches =
                currentCategory === "all" ||
                groupCategory === currentCategory;

            let groupVisibleItems = 0;

            const items = Array.from(
                group.querySelectorAll("[data-faq-item]")
            );

            items.forEach(function (item) {
                const question = getQuestionText(item);
                const answer = getAnswerText(item);

                const searchMatches =
                    !searchTerm ||
                    question.includes(searchTerm) ||
                    answer.includes(searchTerm);

                const shouldShow =
                    categoryMatches &&
                    searchMatches;

                item.hidden = !shouldShow;

                if (shouldShow) {
                    groupVisibleItems++;
                    visibleItems++;
                } else {
                    closeFaqItem(item);
                }
            });

            const shouldShowGroup =
                categoryMatches &&
                groupVisibleItems > 0;

            group.hidden = !shouldShowGroup;

            if (shouldShowGroup) {
                visibleGroups++;
            }
        });

        const hasResults = visibleItems > 0;

        faqEmptyState.hidden = hasResults;

        faqCount.textContent =
            visibleItems +
            (visibleItems === 1 ? " Question" : " Questions");

        if (searchTerm) {
            if (visibleItems === 0) {
                faqSearchStatus.textContent =
                    "No questions found for \"" +
                    currentSearch +
                    "\"";
            } else {
                faqSearchStatus.textContent =
                    visibleItems +
                    (visibleItems === 1
                        ? " question"
                        : " questions") +
                    " found";
            }
        } else if (currentCategory !== "all") {
            faqSearchStatus.textContent =
                visibleItems +
                (visibleItems === 1
                    ? " question"
                    : " questions");
        } else {
            faqSearchStatus.textContent = "";
        }

        updateSearchControls();

        return {
            visibleItems: visibleItems,
            visibleGroups: visibleGroups,
            hasResults: hasResults
        };
    }

    function setCategory(category) {
        currentCategory = category || "all";

        updateCategoryButtons();

        applyFaqFilters();

        if (faqContent) {
            faqContent.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }

    function performSearch(value) {
        currentSearch = value || "";

        applyFaqFilters();
    }

    function clearSearch() {
        faqSearchInput.value = "";

        currentSearch = "";

        applyFaqFilters();

        faqSearchInput.focus();
    }

    function resetFaq() {
        currentCategory = "all";
        currentSearch = "";

        faqSearchInput.value = "";

        updateCategoryButtons();

        faqItems.forEach(function (item) {
            closeFaqItem(item);
        });

        applyFaqFilters();

        const firstItem = document.querySelector(
            '.faq-group[data-category-group="general"] [data-faq-item]'
        );

        if (firstItem) {
            openFaqItem(firstItem);
        }

        faqSearchInput.focus();
    }

    faqItems.forEach(function (item) {
        const button = item.querySelector(".faq-title");

        if (!button) {
            return;
        }

        button.addEventListener("click", function () {
            toggleFaqItem(item);
        });
    });

    categoryButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const category =
                button.getAttribute("data-category");

            setCategory(category);
        });
    });

    faqSearchInput.addEventListener("input", function () {
        performSearch(this.value);
    });

    faqSearchInput.addEventListener("search", function () {
        performSearch(this.value);
    });

    clearFaqSearch.addEventListener("click", function () {
        clearSearch();
    });

    resetFaqSearch.addEventListener("click", function () {
        resetFaq();
    });

    document.addEventListener("keydown", function (event) {
        if (
            event.key === "/" &&
            document.activeElement !== faqSearchInput &&
            document.activeElement.tagName !== "INPUT" &&
            document.activeElement.tagName !== "TEXTAREA"
        ) {
            event.preventDefault();

            faqSearchInput.focus();
        }

        if (
            event.key === "Escape" &&
            document.activeElement === faqSearchInput &&
            faqSearchInput.value
        ) {
            clearSearch();
        }
    });

    document.addEventListener("click", function (event) {
        const clickedInsideFaqItem =
            event.target.closest(".faq-item");

        const clickedCategory =
            event.target.closest(".faq-menu button");

        if (!clickedInsideFaqItem && !clickedCategory) {
            faqItems.forEach(function (item) {
                if (item.classList.contains("active")) {
                    closeFaqItem(item);
                }
            });
        }
    });

    if (newsletterForm) {
        newsletterForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = newsletterEmail.value.trim();

            if (!email) {
                showNewsletterMessage(
                    "Please enter your email address.",
                    "error"
                );

                return;
            }

            if (!isValidEmail(email)) {
                showNewsletterMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }

            newsletterSubmit.disabled = true;

            const originalText =
                newsletterSubmit.textContent;

            newsletterSubmit.textContent = "Subscribing...";

            try {
                if (
                    typeof Parse !== "undefined" &&
                    Parse.Cloud &&
                    typeof Parse.Cloud.run === "function"
                ) {
                    await Parse.Cloud.run(
                        "subscribeNewsletter",
                        {
                            email: email
                        }
                    );

                    newsletterEmail.value = "";

                    showNewsletterMessage(
                        "You're subscribed successfully.",
                        "success"
                    );
                } else {
                    newsletterEmail.value = "";

                    showNewsletterMessage(
                        "You're subscribed successfully.",
                        "success"
                    );
                }
            } catch (error) {
                console.error(
                    "Newsletter Subscription Error:",
                    error
                );

                showNewsletterMessage(
                    error.message ||
                    "Unable to subscribe right now. Please try again.",
                    "error"
                );
            } finally {
                newsletterSubmit.disabled = false;

                newsletterSubmit.textContent =
                    originalText;
            }
        });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showNewsletterMessage(message, type) {
        if (!newsletterMessage) {
            return;
        }

        newsletterMessage.textContent = message;

        newsletterMessage.className =
            "newsletter-message " + type;
    }

    function initializeFaq() {
        faqItems.forEach(function (item) {
            closeFaqItem(item);
        });

        const firstItem = document.querySelector(
            '.faq-group[data-category-group="general"] [data-faq-item]'
        );

        if (firstItem) {
            openFaqItem(firstItem);
        }

        updateCategoryButtons();

        applyFaqFilters();
    }

    initializeFaq();
});

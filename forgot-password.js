"use strict";

document.addEventListener("DOMContentLoaded", function() {
   
   const form =
      document.getElementById("forgotForm");
   
   const emailInput =
      document.getElementById("resetEmail");
   
   const modal =
      document.getElementById("verifyModal");
   
   const title =
      document.getElementById("verifyTitle");
   
   const text =
      document.getElementById("verifyText");
   
   const backToLogin =
      document.querySelector(".login-btn");
   
   if (!form || !emailInput || !modal) {
      return;
   }
   
   function showModal(
      modalTitle,
      modalText
   ) {
      
      title.textContent =
         modalTitle;
      
      text.textContent =
         modalText;
      
      modal.style.display =
         "flex";
      
   }
   
   function hideModal() {
      
      modal.style.display =
         "none";
      
   }
   
   function setButtonLoading(
      loading
   ) {
      
      const button =
         form.querySelector(
            ".reset-btn"
         );
      
      if (!button) {
         return;
      }
      
      if (loading) {
         
         button.disabled = true;
         
         button.dataset.originalContent =
            button.innerHTML;
         
         button.innerHTML = `
                <span class="button-spinner"></span>
                <span>Checking...</span>
            `;
         
      } else {
         
         button.disabled = false;
         
         button.innerHTML =
            button.dataset.originalContent ||
            `
                    <img src="mail-white.svg" alt="">
                    Verify Email
                `;
         
      }
      
   }
   
   function showError(message) {
      
      showModal(
         "Unable to continue",
         message
      );
      
      setTimeout(
         hideModal,
         3500
      );
      
   }
   
   form.addEventListener(
      "submit",
      async function(event) {
         
         event.preventDefault();
         
         const email =
            emailInput.value
            .trim()
            .toLowerCase();
         
         if (!email) {
            
            emailInput.focus();
            
            return;
            
         }
         
         if (
            !emailInput.checkValidity()
         ) {
            
            emailInput.reportValidity();
            
            return;
            
         }
         
         if (
            typeof Parse === "undefined"
         ) {
            
            showError(
               "The application could not connect to the server. Please try again."
            );
            
            return;
            
         }
         
         setButtonLoading(true);
         
         showModal(
            "Checking your account...",
            "Please wait while we verify your email address."
         );
         
         try {
            
            const result =
               await Parse.Cloud.run(
                  "requestPasswordReset",
                  {
                     email: email
                  }
               );
            
            if (
               !result ||
               result.success !== true
            ) {
               
               hideModal();
               
               showError(
                  result &&
                  result.message ?
                  result.message :
                  "No account exists with this email address."
               );
               
               return;
               
            }
            
            title.textContent =
               "Check your email";
            
            text.textContent =
               "We've sent a password reset link to " +
               email +
               ". Please check your inbox and follow the link to continue.";
            
            setTimeout(
               hideModal,
               5000
            );
            
            form.reset();
            
         } catch (error) {
            
            console.error(
               "Password reset request failed:",
               error
            );
            
            const message =
               error &&
               error.message ?
               error.message :
               "Unable to process your request. Please try again.";
            
            showError(
               message
            );
            
         } finally {
            
            setButtonLoading(false);
            
         }
         
      }
   );
   
   if (backToLogin) {
      
      backToLogin.addEventListener(
         "click",
         function() {
            
            window.location.href =
               "login.html";
            
         }
      );
      
   }
   
   modal.addEventListener(
      "click",
      function(event) {
         
         if (
            event.target === modal
         ) {
            
            hideModal();
            
         }
         
      }
   );
   
   document.addEventListener(
      "keydown",
      function(event) {
         
         if (
            event.key === "Escape"
         ) {
            
            hideModal();
            
         }
         
      }
   );
   
});
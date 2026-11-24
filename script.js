
document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("active");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
    });

    // Close the menu after selecting a navigation link
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
      });
    });

    // Close the menu when Escape is pressed
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
      }
    });

    // Close the mobile menu when returning to desktop width
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
      }
    });
  }

  // Automatically update the copyright year
  const currentYear = document.getElementById("currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // Set today's date as the earliest consultation date
  const consultationDate = document.querySelector(
    '#consultationForm input[type="date"]'
  );

  if (consultationDate) {
    const today = new Date();
    const localDate = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];

    consultationDate.min = localDate;
  }

  // Formspree submission settings
  const formspreeEndpoint = "https://formspree.io/f/mzerkgjo";

  async function handleFormSubmission(
    form,
    statusElement,
    successMessage
  ) {
    if (!form || !statusElement) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submitButton = form.querySelector(
        'button[type="submit"], input[type="submit"]'
      );

      const originalButtonText = submitButton
        ? submitButton.textContent
        : "";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      statusElement.textContent = "Please wait while your message is sent.";
      statusElement.classList.remove("success", "error");

      try {
        const response = await fetch(formspreeEndpoint, {
          method: "POST",
          body: new FormData(form),
          headers: {
            Accept: "application/json"
          }
        });

        let result = {};

        try {
          result = await response.json();
        } catch (error) {
          result = {};
        }

        if (response.ok) {
          statusElement.textContent = successMessage;
          statusElement.classList.add("success");
          form.reset();

          // Keep the consultation date restriction after resetting
          if (consultationDate) {
            const today = new Date();
            const localDate = new Date(
              today.getTime() - today.getTimezoneOffset() * 60000
            )
              .toISOString()
              .split("T")[0];

            consultationDate.min = localDate;
          }
        } else {
          const errorMessage =
            result.errors && result.errors.length
              ? result.errors.map((error) => error.message).join(" ")
              : "Something went wrong. Please try again.";

          statusElement.textContent = errorMessage;
          statusElement.classList.add("error");
        }
      } catch (error) {
        statusElement.textContent =
          "Your message could not be sent right now. Please try again later or contact us through Telegram.";

        statusElement.classList.add("error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });
  }

  // Consultation request form
  const consultationForm = document.getElementById("consultationForm");
  const consultationMessage = document.getElementById(
    "consultationMessage"
  );

  handleFormSubmission(
    consultationForm,
    consultationMessage,
    "Your consultation request has been received. We will contact you to discuss availability and confirm a time. Please note that your appointment is not confirmed yet."
  );

  // General contact form
  const contactForm = document.getElementById("contactForm");
  const contactMessageStatus = document.getElementById(
    "contactMessageStatus"
  );

  handleFormSubmission(
    contactForm,
    contactMessageStatus,
    "Thank you! Your message has been sent successfully. We look forward to connecting with you."
  );
});

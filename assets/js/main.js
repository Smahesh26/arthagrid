/**
 * ARTHAGRID FINANCIAL SERVICES - Interactive Client Engine
 * Features: Live EMI Calculator, Mobile Nav, Modals, Forms & Tracking
 */

document.addEventListener('DOMContentLoaded', () => {
  localStorage.removeItem('arthagrid_theme');
  document.documentElement.removeAttribute('data-theme');
  initStickyNavbar();
  initMobileMenu();
  initEmiCalculator();
  initFaqAccordion();
  initModals();
  initForms();
  initBackToTop();
});

/* ==========================================================================
   1. Sticky Navbar & Scroll Spy
   ========================================================================== */
function initStickyNavbar() {
  const header = document.getElementById('siteHeader');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    // Header blur/shadow class
    if (header) {
      if (scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Scroll spy
    sections.forEach(sec => {
      const secHeight = sec.offsetHeight;
      const secTop = sec.offsetTop - 120;
      const secId = sec.getAttribute('id');

      if (scrollY > secTop && scrollY <= secTop + secHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${secId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

/* ==========================================================================
   3. Mobile Navigation Menu
   ========================================================================== */
function initMobileMenu() {
  const toggle = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('navMenu');

  if (!toggle || !navMenu) return;

  toggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const isOpen = navMenu.classList.contains('active');
    toggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });

  // Close when clicking a nav link
  document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      toggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });
}

/* ==========================================================================
   4. Advanced Interactive EMI Calculator
   ========================================================================== */
function initEmiCalculator() {
  const amountSlider = document.getElementById('calcAmountSlider');
  const rateSlider = document.getElementById('calcRateSlider');
  const tenureSlider = document.getElementById('calcTenureSlider');

  const amountDisplay = document.getElementById('calcAmountDisplay');
  const rateDisplay = document.getElementById('calcRateDisplay');
  const tenureDisplay = document.getElementById('calcTenureDisplay');

  const emiOutput = document.getElementById('emiOutput');
  const principalOutput = document.getElementById('principalOutput');
  const interestOutput = document.getElementById('interestOutput');
  const totalPayableOutput = document.getElementById('totalPayableOutput');
  const chartCircle = document.getElementById('chartCircle');

  if (!amountSlider || !rateSlider || !tenureSlider) return;

  // Presets for Loan Types
  const presets = {
    personal: { amount: 500000, rate: 10.75, tenure: 3 },
    home: { amount: 4500000, rate: 8.50, tenure: 20 },
    business: { amount: 2000000, rate: 12.00, tenure: 5 },
    lap: { amount: 6000000, rate: 9.25, tenure: 15 }
  };

  document.querySelectorAll('.calc-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.calc-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const loanType = btn.getAttribute('data-loan');
      if (presets[loanType]) {
        amountSlider.value = presets[loanType].amount;
        rateSlider.value = presets[loanType].rate;
        tenureSlider.value = presets[loanType].tenure;
        calculateEMI();
      }
    });
  });

  function formatIndianCurrency(num) {
    return '₹' + Number(Math.round(num)).toLocaleString('en-IN');
  }

  function calculateEMI() {
    const P = parseFloat(amountSlider.value);
    const annualRate = parseFloat(rateSlider.value);
    const tenureYears = parseFloat(tenureSlider.value);

    // Update Slider Badges
    amountDisplay.textContent = formatIndianCurrency(P);
    rateDisplay.textContent = annualRate.toFixed(2) + '% p.a.';
    tenureDisplay.textContent = tenureYears + (tenureYears === 1 ? ' Year' : ' Years') + ` (${tenureYears * 12} Mos)`;

    // Monthly Interest Rate (r) and Total Months (n)
    const r = (annualRate / 12) / 100;
    const n = tenureYears * 12;

    // EMI Formula: [P x r x (1+r)^n] / [(1+r)^n - 1]
    let emi = 0;
    if (r === 0) {
      emi = P / n;
    } else {
      const pow = Math.pow(1 + r, n);
      emi = (P * r * pow) / (pow - 1);
    }

    const totalPayable = emi * n;
    const totalInterest = totalPayable - P;

    // Update UI Results
    emiOutput.textContent = formatIndianCurrency(emi);
    principalOutput.textContent = formatIndianCurrency(P);
    interestOutput.textContent = formatIndianCurrency(totalInterest);
    totalPayableOutput.textContent = formatIndianCurrency(totalPayable);

    // Update SVG Donut chart
    if (chartCircle) {
      const circumference = 2 * Math.PI * 40; // r=40
      const principalRatio = P / totalPayable;
      const strokeDashoffset = circumference * (1 - principalRatio);
      chartCircle.style.strokeDasharray = `${circumference}`;
      chartCircle.style.strokeDashoffset = `${strokeDashoffset}`;
    }
  }

  amountSlider.addEventListener('input', calculateEMI);
  rateSlider.addEventListener('input', calculateEMI);
  tenureSlider.addEventListener('input', calculateEMI);

  // Initial calculation on load
  calculateEMI();

  // "Apply with this Plan" CTA in calculator
  const applyCalcBtn = document.getElementById('applyWithCalculatedPlanBtn');
  if (applyCalcBtn) {
    applyCalcBtn.addEventListener('click', () => {
      const amt = amountSlider.value;
      const modal = document.getElementById('applyModal');
      const modalAmtInput = document.getElementById('modalLoanAmount');
      if (modalAmtInput) modalAmtInput.value = amt;
      openModal(modal);
    });
  }
}

/* ==========================================================================
   5. FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;
    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   6. Modals & Quick Application Drawer
   ========================================================================== */
function initModals() {
  const modal = document.getElementById('applyModal');
  const closeBtns = document.querySelectorAll('.modal-close-trigger');
  const openTriggers = document.querySelectorAll('.apply-modal-trigger');

  openTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const service = btn.getAttribute('data-service') || 'General Inquiry';
      const serviceSelect = document.getElementById('modalServiceSelect');
      if (serviceSelect && service) {
        serviceSelect.value = service;
      }
      openModal(modal);
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => closeModal(modal));
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  }
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

/* ==========================================================================
   7. Form Submissions & Toast Feedback
   ========================================================================== */
function initForms() {
  // Main Inquiry Form
  const mainForm = document.getElementById('mainInquiryForm');
  if (mainForm) {
    mainForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleFormSubmit(mainForm, 'Your application has been received! Our senior loan officer will call you within 15 minutes.');
    });
  }

  // Modal Fast Application Form
  const modalForm = document.getElementById('modalFastApplyForm');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const modal = document.getElementById('applyModal');
      closeModal(modal);
      handleFormSubmit(modalForm, 'Fast-track application initiated! Check your phone for instant verification status.');
    });
  }

  // Newsletter Subscribe Form
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      newsletterForm.reset();
      showToast('Subscribed! You will receive weekly updates on low interest rates and market offers.');
    });
  }
}

function handleFormSubmit(form, successMessage) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';

  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
  }

  setTimeout(() => {
    form.reset();
    if (submitBtn) {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
    showToast(successMessage);
  }, 900);
}

function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <i class="fas fa-check-circle toast-icon"></i>
    <span>${message}</span>
  `;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4800);
}

/* ==========================================================================
   8. Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const topBtn = document.getElementById('backToTopBtn');
  if (!topBtn) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
      topBtn.classList.add('visible');
    } else {
      topBtn.classList.remove('visible');
    }
  });

  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

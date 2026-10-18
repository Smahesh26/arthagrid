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
  initInfoModal();
  initForms();
  initBackToTop();
  initWhatsAppLinks();
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
      if (serviceSelect) {
        let matched = false;
        const target = service.toLowerCase();
        for (let i = 0; i < serviceSelect.options.length; i++) {
          const optVal = serviceSelect.options[i].value.toLowerCase();
          if (optVal.includes(target) || target.includes(optVal)) {
            serviceSelect.selectedIndex = i;
            matched = true;
            break;
          }
        }
        if (!matched) {
          serviceSelect.value = 'General Inquiry';
        }
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
   6B. Information & Legal Popups (Privacy Policy, Terms, Grievance Redressal)
   ========================================================================== */
function initInfoModal() {
  const infoModal = document.getElementById('infoModal');
  if (!infoModal) return;

  const titleEl = document.getElementById('infoModalTitle');
  const subtitleEl = document.getElementById('infoModalSubtitle');
  const badgeEl = document.getElementById('infoModalBadge');
  const bodyEl = document.getElementById('infoModalBody');
  const actionBtn = document.getElementById('infoModalActionBtn');
  const closeBtns = infoModal.querySelectorAll('.info-modal-close');

  const infoRegistry = {
    'privacy-policy': {
      badge: '<i class="fas fa-shield-halved"></i> <span>Data Privacy & Security</span>',
      title: 'Privacy Policy',
      subtitle: 'Effective Date: October 2026 • ARTHAGRID Financial Services',
      isLegal: true,
      content: `
        <div class="info-callout">
          <strong>Our Privacy Pledge:</strong> ARTHAGRID is dedicated to safeguarding your personal and financial information. We adhere strictly to the Information Technology Act, 2000, RBI Digital Lending Guidelines, and applicable data privacy regulations in India.
        </div>

        <h4><i class="fas fa-check-circle"></i> 1. Information We Collect</h4>
        <p>To assess your credit eligibility and facilitate loan disbursements with our institutional banking partners, we collect:</p>
        <ul class="info-feature-list">
          <li><i class="fas fa-angle-right"></i> <strong>Identity & Contact Details:</strong> Full name, date of birth, PAN, Aadhaar (in accordance with UIDAI voluntary masking directives), mobile number, email, and residential address.</li>
          <li><i class="fas fa-angle-right"></i> <strong>Financial Records:</strong> Bank account statements, salary slips, Form 16/ITR acknowledgments, business registration proof, and credit history reports.</li>
          <li><i class="fas fa-angle-right"></i> <strong>Employment & Business Details:</strong> Employer name, office address, years of operation, and monthly net income.</li>
        </ul>

        <h4><i class="fas fa-check-circle"></i> 2. Purpose and Usage of Data</h4>
        <p>Your data is processed strictly for the following purposes:</p>
        <ul class="info-feature-list">
          <li><i class="fas fa-angle-right"></i> Evaluating loan eligibility across 25+ partner Banks and RBI-registered NBFCs.</li>
          <li><i class="fas fa-angle-right"></i> Routing and processing application files with credit underwriting departments.</li>
          <li><i class="fas fa-angle-right"></i> Real-time application tracking, automated repayment alerts, and fraud prevention.</li>
        </ul>

        <h4><i class="fas fa-check-circle"></i> 3. Absolute Zero Data-Selling Policy</h4>
        <p>We <strong>never sell, trade, rent, or lease</strong> your personal or financial records to third-party telemarketers or external advertising networks. Data is shared exclusively with RBI-regulated scheduled banks and NBFCs with which you explicitly choose to apply.</p>

        <h4><i class="fas fa-check-circle"></i> 4. Bank-Grade Encryption & Infrastructure</h4>
        <p>All sensitive information transmitted through ARTHAGRID utilizes <strong>256-bit TLS/SSL encryption</strong>. Our database infrastructure operates within secure, ISO 27001-certified cloud facilities protected by strict multi-factor authentication and role-based access protocols.</p>

        <h4><i class="fas fa-check-circle"></i> 5. Your Rights & Data Retention</h4>
        <p>You reserve the right to review, rectify, or request erasure of your data from our active customer systems upon successful completion or withdrawal of your loan process. For any data-related requests, please email our Data Protection team at <strong>Primary@arthagrid.in</strong>.</p>
      `
    },

    'terms-of-service': {
      badge: '<i class="fas fa-scale-balanced"></i> <span>Service Agreement</span>',
      title: 'Terms of Service',
      subtitle: 'Terms & Conditions Governing Use of ARTHAGRID Financial Services',
      isLegal: true,
      content: `
        <div class="info-callout">
          <strong>Important Notice:</strong> By accessing ARTHAGRID’s website or submitting a loan inquiry, you agree to comply with and be bound by the following terms and conditions.
        </div>

        <h4><i class="fas fa-check-circle"></i> 1. Scope of Financial Advisory Services</h4>
        <p>ARTHAGRID Financial Services acts as an authorized Corporate Direct Selling Associate (DSA) and financial consultancy partner for leading Scheduled Commercial Banks and RBI-registered NBFCs. We facilitate credit evaluation, documentation assistance, and application submissions.</p>

        <h4><i class="fas fa-check-circle"></i> 2. Lending Institution Discretion</h4>
        <ul class="info-feature-list">
          <li><i class="fas fa-angle-right"></i> Loan sanction, interest rates, tenure, loan amount, and disbursal are the sole, independent discretion of the lending Bank or NBFC under their respective credit policies.</li>
          <li><i class="fas fa-angle-right"></i> Pre-eligibility estimates on our portal or calculator do not constitute an official sanction letter or unconditional loan guarantee.</li>
        </ul>

        <h4><i class="fas fa-check-circle"></i> 3. Borrower Representations & Warranties</h4>
        <p>As an applicant, you warrant that:</p>
        <ul class="info-feature-list">
          <li><i class="fas fa-angle-right"></i> You are at least 18 years of age and legally competent to enter into a binding contract under the Indian Contract Act, 1872.</li>
          <li><i class="fas fa-angle-right"></i> All information, income statements, and KYC documents provided by you are authentic, valid, and truthful. Submission of fraudulent records will result in immediate disqualification and legal reporting.</li>
        </ul>

        <h4><i class="fas fa-check-circle"></i> 4. No Advance / Processing Fees Policy</h4>
        <p>ARTHAGRID <strong>does not charge any upfront cash, advance fees, or deposit amounts</strong> to check your loan eligibility. Any official processing fees, administrative charges, or stamp duties are deducted directly by the lending bank from the sanctioned disbursement amount, as itemized in the lender's sanction agreement.</p>

        <h4><i class="fas fa-check-circle"></i> 5. Governing Law & Jurisdiction</h4>
        <p>These terms are governed by the laws of India. Any claims, disagreements, or legal proceedings arising in connection with our services shall be subject to the exclusive jurisdiction of courts located in Jaipur / New Delhi, India.</p>
      `
    },

    'grievance-redressal': {
      badge: '<i class="fas fa-headset"></i> <span>Customer First</span>',
      title: 'Grievance Redressal Policy',
      subtitle: 'Committed to Fair Practices Code & Rapid Dispute Resolution',
      isLegal: true,
      content: `
        <div class="info-callout">
          <strong>Customer Satisfaction Commitment:</strong> At ARTHAGRID, we uphold the highest standards of transparency and service excellence. If you encounter any concern, service delay, or documentation issue, our structured 3-tier grievance mechanism ensures swift resolution.
        </div>

        <h4><i class="fas fa-layer-group"></i> Level 1: Customer Support Helpdesk</h4>
        <p>For immediate support regarding your loan application, status verification, or document queries:</p>
        <ul class="info-feature-list">
          <li><i class="fas fa-envelope"></i> <strong>Email:</strong> Primary@arthagrid.in</li>
          <li><i class="fas fa-phone"></i> <strong>Helpline:</strong> +91 92891 47417 (Mon – Sat: 9:30 AM to 6:30 PM)</li>
          <li><i class="fas fa-clock"></i> <strong>Turnaround Time (TAT):</strong> 24 to 48 business hours.</li>
        </ul>

        <h4><i class="fas fa-user-tie"></i> Level 2: Grievance Redressal Officer (GRO)</h4>
        <p>If your grievance is not resolved to your satisfaction within 5 working days at Level 1, you can escalate your complaint to our designated Principal Grievance Officer:</p>
        <div class="info-stat-card" style="margin: 12px 0;">
          <div class="info-stat-label">Designated Compliance Officer</div>
          <div class="info-stat-val" style="font-size:0.95rem; font-weight:700; color:var(--brand-navy);">Grievance & Compliance Desk — ARTHAGRID</div>
          <p style="margin-top:6px; font-size:0.85rem; color:var(--text-secondary);">
            <strong>Email:</strong> Primary@arthagrid.in<br>
            <strong>Office:</strong> UNIT NO. G-34, SECTOR - 3, NOIDA, Gautam Buddha Nagar, Uttar Pradesh - 201301<br>
            <strong>Resolution TAT:</strong> Within 7 working days.
          </p>
        </div>

        <h4><i class="fas fa-landmark"></i> Level 3: Regulatory Ombudsman Mechanism</h4>
        <p>If a complaint submitted in relation to a loan transaction through our partner bank or NBFC is not addressed within 30 days, customers have the option to approach the <strong>RBI Ombudsman Scheme</strong> through the Reserve Bank’s official Complaint Management System at <a href="https://cms.rbi.org.in" target="_blank" rel="noopener noreferrer" style="color:var(--brand-gold-dark); font-weight:600; text-decoration:underline;">cms.rbi.org.in</a>.</p>
      `
    },

    'personal-loan': {
      badge: '<i class="fas fa-user-shield"></i> <span>Unsecured Financing</span>',
      title: 'Personal Loan',
      subtitle: 'Collateral-free liquidity for personal, medical, or capital requirements',
      service: 'Personal Loan',
      content: `
        <div class="info-modal-grid">
          <div class="info-stat-card">
            <div class="info-stat-label">Interest Rates</div>
            <div class="info-stat-val">From 9.95% p.a.</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Loan Quantum</div>
            <div class="info-stat-val">Up to ₹40 Lakhs</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Tenure Duration</div>
            <div class="info-stat-val">12 to 60 Months</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Disbursal TAT</div>
            <div class="info-stat-val">24 to 48 Hours</div>
          </div>
        </div>
        <h4><i class="fas fa-star"></i> Key Advantages</h4>
        <ul class="info-feature-list">
          <li><i class="fas fa-check"></i> Zero collateral or guarantor requirement.</li>
          <li><i class="fas fa-check"></i> Minimal documentation with instant digital KYC.</li>
          <li><i class="fas fa-check"></i> Flexible end-use: travel, wedding, home renovation, or debt consolidation.</li>
        </ul>
        <h4><i class="fas fa-file-invoice"></i> Required Documents</h4>
        <p>PAN Card, Aadhaar Card, last 3 months' salary slips, 6 months' bank statements, and current address verification.</p>
      `
    },

    'home-loan': {
      badge: '<i class="fas fa-house-chimney"></i> <span>Secured Property Loan</span>',
      title: 'Home Loan & Balance Transfer',
      subtitle: 'Acquire your dream residence with market-lowest interest rates',
      service: 'Home Loan',
      content: `
        <div class="info-modal-grid">
          <div class="info-stat-card">
            <div class="info-stat-label">Interest Rates</div>
            <div class="info-stat-val">From 8.99% p.a.</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Loan Coverage</div>
            <div class="info-stat-val">Up to 90% Cost</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Tenure Range</div>
            <div class="info-stat-val">Up to 30 Years</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Prepayment Penalty</div>
            <div class="info-stat-val">Zero (Floating)</div>
          </div>
        </div>
        <h4><i class="fas fa-star"></i> Key Advantages</h4>
        <ul class="info-feature-list">
          <li><i class="fas fa-check"></i> Balance transfer with attractive high-ticket top-up funds.</li>
          <li><i class="fas fa-check"></i> Expert legal and property valuation scrutiny by partner banks.</li>
          <li><i class="fas fa-check"></i> Significant tax savings under Sections 24(b) and 80C.</li>
        </ul>
        <h4><i class="fas fa-file-invoice"></i> Required Documents</h4>
        <p>KYC records, Form 16 / ITR of past 2 years, bank statements for 6 months, and chain of property deeds.</p>
      `
    },

    'business-loan': {
      badge: '<i class="fas fa-briefcase"></i> <span>Commercial Credit</span>',
      title: 'Business & MSME Loan',
      subtitle: 'Unleash business growth, working capital, and equipment financing',
      service: 'Business Loan',
      content: `
        <div class="info-modal-grid">
          <div class="info-stat-card">
            <div class="info-stat-label">Interest Rates</div>
            <div class="info-stat-val">From 12% p.a.</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Unsecured Ticket</div>
            <div class="info-stat-val">Up to ₹75 Lakhs</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Repayment Tenure</div>
            <div class="info-stat-val">12 to 60 Months</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Eligible Entities</div>
            <div class="info-stat-val">Prop / LLP / Pvt Ltd</div>
          </div>
        </div>
        <h4><i class="fas fa-star"></i> Key Advantages</h4>
        <ul class="info-feature-list">
          <li><i class="fas fa-check"></i> No collateral required up to ₹75 Lakhs under CGTMSE / partner NBFC schemes.</li>
          <li><i class="fas fa-check"></i> Customized repayment structures aligned with business seasonality.</li>
          <li><i class="fas fa-check"></i> Boost operational liquidity and bulk inventory restocking.</li>
        </ul>
        <h4><i class="fas fa-file-invoice"></i> Required Documents</h4>
        <p>GST returns (12 months), banking statements (12 months), 2 years ITR with audited balance sheet & P&L, business proof (Udyam, MOA/AOA).</p>
      `
    },

    'overdraft': {
      badge: '<i class="fas fa-wallet"></i> <span>Revolving Limit</span>',
      title: 'Overdraft & Cash Credit Facility',
      subtitle: 'Flexible working capital limit with interest charged strictly on daily usage',
      service: 'Overdraft',
      content: `
        <div class="info-modal-grid">
          <div class="info-stat-card">
            <div class="info-stat-label">Interest Rate</div>
            <div class="info-stat-val">From 11% p.a.</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Interest Accrual</div>
            <div class="info-stat-val">Daily on Used Sum</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Deposit Flexibility</div>
            <div class="info-stat-val">Anytime Repay</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Facility Renewal</div>
            <div class="info-stat-val">Annual Review</div>
          </div>
        </div>
        <h4><i class="fas fa-star"></i> Key Advantages</h4>
        <ul class="info-feature-list">
          <li><i class="fas fa-check"></i> Pay interest only for the exact amount and number of days utilized.</li>
          <li><i class="fas fa-check"></i> Deposit surplus receivables anytime to reduce interest costs immediately.</li>
          <li><i class="fas fa-check"></i> Prevent cheque bounces and maintain robust vendor credit ratings.</li>
        </ul>
      `
    },

    'cibil-repair': {
      badge: '<i class="fas fa-chart-line"></i> <span>Credit Advisory</span>',
      title: 'CIBIL Score Restoration & Advisory',
      subtitle: 'Comprehensive credit audit, error rectification, and score enhancement to 750+',
      service: 'CIBIL Repair',
      content: `
        <div class="info-modal-grid">
          <div class="info-stat-card">
            <div class="info-stat-label">Target Score</div>
            <div class="info-stat-val">750+ CIBIL</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Audit Scope</div>
            <div class="info-stat-val">All 4 Bureaus</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Typical Timeline</div>
            <div class="info-stat-val">60 to 120 Days</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Dispute Handling</div>
            <div class="info-stat-val">Direct with Lender</div>
          </div>
        </div>
        <h4><i class="fas fa-star"></i> How We Help</h4>
        <ul class="info-feature-list">
          <li><i class="fas fa-check"></i> Audit CIR files across CIBIL, Experian, Equifax, and CRIF High Mark.</li>
          <li><i class="fas fa-check"></i> Rectify inaccurate DPD (Days Past Due), duplicate loan accounts, and disputed settled statuses.</li>
          <li><i class="fas fa-check"></i> Guidance on debt-to-income optimization to re-qualify for lowest bank interest rates.</li>
        </ul>
      `
    },

    'education-loan': {
      badge: '<i class="fas fa-graduation-cap"></i> <span>Academic Financing</span>',
      title: 'Education Loan',
      subtitle: 'Finance undergraduate & postgraduate degrees across India and top universities worldwide',
      service: 'Education Loan',
      content: `
        <div class="info-modal-grid">
          <div class="info-stat-card">
            <div class="info-stat-label">Interest Rates</div>
            <div class="info-stat-val">From 8.85% p.a.</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Loan Quantum</div>
            <div class="info-stat-val">Up to ₹1.5 Crores</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Coverage</div>
            <div class="info-stat-val">100% Tuition & Living</div>
          </div>
          <div class="info-stat-card">
            <div class="info-stat-label">Tax Benefit</div>
            <div class="info-stat-val">Sec 80E Deduction</div>
          </div>
        </div>
        <h4><i class="fas fa-star"></i> Key Advantages</h4>
        <ul class="info-feature-list">
          <li><i class="fas fa-check"></i> Full moratorium period throughout study duration + 6 to 12 months after graduation.</li>
          <li><i class="fas fa-check"></i> Covers tuition fees, accommodation, living expenses, travel tickets, and study laptops.</li>
          <li><i class="fas fa-check"></i> Express sanction letters to meet university admission and visa deadlines.</li>
        </ul>
        <h4><i class="fas fa-file-invoice"></i> Required Documents</h4>
        <p>Admission letter from recognized university/college, fee structure estimate, academic marksheets (10th, 12th, Degree), co-applicant KYC and income proofs.</p>
      `
    }
  };

  // Open triggers
  document.querySelectorAll('.info-modal-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const infoKey = trigger.getAttribute('data-info');
      const data = infoRegistry[infoKey];
      if (!data) return;

      if (badgeEl) badgeEl.innerHTML = data.badge;
      if (titleEl) titleEl.textContent = data.title;
      if (subtitleEl) subtitleEl.textContent = data.subtitle;
      if (bodyEl) bodyEl.innerHTML = data.content;

      // Adjust Action Button for Legal vs Loan
      if (actionBtn) {
        if (data.isLegal) {
          actionBtn.innerHTML = '<i class="fas fa-check"></i> Close';
          actionBtn.onclick = () => closeModal(infoModal);
        } else {
          actionBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Apply Now';
          actionBtn.onclick = () => {
            closeModal(infoModal);
            const applyModal = document.getElementById('applyModal');
            const serviceSelect = document.getElementById('modalServiceSelect');
            if (serviceSelect && data.service) {
              serviceSelect.value = data.service;
            }
            openModal(applyModal);
          };
        }
      }

      // Reset scroll position to top when opened
      const dialogContent = infoModal.querySelector('.modal-content');
      if (dialogContent) dialogContent.scrollTop = 0;

      openModal(infoModal);
    });
  });

  // Close triggers
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => closeModal(infoModal));
  });

  // Click outside backdrop to close
  infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) closeModal(infoModal);
  });

  // Global ESC key to close active modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(infoModal);
      const applyModal = document.getElementById('applyModal');
      closeModal(applyModal);
    }
  });
}

/* ==========================================================================
   7. Form Submissions & Toast Feedback
   ========================================================================== */
const PRIMARY_SUBMISSION_EMAIL = 'Primary@arthagrid.in';

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
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const emailVal = emailInput ? emailInput.value.trim() : '';

      const submitBtn = newsletterForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Subscribe';
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;
      }

      const formData = new FormData();
      formData.append('subscriber_email', emailVal);
      formData.append('_subject', `New Newsletter Subscriber: ${emailVal}`);
      formData.append('_captcha', 'false');
      formData.append('form_source', 'ARTHAGRID Footer Newsletter');

      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(PRIMARY_SUBMISSION_EMAIL)}`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
      .catch(err => console.warn('Newsletter submission forwarded:', err))
      .finally(() => {
        newsletterForm.reset();
        if (submitBtn) {
          submitBtn.innerHTML = originalBtnHtml;
          submitBtn.disabled = false;
        }
        showToast('Subscribed! You will receive weekly updates on low interest rates and market offers.');
      });
    });
  }
}

function handleFormSubmit(form, successMessage) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';

  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting to Primary@arthagrid.in...';
    submitBtn.disabled = true;
  }

  const formData = new FormData(form);

  // Derive lead descriptive subject for Zoho Mail
  const applicantName = formData.get('fullName') || formData.get('name') || 'New Prospect';
  const service = formData.get('product') || formData.get('service') || 'Loan Consultation';
  const amount = formData.get('amount') ? '₹' + Number(formData.get('amount')).toLocaleString('en-IN') : 'N/A';
  const phone = formData.get('phone') || 'N/A';

  formData.append('_subject', `[ARTHAGRID Lead] ${applicantName} | ${service} (${amount})`);
  formData.append('_template', 'table');
  formData.append('_captcha', 'false');
  formData.append('submission_time', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
  formData.append('lead_destination', PRIMARY_SUBMISSION_EMAIL);

  fetch(`https://formsubmit.co/ajax/${encodeURIComponent(PRIMARY_SUBMISSION_EMAIL)}`, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(res => res.json())
  .catch(err => {
    console.warn('Form submission dispatch note:', err);
  })
  .finally(() => {
    form.reset();
    if (submitBtn) {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
    showToast(successMessage);
  });
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

/* ==========================================================================
   9. Universal WhatsApp Redirection Engine
   Ensures seamless opening across mobile apps and desktop WhatsApp Web
   ========================================================================== */
function initWhatsAppLinks() {
  const WHATSAPP_PHONE = '919289147417';

  document.querySelectorAll('a[href*="whatsapp"], a[href*="wa.me"], .whatsapp-link').forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');

    link.addEventListener('click', (e) => {
      e.preventDefault();
      let rawHref = link.getAttribute('href') || '';
      let text = 'Hello ArthaGrid team, I would like to inquire about a loan.';

      try {
        if (rawHref.includes('text=')) {
          const urlObj = new URL(rawHref, window.location.origin);
          const t = urlObj.searchParams.get('text');
          if (t) text = t;
        }
      } catch (err) {
        const m = rawHref.match(/text=([^&]+)/);
        if (m && m[1]) text = decodeURIComponent(m[1]);
      }

      const encodedText = encodeURIComponent(text);
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        // Direct intent protocol for instant app launch on mobile
        window.location.href = `whatsapp://send?phone=${WHATSAPP_PHONE}&text=${encodedText}`;
        // Fallback to web API in case WhatsApp app is not installed
        setTimeout(() => {
          window.open(`https://api.whatsapp.com/send/?phone=${WHATSAPP_PHONE}&text=${encodedText}`, '_blank', 'noopener,noreferrer');
        }, 1200);
      } else {
        // Desktop: open official WhatsApp Web / Desktop interface cleanly
        window.open(`https://api.whatsapp.com/send/?phone=${WHATSAPP_PHONE}&text=${encodedText}`, '_blank', 'noopener,noreferrer');
      }
    });
  });
}

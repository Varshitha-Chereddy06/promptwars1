import { AnalysisResult, Persona } from './types';

export interface SampleContract {
  id: string;
  title: string;
  category: string;
  filename: string;
  content: string;
  defaultPersona: Persona;
  preparsedResult: AnalysisResult;
}

export const SAMPLE_PERSONAS: Persona[] = [
  {
    id: 'freelancer-1',
    name: 'Freelancer Alex',
    role: 'Freelance Software Developer & Consultant',
    description: "I work on my own laptop with multiple clients. I might need to quit or stop working with 2 weeks' notice if a better project comes along.",
    concerns: ['IP ownership of pre-existing code', 'Non-compete restricting other clients', 'Payment terms over 30 days'],
  },
  {
    id: 'tenant-1',
    name: 'Tenant Jordan',
    role: 'Residential Rent Tenant',
    description: "I plan to live in this apartment for 1 year, but my company might relocate me in 6 months. I have a cat and use remote Wi-Fi.",
    concerns: ['Early lease termination penalty', 'Security deposit return rules', 'Auto-renewal notice deadlines'],
  },
  {
    id: 'founder-1',
    name: 'Startup Founder Sam',
    role: 'Early Stage Founder signing NDA / Vendor Deal',
    description: "I am sharing preliminary pitch decks and prototypes with potential partners. I cannot be locked into long confidentiality obligations.",
    concerns: ['Duration of NDA', 'Liquidation / breach damages', 'Non-solicitation of team members'],
  },
];

export const SAMPLE_CONTRACTS: SampleContract[] = [
  {
    id: 'freelance-dev-agreement',
    title: 'Freelance Master Services Agreement (Software & Consulting)',
    category: 'Employment & Consulting',
    filename: 'freelance_agreement.txt',
    content: `MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into as of October 1, 2026, by and between Apex Global Technologies Inc. ("Client") and Contractor ("Consultant").

SECTION 1. SCOPE OF SERVICES & INDEPENDENT CONTRACTOR STATUS
1.1 Consultant shall perform software development services as specified in Statements of Work (SOW).
1.2 Consultant is an independent contractor. Client shall not provide health insurance, equipment, or retirement benefits.

SECTION 2. INTELLECTUAL PROPERTY & WORK FOR HIRE
2.1 All inventions, source code, designs, and work product ("Work Product") created by Consultant under this Agreement shall belong exclusively to Client as a "work made for hire".
2.2 Consultant hereby irrevocably assigns to Client all right, title, and interest in and to any pre-existing code, tools, libraries, or scripts integrated into the Work Product.

SECTION 3. PAYMENT & INVOICING TERMS
3.1 Client shall pay Consultant within Net 60 days following receipt of an approved invoice.
3.2 Client reserves the right to withhold payment if deliverables are deemed unsatisfactory in Client's sole discretion.

SECTION 4. NON-COMPETE & NON-SOLICITATION
4.1 During the term of this Agreement and for a period of twelve (12) months following termination, Consultant shall not render services, directly or indirectly, to any business entity competing with Client's core SaaS product line.
4.2 Consultant shall not solicit Client's employees, contractors, or customers for eighteen (18) months post-termination.

SECTION 5. TERMINATION & NOTICE PERIOD
5.1 Either party may terminate this Agreement without cause upon providing sixty (60) calendar days' written notice.
5.2 Client may terminate immediately for cause, including failure to meet project milestones.

SECTION 6. GOVERNING LAW & DISPUTE RESOLUTION
6.1 This Agreement is governed by the laws of New York State. All disputes shall be settled via binding arbitration in New York City, with the losing party bearing all legal fees.`,
    defaultPersona: SAMPLE_PERSONAS[0],
    preparsedResult: {
      documentTitle: 'Freelance Master Services Agreement',
      documentType: 'Consulting Contract',
      summary: 'Standard consulting agreement with aggressive IP assignment, Net 60 payment terms, 12-month non-compete, and 60-day termination notice requirement.',
      escalationTriggered: false,
      clauses: [
        {
          id: 'c-2.2',
          sectionNumber: 'Section 2.2',
          title: 'Pre-existing Code & IP Assignment',
          originalText: 'Consultant hereby irrevocably assigns to Client all right, title, and interest in and to any pre-existing code, tools, libraries, or scripts integrated into the Work Product.',
          plainLanguage: 'You give up ownership of all your personal tools, scripts, and pre-existing code if you use them in this project.',
          category: 'Intellectual Property',
          riskLevel: 'CRITICAL',
          riskReasoning: 'You lose rights to your own reusable developer scripts or starter templates used in the project.',
          personaImpact: 'High risk for freelancers who rely on reusable software modules across clients.',
        },
        {
          id: 'c-3.1',
          sectionNumber: 'Section 3.1 & 3.2',
          title: 'Net 60 Payment & Subjective Withholding',
          originalText: 'Client shall pay Consultant within Net 60 days... Client reserves the right to withhold payment if deliverables are deemed unsatisfactory in Client\'s sole discretion.',
          plainLanguage: 'You won\'t get paid for 2 months after invoicing, and the client can hold back money if they subjectively dislike the work.',
          category: 'Payment',
          riskLevel: 'HIGH',
          riskReasoning: 'Delayed cash flow and risk of unpaid work based on subjective approval.',
          personaImpact: 'As a freelancer, 60 days wait time creates cash flow vulnerability.',
        },
        {
          id: 'c-4.1',
          sectionNumber: 'Section 4.1',
          title: '12-Month Non-Compete Clause',
          originalText: 'Consultant shall not render services, directly or indirectly, to any business entity competing with Client\'s core SaaS product line for 12 months.',
          plainLanguage: 'You cannot work for or consult with any company in the client\'s industry for a full year after leaving.',
          category: 'Confidentiality',
          riskLevel: 'HIGH',
          riskReasoning: 'Restricts your ability to take new freelance projects in your domain of expertise.',
          personaImpact: 'Limits future client opportunities in your main tech niche.',
        },
        {
          id: 'c-5.1',
          sectionNumber: 'Section 5.1',
          title: '60-Day Termination Notice',
          originalText: 'Either party may terminate this Agreement without cause upon providing sixty (60) calendar days\' written notice.',
          plainLanguage: 'If you want to leave, you are legally bound to continue working for 60 days after giving notice.',
          category: 'Termination',
          riskLevel: 'MEDIUM',
          riskReasoning: 'Long commitment window if you find a better project or need to exit quickly.',
          personaImpact: 'You stated you might need to leave in 2 weeks; 60 days notice directly conflicts with your plan.',
        },
      ],
      obligationDates: [
        {
          id: 'ob-1',
          title: 'Invoice Submission Window',
          description: 'Submit invoice on the 1st of the month. Payment due Net 60 days.',
          dateOrWindow: 'Net 60 Days from Invoice Date',
          clauseId: 'c-3.1',
          clauseCitation: 'Section 3.1',
          category: 'Payment Due',
          isRecurring: true,
        },
        {
          id: 'ob-2',
          title: 'Termination Notice Deadline',
          description: 'Must deliver formal written notice 60 days before contract exit date.',
          dateOrWindow: '60 Days Prior to Desired Exit Date',
          clauseId: 'c-5.1',
          clauseCitation: 'Section 5.1',
          category: 'Termination Deadline',
          isRecurring: false,
        },
      ],
      lawyerBrief: {
        documentTitle: 'Freelance Master Services Agreement',
        documentType: 'Consulting Contract',
        summary: 'Agreement places significant restrictions on developer pre-existing IP and imposes 60-day payment delays.',
        userPersona: 'Freelance Software Developer & Consultant',
        topRisks: [
          {
            clauseTitle: 'Pre-existing Code Assignment',
            citation: 'Section 2.2',
            risk: 'Transfers developer pre-existing tools and open source helpers to client.',
          },
          {
            clauseTitle: 'Net 60 Payment & Approval Withholding',
            citation: 'Section 3.1-3.2',
            risk: '60-day delay plus subjective discretion to withhold funds.',
          },
          {
            clauseTitle: '12-Month Non-Compete Restriction',
            citation: 'Section 4.1',
            risk: 'Restricts working with competing SaaS clients for 1 year.',
          },
        ],
        keyObligations: [
          { title: 'Invoicing & Net 60 Payment', dateOrWindow: 'Net 60 Days' },
          { title: 'Written Termination Notice', dateOrWindow: '60 Days Notice' },
        ],
        questionsForLawyer: [
          'Can we amend Section 2.2 to explicitly carve out developer\'s pre-existing tools and open-source packages?',
          'How can we lower the payment window from Net 60 to Net 15 or Net 30?',
          'Is the 12-month non-compete clause enforceable in my state for independent contractors?',
        ],
        escalationWarnings: [],
        generatedAt: '2026-09-22',
      },
    },
  },
  {
    id: 'residential-lease-agreement',
    title: 'Residential Lease Agreement (Apartment Rental)',
    category: 'Real Estate & Housing',
    filename: 'lease_agreement.txt',
    content: `RESIDENTIAL LEASE AGREEMENT

This Agreement made this 1st day of November 2026, by and between Metro Heights Realty LLC ("Landlord") and Tenant ("Tenant").

1. PREMISES AND TERM
Landlord leases to Tenant Apartment 4B located at 742 Evergreen Terrace for a term of 12 months, starting Nov 1, 2026 and ending Oct 31, 2027.

2. RENT AND LATE CHARGES
2.1 Monthly rent is $2,200, payable on or before the 1st of each month.
2.2 If rent is not received by the 5th of the month, a late penalty of $150 plus $20 per day thereafter shall be assessed.

3. AUTOMATIC RENEWAL & NOTICE TO VACATE
3.1 This Lease shall automatically renew for an additional 12-month period unless Tenant provides written notice of intent to vacate at least sixty (60) days prior to the expiration date.
3.2 Failure to give timely notice results in automatic renewal at a 15% increased rent rate.

4. EARLY TERMINATION & SECURITY DEPOSIT
4.1 If Tenant vacates prior to the expiration of the 12-month term, Tenant shall forfeit the full security deposit ($2,200) and remain liable for rent until a replacement tenant is secured.
4.2 Tenant shall pay an Early Release Fee of two (2) months' rent ($4,400).

5. MAINTENANCE AND PET POLICY
5.1 Tenant is responsible for all repairs under $200.
5.2 Pets are strictly prohibited unless prior written consent and a non-refundable $500 pet fee is paid.`,
    defaultPersona: SAMPLE_PERSONAS[1],
    preparsedResult: {
      documentTitle: 'Residential Lease Agreement',
      documentType: 'Apartment Lease',
      summary: '12-month residential lease with auto-renewal, 60-day notice window, early exit penalties totaling deposit plus 2 months rent, and strict pet restrictions.',
      escalationTriggered: false,
      clauses: [
        {
          id: 'c-3.1',
          sectionNumber: 'Section 3.1 & 3.2',
          title: 'Auto-Renewal & 60-Day Notice Trap',
          originalText: 'This Lease shall automatically renew... unless Tenant provides written notice... at least sixty (60) days prior. Failure results in automatic renewal at 15% increased rent.',
          plainLanguage: 'If you forget to send a notice 60 days before the lease ends, you automatically get locked into another full year at 15% higher rent.',
          category: 'Renewal',
          riskLevel: 'HIGH',
          riskReasoning: 'Missed deadline results in financial lock-in and rent hike.',
          personaImpact: 'Requires marking calendar alert early to prevent unexpected 12-month renewal.',
        },
        {
          id: 'c-4.1',
          sectionNumber: 'Section 4.1 & 4.2',
          title: 'Early Termination Penalty ($6,600 Total Impact)',
          originalText: 'Tenant shall forfeit security deposit ($2,200)... and pay Early Release Fee of 2 months rent ($4,400).',
          plainLanguage: 'Leaving early costs you your entire $2,200 deposit PLUS an extra $4,400 fee.',
          category: 'Termination',
          riskLevel: 'CRITICAL',
          riskReasoning: 'Heavy financial penalty ($6,600 total) if relocating early.',
          personaImpact: 'Directly impacts your stated scenario of possible 6-month job relocation.',
        },
      ],
      obligationDates: [
        {
          id: 'ob-rent-due',
          title: 'Monthly Rent Due Date',
          description: 'Rent is due on 1st of every month. Late fees kick in after the 5th.',
          dateOrWindow: '1st of every month (Grace period ends 5th)',
          clauseId: 'c-2.1',
          clauseCitation: 'Section 2.1',
          category: 'Payment Due',
          isRecurring: true,
        },
        {
          id: 'ob-vacate-notice',
          title: 'Mandatory Non-Renewal Notice Deadline',
          description: 'Written notice must reach landlord by Aug 31, 2027 (60 days prior to Oct 31 end).',
          dateOrWindow: 'August 31, 2027',
          isoDate: '2027-08-31',
          clauseId: 'c-3.1',
          clauseCitation: 'Section 3.1',
          category: 'Notice Window',
          isRecurring: false,
        },
      ],
      lawyerBrief: {
        documentTitle: 'Residential Lease Agreement',
        documentType: 'Apartment Lease',
        summary: 'Lease features strict early termination penalties and automatic 12-month renewal clause.',
        userPersona: 'Residential Rent Tenant',
        topRisks: [
          {
            clauseTitle: 'Early Termination Penalty',
            citation: 'Section 4.1-4.2',
            risk: 'Deposit forfeiture + 2 months rent early release fee ($6,600 total).',
          },
          {
            clauseTitle: 'Automatic 12-Month Renewal Trap',
            citation: 'Section 3.1',
            risk: 'Auto-renews at 15% rent increase if 60-day notice is missed.',
          },
        ],
        keyObligations: [
          { title: 'Monthly Rent Payment', dateOrWindow: '1st of every month' },
          { title: 'Non-Renewal Notice', dateOrWindow: 'August 31, 2027' },
        ],
        questionsForLawyer: [
          'Can we request a job-relocation early exit clause with 30 days notice?',
          'Is the 2-month early release fee enforceable under local tenant protection laws?',
        ],
        escalationWarnings: [],
        generatedAt: '2026-09-22',
      },
    },
  },
];

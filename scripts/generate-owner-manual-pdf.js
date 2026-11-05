const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

function generateOwnerManualPDF(outputPath, artifactPath) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Color Palette
  const TERRACOTTA = [185, 121, 104]; // #B97968
  const ESPRESSO = [69, 60, 53];     // #453C35
  const SAGE = [163, 170, 140];       // #A3AA8C
  const WARM_IVORY = [248, 244, 236]; // #F8F4EC
  const TEXT_DARK = [35, 30, 26];
  const TEXT_MUTED = [110, 105, 100];
  const BORDER_COLOR = [225, 218, 205];

  function drawHeader(pageNum, totalPages) {
    if (pageNum === 1) return; // Skip cover

    doc.setFillColor(...WARM_IVORY);
    doc.rect(0, 0, pageWidth, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...TERRACOTTA);
    doc.text('VEDANYA CRAFT GHAR', margin, 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Owner & Everyday Operating Manual', margin + 45, 9);

    doc.setDrawColor(...BORDER_COLOR);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);

    // Footer
    doc.setDrawColor(...BORDER_COLOR);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Confidential - For Store Owner & Artisan Teacher Use Only', margin, pageHeight - 7);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 7);
  }

  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  doc.setFillColor(...WARM_IVORY);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative border
  doc.setDrawColor(...TERRACOTTA);
  doc.setLineWidth(1.2);
  doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - (margin * 2) + 8);

  doc.setDrawColor(...SAGE);
  doc.setLineWidth(0.5);
  doc.rect(margin - 2, margin - 2, contentWidth + 4, pageHeight - (margin * 2) + 4);

  // Title Box
  doc.setFillColor(...ESPRESSO);
  doc.rect(margin + 5, 45, contentWidth - 10, 52, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text('VEDANYA CRAFT GHAR', pageWidth / 2, 65, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(...WARM_IVORY);
  doc.text('Handcrafted with Love - Boutique Operating Platform', pageWidth / 2, 75, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...SAGE);
  doc.text('Artisan E-Commerce Storefront & Owner Management Console', pageWidth / 2, 86, { align: 'center' });

  // Document Title
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...ESPRESSO);
  doc.text('COMPLETE OWNER & EVERYDAY', pageWidth / 2, 125, { align: 'center' });
  doc.text('OPERATING MANUAL', pageWidth / 2, 135, { align: 'center' });

  doc.setDrawColor(...TERRACOTTA);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 35, 142, pageWidth / 2 + 35, 142);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('A Non-Technical, Step-by-Step Guide for the Independent Artisan Teacher', pageWidth / 2, 152, { align: 'center' });

  // Quick Highlights Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(margin + 10, 175, contentWidth - 20, 65, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...TERRACOTTA);
  doc.text('What This Manual Empowers You To Do:', margin + 18, 187);

  const highlights = [
    '100% Independent Store Control (No programmer required for daily operations)',
    'Manage Orders with Stock-Safe Locking & UPI/QR Payment Processing',
    'Log Sales from Instagram DMs, WhatsApp chats, and Pop-up Craft Exhibitions',
    '1-Click Vacation & Operating Modes to pause orders during exams or trips',
    'Add New Handmade Items with Instant Live Storefront Previews',
    'Quote Custom Craft Enquiries and Convert them to Confirmed Orders',
    'Maintain Customer Directory with Safe Spreadsheet CSV Exports'
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_DARK);
  let hy = 196;
  for (const h of highlights) {
    doc.setFillColor(...TERRACOTTA);
    doc.circle(margin + 20, hy - 1, 1, 'F');
    doc.text(h, margin + 24, hy);
    hy += 6;
  }

  // Cover Footer
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Edition: Production Release 2026', margin + 10, pageHeight - 24);
  doc.text('Built exclusively for Vedanya Craft Ghar', pageWidth - margin - 10, pageHeight - 24, { align: 'right' });


  // ==========================================
  // PAGE 2: TABLE OF CONTENTS & QUICK ACCESS
  // ==========================================
  doc.addPage();

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...ESPRESSO);
  doc.text('1. Quick Access & Credentials Card', margin, 26);

  doc.setDrawColor(...TERRACOTTA);
  doc.setLineWidth(0.8);
  doc.line(margin, 29, margin + 85, 29);

  doc.autoTable({
    startY: 34,
    theme: 'grid',
    head: [['Portal / Resource', 'Address / Details', 'Default Credentials']],
    headStyles: { fillColor: ESPRESSO, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    body: [
      ['Customer Storefront', 'https://your-domain.vercel.app\n(Public boutique for all buyers)', 'Open to all public visitors'],
      ['Owner Management Console', 'https://your-domain.vercel.app/admin\n(Private workspace for owner)', 'Email: artisan@vedanyacraft.in\n(or hemachndaard@gmail.com)\nPassword: VedanyaOwner2026!'],
      ['Quick 1-Click Access', 'On the admin login screen', 'Click "Enter Owner Console as\nAuthenticated Store Owner"'],
      ['Local Offline Server', 'http://localhost:3000\n(When testing locally on laptop)', 'Terminal command:\nnpm run start (or npm run dev)'],
      ['Database & Cloud Backend', 'https://supabase.com/dashboard\n(Project: ykbaksjevsscpcahiswm)', 'Managed 24/7 cloud database;\nRuns even when laptop is OFF'],
    ],
    styles: { fontSize: 8.5, cellPadding: 3.5, textColor: TEXT_DARK },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 75 },
      2: { cellWidth: 54 },
    },
    margin: { left: margin, right: margin },
  });

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...ESPRESSO);
  doc.text('2. Table of Contents', margin, doc.lastAutoTable.finalY + 14);

  doc.setDrawColor(...TERRACOTTA);
  doc.setLineWidth(0.8);
  doc.line(margin, doc.lastAutoTable.finalY + 17, margin + 55, doc.lastAutoTable.finalY + 17);

  const toc = [
    ['Chapter 1', 'Your Everyday Workflow: The Two-Stage Order Pipeline', 'Page 3'],
    ['Chapter 2', 'Logging Sales from Instagram DMs, WhatsApp & Exhibitions', 'Page 4'],
    ['Chapter 3', 'Product Management: Adding Crafts & Photo Previews', 'Page 5'],
    ['Chapter 4', 'Inventory Matrix: Stock Counts & Audit Trails', 'Page 6'],
    ['Chapter 5', 'Custom Enquiries & One-Click WhatsApp Quotes', 'Page 7'],
    ['Chapter 6', 'Taking a Break? 1-Click Operating Modes (Vacation/Pause)', 'Page 8'],
    ['Chapter 7', 'Customer Directory & Festive Outreach CSV Export', 'Page 9'],
    ['Chapter 8', 'Frequently Asked Questions & Owner Troubleshooting', 'Page 10'],
  ];

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 22,
    theme: 'plain',
    body: toc,
    styles: { fontSize: 9.5, cellPadding: 2.8, textColor: TEXT_DARK },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: TERRACOTTA, cellWidth: 30 },
      1: { fontStyle: 'bold', cellWidth: 120 },
      2: { textColor: TEXT_MUTED, halign: 'right', cellWidth: 24 },
    },
    margin: { left: margin, right: margin },
  });


  // ==========================================
  // PAGE 3: TWO-STAGE ORDER PIPELINE
  // ==========================================
  doc.addPage();

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...ESPRESSO);
  doc.text('Chapter 1: The Two-Stage Order Pipeline', margin, 26);

  doc.setDrawColor(...TERRACOTTA);
  doc.setLineWidth(0.8);
  doc.line(margin, 29, margin + 95, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_DARK);
  const p1 = 'Vedanya Craft Ghar uses a handcrafted artisan order model rather than an instant impersonal gateway. This protects you from overselling, handles custom modifications, and avoids payment gateway transaction cuts.';
  doc.text(doc.splitTextToSize(p1, contentWidth), margin, 36);

  doc.autoTable({
    startY: 47,
    theme: 'striped',
    head: [['Stage', 'Who Does It', 'What Happens', 'Action / Result']],
    headStyles: { fillColor: TERRACOTTA, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    body: [
      [
        'Stage 1:\nOrder Request',
        'Customer\non Storefront',
        'Customer adds crochet/scrunchies, fills delivery address, and submits order request.',
        '• Instant Provisional PDF generated\n• WhatsApp deep link opens with pre-filled message\n• Stock NOT charged or deducted yet'
      ],
      [
        'Stage 2:\nOwner Review\n& Stock Lock',
        'Artisan Teacher\nin /admin/orders',
        'You review the order. You can apply a festival discount or adjust delivery fee if remote.',
        '• Click "Approve & Lock Stock"\n• System locks stock using atomic row locking\n• Item cannot be sold to anyone else'
      ],
      [
        'Stage 3:\nPayment via\nUPI / QR Code',
        'Customer &\nArtisan Teacher',
        'You share your Google Pay, PhonePe, or Paytm QR code with the customer on WhatsApp.',
        '• Customer transfers money\n• You click "Mark as Paid" in /admin/orders\n• Revenue is added to your verified dashboard'
      ],
      [
        'Stage 4:\nHandcrafting\n& Packing',
        'Artisan Teacher\nat Studio',
        'You handcraft, pack with tissue & care card, and prepare the parcel for courier dispatch.',
        '• Click "Advance Status" to PREPARING or READY_TO_SHIP\n• Customer can see progress on /track-order'
      ],
      [
        'Stage 5:\nDispatch &\nTracking',
        'Artisan Teacher\nvia Courier',
        'Hand package to India Post, DTDC, or Delhivery. Copy the tracking number.',
        '• Click "Mark as Shipped"\n• Paste tracking number (e.g. IN123456789)\n• Permanent inventory deduction occurs'
      ]
    ],
    styles: { fontSize: 8, cellPadding: 3.5, textColor: TEXT_DARK },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 32 },
      1: { cellWidth: 30 },
      2: { cellWidth: 54 },
      3: { cellWidth: 58 },
    },
    margin: { left: margin, right: margin },
  });

  // Callout Box
  const calloutY = doc.lastAutoTable.finalY + 8;
  doc.setFillColor(...WARM_IVORY);
  doc.setDrawColor(...TERRACOTTA);
  doc.roundedRect(margin, calloutY, contentWidth, 30, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...TERRACOTTA);
  doc.text('Important Rule: Why Revenue Counts Only After Payment', margin + 6, calloutY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_DARK);
  const revNote = 'Your owner analytics dashboard calculates revenue strictly from orders marked PAID or DELIVERED. Unconfirmed pending requests will never falsely inflate your sales numbers. If a customer changes their mind before paying, clicking "Reject/Cancel" instantly unlocks the inventory back to the storefront.';
  doc.text(doc.splitTextToSize(revNote, contentWidth - 12), margin + 6, calloutY + 15);


  // ==========================================
  // PAGE 4: LOGGING MANUAL SALES (INSTAGRAM / POP-UPS)
  // ==========================================
  doc.addPage();

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...ESPRESSO);
  doc.text('Chapter 2: Logging Instagram & Exhibition Sales', margin, 26);

  doc.setDrawColor(...TERRACOTTA);
  doc.setLineWidth(0.8);
  doc.line(margin, 29, margin + 115, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_DARK);
  const p2 = 'Many artisan sales happen through Instagram direct messages, WhatsApp conversations, or in-person pop-up stalls and exhibitions. The "Log Manual Sale" tool ensures all your sales, customer records, and inventory remain 100% synchronized.';
  doc.text(doc.splitTextToSize(p2, contentWidth), margin, 36);

  doc.autoTable({
    startY: 48,
    theme: 'grid',
    head: [['Step', 'Field / Control', 'Instructions for Teacher']],
    headStyles: { fillColor: ESPRESSO, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    body: [
      ['Step 1', 'Open Form', 'In the top navigation of the Owner Console, click Orders, then click the "Log Manual Sale" button (or visit /admin/orders/new).'],
      ['Step 2', 'Choose Channel', 'Click whether the order originated from Instagram DM, WhatsApp Chat, or Exhibition / In-Person.'],
      ['Step 3', 'Customer Contact', 'Type the customer\'s name, 10-digit Indian phone number, and shipping address. If local pickup, you can type "Local pickup".'],
      ['Step 4', 'Select Products', 'Pick an existing item from your catalog (it auto-fills the price) OR type any custom craft description (e.g. "Custom Crochet Bag"). Select variant if applicable, enter quantity, and click "Add".'],
      ['Step 5', 'Shipping & Delivery', 'Set delivery charge (defaults to ₹0 for in-person or custom courier fee). Subtotal and total calculate automatically.'],
      ['Step 6', 'Internal Notes', 'Type any private notes (e.g., "Paid ₹500 via GPay advance, promised delivery by Sunday").'],
      ['Step 7', 'Save & Confirm', 'Click "Save & Confirm Manual Order". The order is confirmed, stock is deducted, and the buyer is cataloged!']
    ],
    styles: { fontSize: 8.5, cellPadding: 3, textColor: TEXT_DARK },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 22, textColor: TERRACOTTA },
      1: { fontStyle: 'bold', cellWidth: 42 },
      2: { cellWidth: 110 },
    },
    margin: { left: margin, right: margin },
  });


  // ==========================================
  // PAGE 5: PRODUCT MANAGEMENT & PHOTO PREVIEWS
  // ==========================================
  doc.addPage();

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...ESPRESSO);
  doc.text('Chapter 3: Product Management & Previews', margin, 26);

  doc.setDrawColor(...TERRACOTTA);
  doc.setLineWidth(0.8);
  doc.line(margin, 29, margin + 105, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_DARK);
  const p3 = 'You can add, edit, or archive products anytime. On the right side of the screen, a Live Storefront Preview card updates in real time as you type, showing you exactly how your product will look on customers\' phones.';
  doc.text(doc.splitTextToSize(p3, contentWidth), margin, 36);

  doc.autoTable({
    startY: 48,
    theme: 'striped',
    head: [['Field Name', 'What to Put', 'Helpful Artisan Advice']],
    headStyles: { fillColor: TERRACOTTA, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    body: [
      ['Product Title', 'e.g. "Pastel Daisy Crochet Scrunchie"', 'Use descriptive, charming names buyers love searching for.'],
      ['Category', 'Select Scrunchies, Crochet, etc.', 'Items appear under the selected category tabs in your shop.'],
      ['Base Price (₹)', 'Selling price in Indian Rupees', 'e.g. ₹249. No hidden taxes or false GST claims.'],
      ['Original Price', 'Optional strike-through price', 'e.g. ₹349. Shows a discount tag on the storefront.'],
      ['Availability Mode', 'READY_TO_SHIP or MADE_TO_ORDER', 'READY_TO_SHIP: in physical stock. MADE_TO_ORDER: crafted upon order.'],
      ['Preparation Days', 'Number of days needed (e.g. 2 to 4)', 'Informs buyer: "Handcrafted & dispatched in 3 days".'],
      ['Stock Count', 'How many you have ready (e.g. 5)', 'System warns you when stock drops below threshold.'],
      ['Variants', 'Colors or Sizes (e.g. "Color: Lavender")', 'Each variant can have its own price adjustment (e.g. +₹50).'],
      ['Photo URLs', 'Paste image web link', 'Supports high-res craft photos. First photo becomes cover.']
    ],
    styles: { fontSize: 8, cellPadding: 3, textColor: TEXT_DARK },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35 },
      1: { cellWidth: 60 },
      2: { cellWidth: 79 },
    },
    margin: { left: margin, right: margin },
  });

  // Purge Demo Data Note
  const purgeY = doc.lastAutoTable.finalY + 8;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(margin, purgeY, contentWidth, 26, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(185, 28, 28);
  doc.text('1-Click Purge Demo Data Button', margin + 6, purgeY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_DARK);
  const purgeTxt = 'Your website came pre-loaded with sample demo crochet items so you could see how the shop looks. When you are ready to launch your real creations, go to Products (/admin/products) and click the red "Purge Demo Data" button. All sample data is wiped permanently with one click!';
  doc.text(doc.splitTextToSize(purgeTxt, contentWidth - 12), margin + 6, purgeY + 14);


  // ==========================================
  // PAGE 6: INVENTORY MATRIX
  // ==========================================
  doc.addPage();

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...ESPRESSO);
  doc.text('Chapter 4: Inventory Matrix & Stock Tracking', margin, 26);

  doc.setDrawColor(...TERRACOTTA);
  doc.setLineWidth(0.8);
  doc.line(margin, 29, margin + 110, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_DARK);
  const p4 = 'The Inventory Matrix (/admin/inventory) gives you a single dashboard view of all your physical stock, active orders, and safety thresholds.';
  doc.text(doc.splitTextToSize(p4, contentWidth), margin, 36);

  doc.autoTable({
    startY: 46,
    theme: 'grid',
    head: [['Column / Metric', 'Meaning', 'Why It Matters to You']],
    headStyles: { fillColor: ESPRESSO, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    body: [
      ['Total Physical Stock', 'The actual count of physical items in your studio drawers.', 'The true physical count you own.'],
      ['Locked / Reserved', 'Units claimed by buyers whose orders you approved, awaiting courier dispatch.', 'Prevents double-selling! If you have 5 scrunchies and 2 are locked, only 3 are available.'],
      ['Available to Sell', 'Total Physical minus Locked.', 'This is the exact quantity displayed to storefront shoppers.'],
      ['Health Status', 'In Stock, Low Stock, or Out of Stock.', 'Amber badges warn you when you have 3 or fewer pieces left so you can make more yarn pieces.'],
      ['Quick Adjust Button', 'Allows instant count updates with a reason.', 'Click "Adjust", type the new count, and enter a reason (e.g. "Crocheted 4 more pieces"). Recorded in audit log!']
    ],
    styles: { fontSize: 8.5, cellPadding: 3.5, textColor: TEXT_DARK },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42, textColor: TERRACOTTA },
      1: { cellWidth: 65 },
      2: { cellWidth: 67 },
    },
    margin: { left: margin, right: margin },
  });


  // ==========================================
  // PAGE 7: CUSTOM ENQUIRIES & WHATSAPP QUOTES
  // ==========================================
  doc.addPage();

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...ESPRESSO);
  doc.text('Chapter 5: Custom Craft Enquiries & Quotes', margin, 26);

  doc.setDrawColor(...TERRACOTTA);
  doc.setLineWidth(0.8);
  doc.line(margin, 29, margin + 110, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_DARK);
  const p5 = 'Customers love bespoke colors, baby shower gifts, and personalized crochet creations. The storefront includes a dedicated Custom Order Request page (/custom-order). All customer submissions land in your Custom Enquiries Command (/admin/custom).';
  doc.text(doc.splitTextToSize(p5, contentWidth), margin, 36);

  doc.autoTable({
    startY: 50,
    theme: 'striped',
    head: [['Action / Feature', 'How It Works', 'Artisan Benefit']],
    headStyles: { fillColor: TERRACOTTA, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    body: [
      [
        'Sequence Request Number',
        'Every custom enquiry receives a clean ID like VCG-REQ-2026-0001.',
        'Professional reference you can quote in chats.'
      ],
      [
        'Reference Photos',
        'Customers can attach reference pictures or describe preferred color palettes.',
        'You see exactly what they envision before replying.'
      ],
      [
        '1-Click WhatsApp Quote',
        'Click the green "Send Quote on WhatsApp" button. It opens a chat with the customer containing a polite, pre-formatted message with their enquiry number and your estimate.',
        'Zero manual copy-pasting required.'
      ],
      [
        'Convert to Confirmed Order',
        'Once the customer approves the quote, click "Convert to Confirmed Order". It automatically creates an official order, locks materials, and generates an order summary!',
        'No duplicate data entry.'
      ]
    ],
    styles: { fontSize: 8.5, cellPadding: 4, textColor: TEXT_DARK },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 70 },
      2: { cellWidth: 59 },
    },
    margin: { left: margin, right: margin },
  });


  // ==========================================
  // PAGE 8: 1-CLICK OPERATING MODES (VACATIONS/PAUSE)
  // ==========================================
  doc.addPage();

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...ESPRESSO);
  doc.text('Chapter 6: 1-Click Operating Modes', margin, 26);

  doc.setDrawColor(...TERRACOTTA);
  doc.setLineWidth(0.8);
  doc.line(margin, 29, margin + 85, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_DARK);
  const p6 = 'As an artisan teacher, school exams, workshops, or family vacations require pausing your orders. In your Settings (/admin/settings), you can switch the entire boutique status with a single click!';
  doc.text(doc.splitTextToSize(p6, contentWidth), margin, 36);

  doc.autoTable({
    startY: 48,
    theme: 'grid',
    head: [['Operating Mode', 'Storefront Behavior', 'When to Use']],
    headStyles: { fillColor: ESPRESSO, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    body: [
      [
        'OPEN\n(Normal)',
        'Cart, checkout, and custom orders are fully active. No warning banners.',
        'Everyday normal operations.'
      ],
      [
        'TEMPORARILY CLOSED\n(Pause Orders)',
        'Displays an announcement banner. Customers can still browse all your creations, but checkout is politely paused.',
        'When you have reached your weekly crafting limit or during busy school exam grading weeks.'
      ],
      [
        'VACATION\n(Away on Holiday)',
        'Displays a vacation banner with your return date (e.g. "We are on vacation until Nov 20!"). Checkout paused.',
        'During family holidays or traveling.'
      ],
      [
        'CUSTOM ORDERS ONLY\n(Bespoke Only)',
        'Hides ready-stock checkout buttons and invites visitors to submit bespoke custom craft enquiries.',
        'When you have sold out of ready inventory and want to craft only pre-booked commissions.'
      ],
      [
        'MAINTENANCE\n(Under Update)',
        'Displays a tasteful maintenance notice across the storefront.',
        'While reorganizing craft collections or updating prices.'
      ]
    ],
    styles: { fontSize: 8.5, cellPadding: 3.5, textColor: TEXT_DARK },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 44, textColor: TERRACOTTA },
      1: { cellWidth: 70 },
      2: { cellWidth: 60 },
    },
    margin: { left: margin, right: margin },
  });


  // ==========================================
  // PAGE 9: CUSTOMER DIRECTORY & CSV EXPORTS
  // ==========================================
  doc.addPage();

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...ESPRESSO);
  doc.text('Chapter 7: Customer Directory & Festive Outreach', margin, 26);

  doc.setDrawColor(...TERRACOTTA);
  doc.setLineWidth(0.8);
  doc.line(margin, 29, margin + 115, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_DARK);
  const p7 = 'Every customer who places an order is automatically cataloged in your Customer Directory (/admin/customers). You can view repeat buyers, total lifetime spend, and export clean contact lists for festive greetings.';
  doc.text(doc.splitTextToSize(p7, contentWidth), margin, 36);

  doc.autoTable({
    startY: 48,
    theme: 'striped',
    head: [['Capability', 'Details & Safe Design']],
    headStyles: { fillColor: TERRACOTTA, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    body: [
      [
        'Repeat Buyer Ranking',
        'Customers are automatically sorted by Lifetime Spend (calculated strictly from paid/delivered orders). Your top supporters appear right at the top!'
      ],
      [
        'Direct WhatsApp Chat Link',
        'Click the green WhatsApp button next to any customer. It opens a chat directly with their phone number to send greetings or exclusive previews.'
      ],
      [
        'Formula-Injection Protected CSV Export',
        'Click "Export CSV". It downloads a clean Excel/Google Sheets compatible spreadsheet. All fields are sanitized to protect against spreadsheet formula injection attacks.'
      ],
      [
        'Diwali & Festive Campaigns',
        'Use the exported spreadsheet to send personalized holiday discount codes or launch announcements to your past buyers.'
      ]
    ],
    styles: { fontSize: 9, cellPadding: 4.5, textColor: TEXT_DARK },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 119 },
    },
    margin: { left: margin, right: margin },
  });


  // ==========================================
  // PAGE 10: OWNER FAQ & TROUBLESHOOTING
  // ==========================================
  doc.addPage();

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...ESPRESSO);
  doc.text('Chapter 8: Frequently Asked Questions', margin, 26);

  doc.setDrawColor(...TERRACOTTA);
  doc.setLineWidth(0.8);
  doc.line(margin, 29, margin + 95, 29);

  const faqs = [
    [
      'Q: A customer placed an order but hasn\'t sent the UPI payment. What should I do?',
      'A: In /admin/orders, check their phone number and click the WhatsApp link to send a gentle reminder. If they do not respond after 24 hours, click "Reject/Cancel". The locked stock will be instantly restored to your storefront.'
    ],
    [
      'Q: Can I change delivery fees or offer free shipping above ₹999?',
      'A: Yes! Go to /admin/settings. Under "Shipping & Order Rules", update "Default Flat Delivery Charge" and "Free Delivery Above". Click Save. It updates instantly.'
    ],
    [
      'Q: Can I change my store phone number, Instagram handle, or about story?',
      'A: Yes! Everything in your boutique is editable in /admin/settings. Nothing is hardcoded.'
    ],
    [
      'Q: A customer wants to track their parcel. Where do they go?',
      'A: Direct them to your website\'s /track-order page. All they need to enter is their order number (e.g. VCG-2026-0001) and their 10-digit phone number. They will see the 6-stage milestone tracker.'
    ],
    [
      'Q: Do I need to keep my laptop open for the shop to work?',
      'A: No! Your storefront is hosted on Vercel and your database on Supabase. Both run 24/7 in the cloud even when your laptop is turned off.'
    ]
  ];

  doc.autoTable({
    startY: 34,
    theme: 'grid',
    body: faqs,
    styles: { fontSize: 8.5, cellPadding: 3.5, textColor: TEXT_DARK },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70, textColor: ESPRESSO },
      1: { cellWidth: 104 },
    },
    margin: { left: margin, right: margin },
  });

  // Final Sign-off
  const signY = doc.lastAutoTable.finalY + 12;
  doc.setFillColor(...WARM_IVORY);
  doc.setDrawColor(...TERRACOTTA);
  doc.roundedRect(margin, signY, contentWidth, 24, 3, 3, 'FD');

  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...TERRACOTTA);
  doc.text('🌸 Heartiest Wishes for Vedanya Craft Ghar!', pageWidth / 2, signY + 9, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_DARK);
  doc.text('Your dedication to handmade crafts brings beauty and warmth to every home.', pageWidth / 2, signY + 16, { align: 'center' });

  // Apply header & footer to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawHeader(i, totalPages);
  }

  // Save to disk
  const buffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, buffer);
  fs.writeFileSync(artifactPath, buffer);
  console.log(`Owner Manual PDF successfully written to ${outputPath} and ${artifactPath} (${totalPages} pages)`);
}

const outputPath = path.join(__dirname, '..', 'docs', 'Vedanya_Craft_Ghar_Owner_Manual.pdf');
const artifactPath = path.join(
  'C:',
  'Users',
  'Hemachandaar',
  '.gemini',
  'antigravity',
  'brain',
  'ea4ba1eb-0aa3-487a-89f2-a8481d972dc4',
  'Vedanya_Craft_Ghar_Owner_Manual.pdf'
);

generateOwnerManualPDF(outputPath, artifactPath);

import { isPlatformBrowser } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AfterViewInit, Component, inject, PLATFORM_ID } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { WhatsAppService } from "@/app/services/whatsapp.service";

interface TocItem {
  id: string;
  label: string;
}

@Component({
  selector: "app-policies",
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <section class="policies-hero">
      <div class="tm-container">
        <h1>Store Policies</h1>
        <p>
          The policies that govern shopping at MusoHive, in one place. Please
          read them carefully before placing an order.
        </p>
      </div>
    </section>

    <section class="tm-section policies-section">
      <div class="tm-container policies-layout">
        <!-- Table of contents -->
        <nav class="policies-toc" aria-label="Table of contents">
          <h2>On this page</h2>
          <ul>
            @for (item of toc; track item.id) {
              <li>
                <a [href]="'#' + item.id" (click)="scrollTo($event, item.id)">
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </nav>

        <!-- Policy content -->
        <div class="policies-content">
          <!-- 1. Terms & Conditions -->
          <details id="terms-and-conditions" class="policy-accordion">
            <summary>
              <span>1. Terms &amp; Conditions</span>
              <mat-icon>expand_more</mat-icon>
            </summary>

            <div class="policy-accordion-content">
              <p class="policy-updated">Last updated: 25 November 2026</p>
              <h3>1.1 Use of this website</h3>
              <p>
                By accessing or using the MusoHive website
                (https://www.musohive.co.za) you agree to be bound by these
                Terms &amp; Conditions. If you do not agree, please do not use
                the website. These terms are governed by the laws of the
                Republic of South Africa, including the Electronic
                Communications and Transactions Act 25 of 2002 (ECTA) and the
                Consumer Protection Act 68 of 2008 (CPA).
              </p>

              <h3>1.2 Ordering and purchasing</h3>
              <p>
                Orders placed through MusoHive are confirmed once successful
                payment has been received and verified through our Paystack
                payment gateway. Orders will only be processed after payment
                confirmation.
              </p>
              <p>
                By placing an order, you confirm that the information you
                provide, including your name, contact details and delivery
                address, is accurate and complete.
              </p>
              <p>
                You must be 18 years or older, or place orders with the consent
                of a parent or legal guardian, to purchase from MusoHive.
              </p>

              <h3>1.3 Pricing and payment</h3>
              <p>
                All prices are displayed in South African Rand (ZAR) and include
                VAT where applicable. Prices are subject to change without
                notice.
              </p>
              <p>
                MusoHive accepts the following payment methods through its
                Paystack payment gateway:
              </p>
              <ul>
                <li>Pay by Bank</li>
                <li>Ozow</li>
                <li>SnapScan</li>
                <li>Scan to Pay</li>
                <li>Debit and credit cards</li>
              </ul>
              <p>
                Payment must be completed successfully before an order is
                processed. Once payment has been confirmed, the order will
                proceed for processing and preparation for dispatch.
              </p>
              <p>
                MusoHive does not store customers' full debit or credit card
                details. Payment transactions are processed securely through the
                relevant payment providers.
              </p>

              <h3>1.4 Order cancellations and changes</h3>
              <p>
                Customers may request to cancel or change an order before it has
                been dispatched. Where an order is successfully cancelled before
                dispatch, a refund will be issued in accordance with our Returns
                &amp; Refunds Policy.
              </p>
              <p>
                Once an order has been handed over to the courier, cancellation
                may no longer be possible immediately. Customers should contact
                MusoHive as soon as possible so that we can determine whether
                the shipment can be intercepted or returned to us.
              </p>
              <p>
                If the order has already been dispatched, the customer may be
                required to arrange and cover the direct cost of returning the
                goods where permitted by applicable law. Any applicable
                statutory cancellation and return rights remain unaffected.
              </p>
              <p>
                For eligible online purchases, customers retain their
                cooling-off rights under Section 44 of the Electronic
                Communications and Transactions Act 25 of 2002 (ECTA).
              </p>

              <h3>1.5 Product descriptions, availability and pricing errors</h3>
              <p>
                We make every effort to ensure that product descriptions,
                images, specifications and prices are accurate at the time of
                publication. However, errors may occur. If a product is listed
                at an incorrect price or with incorrect information, MusoHive
                reserves the right to cancel or refuse the order and will notify
                you promptly. Where you have already paid, you will be offered
                the choice of a full refund or the option to confirm the order
                at the correct price.
              </p>
              <p>
                Product availability is indicated on each product page and is
                updated regularly, but we cannot guarantee stock at the time
                your order is processed. If an item is unavailable after you
                have ordered, we will notify you and offer a refund or, where
                possible, an equivalent alternative.
              </p>
            </div>
          </details>

          <!-- 2. Returns & Refunds -->
          <details id="returns-and-refunds" class="policy-accordion">
            <summary>
              <span>2. Returns &amp; Refunds Policy</span>
              <mat-icon>expand_more</mat-icon>
            </summary>

            <div class="policy-accordion-content">
              <p class="policy-updated">Last updated: 25 November 2026</p>

              <p>
                At MusoHive, customer satisfaction is important to us. We want
                you to shop with confidence, knowing that if something goes
                wrong or you change your mind, we will do our best to assist
                you. This policy is guided by the Consumer Protection Act 68 of
                2008 (CPA), the Electronic Communications and Transactions Act
                25 of 2002 (ECTA), and other applicable South African consumer
                protection laws.
              </p>

              <!-- 2.1 Return eligibility and conditions -->
              <h3>2.1 Return eligibility and conditions</h3>

              <p>
                If you change your mind about a purchase made online, you may
                exercise your cooling-off right within seven (7) days of
                receiving the goods, where applicable under Section 44 of the
                Electronic Communications and Transactions Act 25 of 2002
                (ECTA). You do not need to provide a reason for exercising this
                right.
              </p>

              <p>
                For other voluntary returns or exchanges outside the statutory
                cooling-off period, MusoHive may consider requests subject to
                the following conditions:
              </p>

              <ul>
                <li>
                  The product must be returned in its original condition, with
                  all accessories, manuals, packaging and any supplied free
                  items.
                </li>
                <li>
                  The product must not show signs of misuse, accidental damage
                  or unauthorised modification.
                </li>
                <li>
                  Proof of purchase, such as an order number or receipt, must be
                  provided.
                </li>
              </ul>

              <p>
                Certain products may be subject to hygiene or health-related
                return restrictions where permitted by applicable law. This may
                include products that cannot reasonably be returned for health
                protection or hygiene reasons once unsealed.
              </p>

              <p>
                Any applicable statutory rights relating to defective, damaged
                or incorrectly supplied products remain unaffected by these
                conditions. Hygiene restrictions will not be used to exclude
                consumer rights provided by law.
              </p>

              <!-- 2.2 Refund procedures and timelines -->
              <h3>2.2 Refund procedures and timelines</h3>

              <p>
                Once we receive the returned product, we will inspect it and
                communicate the outcome of your return request.
              </p>

              <p>
                Where a refund is approved, MusoHive aims to process the refund
                within five (5) to seven (7) working days after receiving and
                inspecting the returned product.
              </p>

              <p>
                Refunds will generally be made using the original payment method
                wherever possible. The time taken for the funds to reflect in
                your account may depend on your bank or payment provider.
              </p>

              <p>
                These processing estimates do not override any statutory refund
                deadlines that may apply. Where a refund is required under
                applicable law, it will be provided within the legally
                prescribed period.
              </p>

              <p>
                MusoHive will cover the return shipping costs for approved
                returns, including eligible change-of-mind returns, defective
                products, damaged items and incorrectly supplied orders.
              </p>

              <!-- 2.3 Exchanges -->
              <h3>2.3 Exchanges</h3>

              <p>
                MusoHive allows customers to request exchanges for different
                products, colours or variants, subject to stock availability and
                applicable consumer rights.
              </p>

              <p>
                If the replacement product is more expensive than the original
                purchase, the customer will be required to pay the difference.
                If the replacement product costs less, MusoHive will refund the
                difference.
              </p>

              <p>
                Exchange requests must be submitted through our customer support
                channels. The original product must be returned before the
                replacement is dispatched, unless otherwise agreed with
                MusoHive.
              </p>

              <p>
                MusoHive will cover the return shipping costs for approved
                exchanges. Any additional delivery arrangements for the
                replacement product will be communicated to the customer before
                the exchange is completed.
              </p>

              <!-- 2.4 Faulty, damaged or incorrect products -->
              <h3>2.4 Faulty, damaged or incorrect products</h3>

              <p>
                If you receive a product that is defective, damaged or different
                from what you ordered, please contact MusoHive as soon as
                reasonably possible.
              </p>

              <p>
                Where possible, include your order number and photographs or
                videos showing the issue. This helps us understand the problem
                and assist you more quickly.
              </p>

              <p>
                In accordance with Section 56 of the Consumer Protection Act 68
                of 2008, goods that fail to meet the required quality standards
                may be returned within six (6) months of delivery, subject to
                the provisions of the Act.
              </p>

              <p>
                Where the statutory requirements are met, customers may choose
                the applicable remedy, which may include:
              </p>

              <ul>
                <li>A refund of the purchase price.</li>
                <li>Replacement of the defective product.</li>
                <li>Repair of the defective product.</li>
              </ul>

              <p>
                MusoHive will cover reasonable return and related costs where
                required by applicable consumer protection law.
              </p>

              <!-- 2.5 Consumer rights -->
              <h3>2.5 Your consumer rights</h3>

              <p>
                This Returns &amp; Refunds Policy is intended to operate
                alongside South African consumer protection legislation and does
                not replace, restrict or exclude any rights you may have under
                applicable law.
              </p>

              <p>These rights include, where applicable:</p>

              <ul>
                <li>
                  The seven-day cooling-off right for qualifying electronic
                  transactions under Section 44 of ECTA.
                </li>
                <li>
                  The right to return defective goods within six months under
                  Section 56 of the CPA, subject to the Act.
                </li>
                <li>
                  The right to receive goods that meet the applicable quality,
                  safety and performance standards.
                </li>
                <li>
                  The right to appropriate remedies where goods are defective,
                  damaged or not as described.
                </li>
              </ul>

              <p>
                Nothing in this policy is intended to waive or limit any
                consumer rights that cannot legally be excluded.
              </p>
            </div>
          </details>

          <!-- 3. Shipping & Delivery -->
          <details id="shipping-and-delivery" class="policy-accordion">
            <summary>
              <span>3. Shipping &amp; Delivery Policy</span>
              <mat-icon>expand_more</mat-icon>
            </summary>

            <div class="policy-accordion-content">
              <p class="policy-updated">Last updated: 25 November 2026</p>
              <p>
                At MusoHive, we aim to deliver your music and audio accessories
                safely and as quickly as possible. This policy explains how
                orders are processed, dispatched and delivered within South
                Africa.
              </p>
              <h3>3.1 Delivery methods</h3>
              <p>
                MusoHive offers courier delivery to customers across South
                Africa, subject to courier service availability in the delivery
                area.
              </p>
              <p>
                Deliveries are made to the physical address provided when
                placing an order. Customers are responsible for ensuring that
                their delivery information, including the contact number and
                address, is accurate and complete.
              </p>
              <p>
                Collection or pick-up options may be offered where available.
                Any applicable collection arrangements will be communicated to
                the customer before the order is finalised.
              </p>
              <h3>3.2 Shipping fees</h3>
              <p>
                Shipping fees are determined by the delivery destination, parcel
                size, weight and available courier service. The applicable
                delivery fee will be communicated to the customer before the
                order is confirmed and payment is completed.
              </p>
              <p>
                Where promotional or free-delivery offers are available, the
                applicable conditions will be communicated on the website or
                during the ordering process.
              </p>
              <h3>3.3 Estimated delivery times</h3>
              <p>
                Once an order has been dispatched, the estimated delivery
                timeframes are:
              </p>
              <ul>
                <li>
                  <strong>Major centres:</strong> Approximately 2–5 business
                  days.
                </li>
                <li>
                  <strong>Regional and outlying areas:</strong>
                  Approximately 3–7 business days.
                </li>
              </ul>
              <p>
                These timeframes are estimates and may vary depending on the
                delivery destination, courier availability and other
                circumstances beyond our control.
              </p>
              <p>
                Business days exclude Saturdays, Sundays and South African
                public holidays. Delivery estimates begin once the order has
                been handed over to the courier, not when payment is made.
              </p>
              <h3>3.4 Order processing and dispatch</h3>
              <p>
                Orders are processed after successful payment confirmation
                through our payment gateway.
              </p>
              <p>
                MusoHive aims to process and prepare orders for dispatch within
                1–2 business days after payment confirmation.
              </p>
              <p>
                Our standard order processing and dispatch days are Monday to
                Friday, excluding South African public holidays.
              </p>
              <p>
                Orders placed before 12:00 (noon) on a business day may be
                processed for dispatch on the same day, subject to stock
                availability and operational capacity. Orders placed after 12:00
                (noon), on weekends or on public holidays will generally be
                processed on the next business day.
              </p>
              <p>
                Please note that same-day dispatch is not guaranteed. Processing
                times may be affected by stock availability, payment
                verification or unusually high order volumes.
              </p>
              <p>
                Once your order has been dispatched, tracking information will
                be provided where supported by the courier service.
              </p>
              <h3>3.5 Delivery delays and tracking</h3>
              <p>
                We work with delivery partners to ensure that orders reach
                customers safely and within the estimated delivery period.
                However, delays may occasionally occur due to weather
                conditions, courier operational issues, public holidays,
                incorrect delivery details or other unforeseen circumstances.
              </p>
              <p>
                If your order has not arrived within the estimated delivery
                timeframe, please contact MusoHive with your order number. We
                will assist you in following up with the courier and
                investigating the delay.
              </p>
              <p>
                Where tracking information is available, customers can use the
                supplied tracking details to follow the progress of their
                delivery.
              </p>
              <p>
                Please ensure that someone is available to receive the parcel at
                the delivery address. If a delivery attempt is unsuccessful, the
                courier may arrange another delivery attempt or provide
                instructions for collection.
              </p>
              <p>
                MusoHive remains responsible for assisting customers with
                delivery issues and ensuring that orders are handled in
                accordance with applicable South African consumer protection
                laws.
              </p>
            </div>
          </details>

          <!-- 4. Warranty -->
          <details id="warranty" class="policy-accordion">
            <summary>
              <span>4. Warranty Policy</span>
              <mat-icon>expand_more</mat-icon>
            </summary>

            <div class="policy-accordion-content">
              <p class="policy-updated">Last updated: 25 November 2026</p>

              <p>
                At MusoHive, we want our customers to enjoy reliable products
                and a positive shopping experience. This Warranty Policy
                explains the warranty coverage available for products purchased
                from MusoHive and how customers can submit warranty claims.
              </p>

              <p>
                This policy operates alongside the Consumer Protection Act 68 of
                2008 (CPA) and does not replace or limit any statutory consumer
                rights.
              </p>

              <!-- 4.1 Warranty coverage -->
              <h3>4.1 Warranty coverage</h3>

              <p>
                Products purchased from MusoHive are covered by the applicable
                consumer protection rights under the Consumer Protection Act 68
                of 2008.
              </p>

              <p>
                In terms of Section 56 of the CPA, consumers are entitled to
                return goods that fail to meet the applicable quality and
                performance requirements within six (6) months of delivery,
                subject to the provisions of the Act.
              </p>

              <p>
                Where a product is supplied with an additional manufacturer's or
                supplier's warranty, the applicable warranty period and
                conditions will be determined by the manufacturer or supplier.
                These details may be provided with the product or made available
                by MusoHive upon request.
              </p>

              <p>
                Any manufacturer's warranty is in addition to the consumer
                rights provided by the CPA and does not replace or reduce those
                rights.
              </p>

              <!-- 4.2 Warranty exclusions -->
              <h3>4.2 Warranty exclusions</h3>

              <p>
                A warranty claim may not be accepted where the issue results
                from circumstances such as:
              </p>

              <ul>
                <li>Misuse, negligence or improper handling of the product.</li>
                <li>Accidental damage, including drops, impact or crushing.</li>
                <li>
                  Unauthorised modifications, repairs or disassembly of the
                  product.
                </li>
                <li>
                  Damage caused by exposure to liquids, excessive heat or
                  unsuitable operating conditions.
                </li>
                <li>Normal wear and tear resulting from ordinary use.</li>
                <li>
                  Failure to follow the manufacturer's operating or maintenance
                  instructions.
                </li>
              </ul>

              <p>
                These exclusions apply only where legally permitted and do not
                exclude a customer's statutory rights under the CPA. Each claim
                will be assessed according to the nature of the reported issue
                and applicable consumer protection legislation.
              </p>

              <!-- 4.3 How to submit a warranty claim -->
              <h3>4.3 How to submit a warranty claim</h3>

              <p>
                If you experience a problem with a product purchased from
                MusoHive, please contact our customer support team before
                arranging a return.
              </p>

              <p>To help us assess your claim, please provide:</p>

              <ul>
                <li>Your order number or proof of purchase.</li>
                <li>The name of the product.</li>
                <li>A description of the problem or defect.</li>
                <li>
                  Photographs or videos showing the issue, where possible.
                </li>
              </ul>

              <p>
                Once we receive your request, we will review the information and
                advise you on the next steps. Depending on the nature of the
                issue, we may need to inspect or test the product before
                determining the appropriate remedy.
              </p>

              <p>
                Please do not send products back without first contacting
                MusoHive for return instructions.
              </p>

              <!-- 4.4 Repairs, replacements and refunds -->
              <h3>4.4 Repairs, replacements and refunds</h3>

              <p>
                Where a product is found to be defective and qualifies for
                protection under the CPA, customers are entitled to the
                applicable remedy provided by law.
              </p>

              <p>Depending on the circumstances, these remedies may include:</p>

              <ul>
                <li>A refund of the purchase price.</li>
                <li>Replacement with the same or an equivalent product.</li>
                <li>Repair of the defective product.</li>
              </ul>

              <p>
                Where Section 56 of the CPA applies, the customer may choose the
                applicable remedy, subject to the provisions of the Act.
                MusoHive will not require customers to accept a repair or
                replacement where the law gives them the right to choose another
                remedy.
              </p>

              <p>
                MusoHive will cover reasonable return and related costs where
                required by applicable consumer protection law.
              </p>

              <p>
                Our aim is to resolve valid warranty claims fairly and as
                quickly as possible while ensuring that customers receive the
                protection and remedies provided by South African law.
              </p>
            </div>
          </details>

          <!-- 5. Privacy -->
          <details id="privacy" class="policy-accordion">
            <summary>
              <span>5. Privacy Policy</span>
              <mat-icon>expand_more</mat-icon>
            </summary>

            <div class="policy-accordion-content">
              <p class="policy-updated">Last updated: 25 November 2026</p>
              <p>
                At MusoHive, we respect your privacy and are committed to
                protecting your personal information. This Privacy Policy
                explains what information we collect, how we use and store it,
                and the circumstances in which it may be shared when you visit
                or make a purchase through our website.
              </p>
              <p>
                MusoHive processes personal information in accordance with the
                Protection of Personal Information Act 4 of 2013 (POPIA) and
                other applicable South African privacy laws.
              </p>
              <h3>5.1 Personal information we collect</h3>
              <p>
                When you place an order, contact us or use our website, we may
                collect personal information necessary to provide our services,
                including:
              </p>
              <ul>
                <li>Your name and surname.</li>
                <li>Your email address and telephone number.</li>
                <li>
                  Your delivery address and relevant delivery instructions.
                </li>
                <li>
                  Order details, including products purchased and order history.
                </li>
                <li>
                  Payment confirmation and relevant transaction information
                  provided by our payment provider.
                </li>
                <li>
                  Information you voluntarily provide when contacting us for
                  customer support.
                </li>
              </ul>
              <p>
                We only collect personal information that is reasonably
                necessary for operating our online store, processing orders and
                providing customer support.
              </p>
              <h3>5.2 How we use your information</h3>
              <p>
                MusoHive may use your personal information for the following
                purposes:
              </p>
              <ul>
                <li>Processing and managing your orders.</li>
                <li>Confirming payments and updating order statuses.</li>
                <li>
                  Arranging delivery and communicating with courier services.
                </li>
                <li>Responding to enquiries and providing customer support.</li>
                <li>
                  Managing returns, refunds, exchanges and warranty claims.
                </li>
                <li>Maintaining and improving our website and services.</li>
                <li>Meeting applicable legal and regulatory obligations.</li>
              </ul>
              <p>
                We do not sell or rent customers' personal information to third
                parties for their own marketing purposes.
              </p>
              <h3>5.3 Payment information and Paystack</h3>
              <p>
                All online payment transactions on MusoHive are processed
                securely through our payment provider, Paystack.
              </p>
              <p>
                When you make a payment, your sensitive payment information,
                including card details and banking credentials, is handled
                directly by Paystack and the relevant payment providers.
                MusoHive does not receive or store your full card details,
                banking passwords, PINs or other sensitive banking credentials.
              </p>
              <p>
                MusoHive receives payment confirmation and relevant transaction
                information made available by Paystack, such as payment status
                and transaction references, so that we can verify payments and
                process orders.
              </p>
              <p>
                For more information about how Paystack handles payment
                information, please refer to
                <a
                  href="https://paystack.com/za/terms#privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  >Paystack's Privacy Policy</a
                >.
              </p>
              <h3>5.4 Data storage and security</h3>
              <p>
                MusoHive uses Supabase as its database and data storage platform
                to store and manage relevant customer, order and website
                information.
              </p>
              <p>
                We take reasonable technical and organisational measures to
                protect personal information against unauthorised access, loss,
                misuse, alteration or disclosure.
              </p>
              <p>
                Access to personal information is restricted to what is
                reasonably necessary for operating the store and providing our
                services.
              </p>
              <p>
                Although we take reasonable steps to protect your information,
                no electronic storage system or method of transmission over the
                internet can be guaranteed to be completely secure.
              </p>
              <h3>5.5 Sharing your information</h3>
              <p>
                MusoHive does not share personal information unnecessarily.
                However, certain information may be shared with trusted service
                providers where this is necessary to operate our business and
                fulfil your order.
              </p>
              <p>These service providers may include:</p>
              <ul>
                <li>
                  <strong>Paystack and payment providers:</strong>
                  To process payments and provide payment confirmations.
                </li>
                <li>
                  <strong>Supabase:</strong>
                  To store and manage relevant customer and order information.
                </li>
                <li>
                  <strong>Courier and delivery services:</strong>
                  To receive the delivery details necessary to deliver your
                  order.
                </li>
                <li>
                  <strong>Communication services:</strong>
                  To communicate with you when you contact us or request
                  assistance.
                </li>
              </ul>
              <p>
                These providers may process information on our behalf or as part
                of providing their services. Where required, MusoHive takes
                reasonable steps to ensure that personal information is handled
                in accordance with applicable privacy and data protection
                requirements.
              </p>
              <p>
                We may also disclose information where required by law, a court
                order or a lawful request from an authorised authority.
              </p>
              <h3>5.6 Data retention</h3>
              <p>
                MusoHive retains personal information only for as long as
                reasonably necessary to fulfil the purposes for which it was
                collected, including order processing, customer support,
                returns, warranty claims and applicable legal or accounting
                requirements.
              </p>
              <p>
                When personal information is no longer required, we take
                reasonable steps to securely delete, destroy or de-identify it,
                where appropriate and legally permitted.
              </p>
              <h3>5.7 Your privacy rights</h3>
              <p>In accordance with POPIA, you may have the right to:</p>
              <ul>
                <li>
                  Request access to your personal information held by MusoHive.
                </li>
                <li>
                  Request correction or updating of inaccurate or incomplete
                  information.
                </li>
                <li>
                  Request deletion or destruction of personal information where
                  legally permitted.
                </li>
                <li>
                  Object to the processing of your personal information in
                  circumstances permitted by law.
                </li>
                <li>
                  Withdraw consent where processing is based on your consent.
                </li>
                <li>
                  Lodge a complaint with the Information Regulator of South
                  Africa.
                </li>
              </ul>
              <p>
                Requests relating to your personal information can be submitted
                through our <a routerLink="/contact">Contact Us</a> page. We may
                need to verify your identity before processing certain requests.
              </p>
              <p>
                You can find more information about your privacy rights through
                the
                <a
                  href="https://inforegulator.org.za/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Information Regulator of South Africa</a
                >.
              </p>
              <h3>5.8 Cookies and website information</h3>
              <p>
                Our website or its supporting services may use cookies or
                similar technologies where necessary for website functionality,
                security and performance.
              </p>
              <p>
                You can manage or disable cookies through your browser settings.
                However, disabling certain cookies may affect how parts of the
                website function.
              </p>
              <h3>5.9 Changes to this Privacy Policy</h3>
              <p>
                MusoHive may update this Privacy Policy from time to time to
                reflect changes to our services, data-handling practices or
                applicable laws. Any updates will be published on this page,
                together with the revised last-updated date.
              </p>
              <h3>5.10 Contact us about privacy</h3>
              <p>
                If you have questions about this Privacy Policy, would like to
                exercise your privacy rights or have concerns about how your
                personal information is handled, please contact us through our
                <a routerLink="/contact">Contact Us</a> page.
              </p>
              <p>
                MusoHive will make reasonable efforts to respond to
                privacy-related enquiries and address concerns in accordance
                with applicable law.
              </p>
            </div>
          </details>

          <!-- 6. Contact & Support -->
          <details id="contact" class="policy-accordion">
            <summary>
              <span>6. Contact &amp; Support</span>
              <mat-icon>expand_more</mat-icon>
            </summary>

            <div class="policy-accordion-content">
              <h3>Privacy and personal information enquiries</h3>

              <p>
                If you have questions about how MusoHive collects, uses or
                protects your personal information, or would like to exercise
                your rights under the Protection of Personal Information Act
                (POPIA), please contact us using the contact details provided on
                this page.
              </p>
              <div class="contact-actions">
                <a
                  mat-flat-button
                  class="tm-whatsapp-btn"
                  [href]="whatsapp.contactUrl(whatsappPolicyMessage)"
                  target="_blank"
                  rel="noopener"
                >
                  <mat-icon>chat</mat-icon>
                  Chat on WhatsApp
                </a>

                <a mat-flat-button class="tm-primary-btn" routerLink="/contact">
                  <mat-icon>mail</mat-icon>
                  Contact Page
                </a>
              </div>

              <p class="contact-note">
                The fastest way to reach us is via WhatsApp. Please have your
                order number ready so we can help you as quickly as possible.
              </p>
            </div>
          </details>
        </div>
      </div>
    </section>
  `,

  styles: [
    `
      /* Hero */
      .policies-hero {
        background: linear-gradient(
          135deg,
          var(--tm-primary-dark),
          var(--tm-primary)
        );
        color: #fff;
        padding: 56px 0;
      }

      .policies-hero h1 {
        font-size: 2.25rem;
        font-weight: 700;
        margin: 0 0 8px;
      }

      .policies-hero p {
        font-size: 1.1rem;
        margin: 0;
        color: #b2dfdb;
        max-width: 640px;
      }

      /* Main layout */
      .policies-section {
        padding-top: 48px;
      }

      .policies-layout {
        display: grid;
        grid-template-columns: 240px 1fr;
        gap: 48px;
        align-items: start;
      }

      /* Table of contents */
      .policies-toc {
        position: sticky;
        top: 88px;
        background: var(--tm-surface);
        border: 1px solid var(--tm-border);
        border-radius: var(--tm-radius);
        padding: 20px;
      }

      .policies-toc h2 {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--tm-text-muted);
        margin: 0 0 14px;
        font-weight: 600;
      }

      .policies-toc ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .policies-toc a {
        display: block;
        padding: 7px 10px;
        border-radius: var(--tm-radius-sm);
        font-size: 0.9rem;
        color: var(--tm-text);
        text-decoration: none;
        transition:
          background 0.15s ease,
          color 0.15s ease;
      }

      .policies-toc a:hover {
        background: rgba(0, 121, 107, 0.08);
        color: var(--tm-primary);
      }

      /* Policy accordion container */
      .policies-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 0;
      }

      /* Individual accordion boxes */
      .policy-accordion {
        background: var(--tm-surface);
        border: 1px solid var(--tm-border);
        border-radius: var(--tm-radius);
        overflow: hidden;
        scroll-margin-top: 100px;
        transition: border-color 0.2s ease;
      }

      .policy-accordion:hover {
        border-color: var(--tm-primary);
      }

      /* Clickable heading */
      .policy-accordion summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 20px 24px;
        cursor: pointer;
        list-style: none;
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--tm-text);
        user-select: none;
      }

      .policy-accordion summary::-webkit-details-marker {
        display: none;
      }

      .policy-accordion summary mat-icon {
        color: var(--tm-text-muted);
        transition: transform 0.25s ease;
        flex-shrink: 0;
      }

      /* Rotate arrow when expanded */
      .policy-accordion[open] summary mat-icon {
        transform: rotate(180deg);
      }

      .policy-accordion[open] {
        border-color: var(--tm-primary);
      }

      /* Expanded content */
      .policy-accordion-content {
        padding: 4px 24px 24px;
        border-top: 1px solid var(--tm-border);
        animation: accordion-open 0.2s ease;
      }

      @keyframes accordion-open {
        from {
          opacity: 0;
          transform: translateY(-5px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Policy text */
      .policy-updated {
        font-size: 0.8rem;
        color: var(--tm-text-muted);
        margin: 0 0 20px;
        font-style: italic;
      }

      .policy-accordion-content h3 {
        font-size: 1.05rem;
        font-weight: 600;
        margin: 26px 0 10px;
        color: var(--tm-text);
      }

      .policy-accordion-content p {
        color: var(--tm-text-muted);
        line-height: 1.7;
        margin: 0 0 14px;
      }

      .policy-accordion-content ul {
        margin: 0 0 14px;
        padding-left: 22px;
        color: var(--tm-text-muted);
        line-height: 1.7;
      }

      .policy-accordion-content ul li {
        margin-bottom: 6px;
      }

      .policy-accordion-content strong {
        color: var(--tm-text);
        font-weight: 600;
      }

      /* Contact buttons */
      .contact-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin: 20px 0 16px;
      }

      .contact-note {
        font-size: 0.9rem;
        color: var(--tm-text-muted);
      }

      /* Responsive */
      @media (max-width: 960px) {
        .policies-layout {
          grid-template-columns: 1fr;
          gap: 28px;
        }

        .policies-toc {
          position: static;
          top: auto;
        }

        .policies-toc ul {
          flex-direction: row;
          flex-wrap: wrap;
          gap: 8px;
        }

        .policies-toc li {
          flex: 0 0 auto;
        }

        .policies-toc a {
          background: var(--tm-bg);
          border: 1px solid var(--tm-border);
        }
      }

      @media (max-width: 480px) {
        .policies-hero {
          padding: 40px 0;
        }

        .policies-hero h1 {
          font-size: 1.5rem;
        }

        .policies-hero p {
          font-size: 1rem;
        }

        .policy-accordion summary {
          padding: 17px;
          font-size: 0.95rem;
        }

        .policy-accordion-content {
          padding: 4px 17px 20px;
        }

        .policy-accordion-content h3 {
          font-size: 1rem;
        }

        .contact-actions {
          flex-direction: column;
        }

        .contact-actions a {
          width: 100%;
          justify-content: center;
        }
      }
    `,
  ],
})
export class PoliciesComponent implements AfterViewInit {
  whatsapp = inject(WhatsAppService);
  private platformId = inject(PLATFORM_ID);

  readonly whatsappPolicyMessage =
    "I have a question about MusoHive's store policies.";

  readonly toc: TocItem[] = [
    { id: "terms-and-conditions", label: "1. Terms & Conditions" },
    { id: "returns-and-refunds", label: "2. Returns & Refunds" },
    { id: "shipping-and-delivery", label: "3. Shipping & Delivery" },
    { id: "warranty", label: "4. Warranty" },
    { id: "privacy", label: "5. Privacy" },
    { id: "contact", label: "6. Contact & Support" },
  ];

  scrollTo(event: Event, id: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    event.preventDefault();

    const el = document.getElementById(id) as HTMLDetailsElement | null;

    if (el) {
      el.open = true;

      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      history.replaceState(null, "", `#${id}`);
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const hash = window.location.hash.replace("#", "");

    if (!hash) return;

    const el = document.getElementById(hash) as HTMLDetailsElement | null;

    if (el) {
      el.open = true;

      requestAnimationFrame(() => {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }
}

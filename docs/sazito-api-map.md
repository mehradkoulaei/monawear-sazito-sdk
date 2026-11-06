# Sazito API map

Generated from `src/lib/sazito/routes.json` (run `npm run docs:api`).
SDK: `@sazito/client-sdk` v1.3.3. **Booking is intentionally excluded.**

- Browser code only calls these same-origin routes (DevTools → Network → Fetch/XHR).
- Each route calls exactly ONE SDK method on the server, with per-request credentials loaded from HttpOnly cookies.
- "Cache" is the Next.js data-cache revalidate time for public GET calls; "none" means no-store.
- 68 routes.

## products

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/products/list` | GET | `products.list` | GET /api/v1/storefront/products | Public | 120s | Category and listing pages, home rails, filters, sorting |
| `/api/sazito/products/get` | GET | `products.get` | GET /api/v1/storefront/products/details | Public | 120s | Product detail data (client refresh) |

## search

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/search/query` | GET | `search.query` | GET /api/v1/storefront/search | Public | 60s | Header live search and search page |

## categories

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/categories/list` | GET | `categories.list` | GET /api/v1/product_categories | Public | 600s | Mega menu, category tiles, filters |
| `/api/sazito/categories/get` | GET | `categories.get` | GET /api/v1/product_categories/{id} | Public | 600s | Category details |

## entityRoutes

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/entity-routes/resolve` | GET | `entityRoutes.resolve` | GET /api/v1/storefront/entity_route/route | Public | 600s | Resolve any storefront path (product, category, CMS, blog) |

## cms

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/cms/pages` | GET | `cms.listPages` | GET /api/v1/cms_pages (normal) | Public | 600s | Footer links, sitemap |
| `/api/sazito/cms/blog` | GET | `cms.listBlogPosts` | GET /api/v1/cms_pages (blog) | Public | 600s | Blog listing |
| `/api/sazito/cms/all` | GET | `cms.listAll` | GET /api/v1/cms_pages | Public | 600s | Combined CMS listing |
| `/api/sazito/cms/page/[...path]` | GET | `cms.getPage` | GET /api/v1/storefront/entity_route/route | Public | 600s | CMS page by path (size guide dialog, terms…) |
| `/api/sazito/cms/blog/[...path]` | GET | `cms.getBlogPost` | GET /api/v1/storefront/entity_route/route | Public | 600s | Blog post by path |

## menu

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/menu/header` | GET | `menu.getHeaderMenu` | GET /api/v1/trees/fetch_single | Public | 600s | Mega menu |

## general

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/general/info` | GET | `general.getInfo (+ getFeatures/getCheckoutConfig/getWalletConfig/getTajrobeConfig)` | GET /api/v2/general/info | Public | 600s | Shop info, feature flags, checkout/wallet/review configuration |

## regions

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/regions/list` | GET | `regions.list` | GET /api/v2/regions | Public | 3600s | Province/city selects in checkout and address forms |

## dynamicForms

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/dynamic-forms/[id]` | GET | `dynamicForms.getForm` | GET /api/v1/dynamic_form/{id} | Public | 600s | Dynamic product/checkout forms |
| `/api/sazito/dynamic-forms/upload-product-file` | POST | `dynamicForms.uploadProductFormFile` | POST /api/v1/service/filemanager/uploads/private/productform (multipart) | Guest cookies or JWT | none | File fields in dynamic product forms |

## visits

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/visits/track` | POST | `visits.track (trackProduct/trackCategory are aliases)` | POST /api/v1/visits/add | Guest cookies or JWT | none | Page-view analytics |

## feedbacks

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/feedbacks/product-statistics` | GET | `feedbacks.getProductStatistics` | GET /api/v1/feedbacks/comments/details/{productId} | Public | 300s | Product rating summary |
| `/api/sazito/feedbacks/product-reviews` | GET | `feedbacks.getProductReviews` | GET /api/v1/feedbacks/comments/details/{productId} | Public | 300s | Product reviews list |
| `/api/sazito/feedbacks/seed` | GET | `feedbacks.getSeed` | GET /api/v1/feedbacks/seed/{orderIdentifier} | Order identifier supplied by caller | none | Rate an order (step 1) |
| `/api/sazito/feedbacks/order-rating` | POST | `feedbacks.createOrderRating` | POST /api/v1/feedbacks/comments | Order identifier supplied by caller | none | Rate an order (step 2) |
| `/api/sazito/feedbacks/product-review` | POST | `feedbacks.submitProductReview` | POST /api/v1/feedbacks/comments/details | Order identifier supplied by caller | none | Review a purchased product |
| `/api/sazito/feedbacks/upload-images` | POST | `feedbacks.uploadReviewImages` | POST /api/v1/service/filemanager/uploads/public/tajrobe (multipart) | Guest cookies or JWT | none | Review photo upload |

## cart

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/cart/get` | GET | `cart.get` | GET /api/v2/carts/0 | Guest cookies or JWT | none | Cart drawer, cart page, header count |
| `/api/sazito/cart/create` | POST | `cart.create` | POST /api/v2/carts | Guest cookies or JWT | none | Create a cart with several variants |
| `/api/sazito/cart/add-item` | POST | `cart.addItemWithAttributes (addItem is an alias)` | POST /api/v2/carts[/0/add_products_to_cart] | Guest cookies or JWT | none | Add to cart (product page, quick add) |
| `/api/sazito/cart/update-item` | POST | `cart.updateItemWithAttributes (updateItem is an alias)` | POST /api/v2/carts/0/update_products_in_cart | Guest cookies or JWT | none | Quantity stepper in cart |
| `/api/sazito/cart/remove-item` | POST | `cart.removeItem` | POST /api/v2/carts/0/remove_products_from_cart | Guest cookies or JWT | none | Remove line from cart |

## invoices

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/invoices/create` | POST | `invoices.create` | POST /api/v2/invoices | Guest cookies or JWT | none | Start checkout from the cart |
| `/api/sazito/invoices/refresh` | POST | `invoices.refresh (get is an alias)` | POST /api/v2/invoices/{id}/refresh | Guest cookies or JWT | none | Reload invoice totals |
| `/api/sazito/invoices/add-shipping-address` | POST | `invoices.addShippingAddress` | POST /api/v2/invoices/{id}/add_shipping_address | Guest cookies or JWT | none | Attach address to invoice |
| `/api/sazito/invoices/add-discount-code` | POST | `invoices.addDiscountCode` | POST /api/v2/invoices/{id}/add_discount_code | Guest cookies or JWT | none | Coupon field in checkout |
| `/api/sazito/invoices/remove-discount-code` | POST | `invoices.refresh` | POST /api/v2/invoices/{id}/refresh | Guest cookies or JWT | none | Remove applied discount code |
| `/api/sazito/invoices/assign-shipping-method` | POST | `invoices.assignShippingMethod` | POST /api/v2/invoices/{id}/add_shipping_method | Guest cookies or JWT | none | Choose shipping rate |
| `/api/sazito/invoices/add-details` | POST | `invoices.addDetails` | POST /api/v2/invoices/{id}/add_invoice_details | Guest cookies or JWT | none | Order note |
| `/api/sazito/invoices/add-form` | POST | `invoices.addForm` | POST /api/v2/invoices/{id}/add_form | Guest cookies or JWT | none | Checkout dynamic form |
| `/api/sazito/invoices/add-credit` | POST | `invoices.addCredit` | POST /api/v2/invoices/{id}/add_credit | JWT required | none | Use wallet credit |
| `/api/sazito/invoices/remove-credit` | POST | `invoices.removeCredit` | POST /api/v2/invoices/{id}/remove_credit | JWT required | none | Remove wallet credit |
| `/api/sazito/invoices/applicable-shipping-methods` | GET | `invoices.getApplicableShippingMethods` | GET /api/v2/invoices/{id}/applicable_shipping_methods | Guest cookies or JWT | none | Shipping step options |

## shipping

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/shipping/addresses/create` | POST | `shipping.createAddress` | POST /api/v2/shipping_addresses | Guest cookies or JWT | none | Checkout address form |
| `/api/sazito/shipping/addresses/list` | GET | `shipping.listAddresses` | GET /api/v2/shipping_addresses | JWT required | none | Saved addresses for logged-in customers |
| `/api/sazito/shipping/addresses/get` | GET | `shipping.getAddress` | GET /api/v2/shipping_addresses/{id} | Guest cookies or JWT | none | Re-read the current address |
| `/api/sazito/shipping/methods/list` | GET | `shipping.getMethods` | GET /api/v2/shipping_methods | Public | 600s | Shipping method catalogue |

## payments

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/payments/methods` | GET | `payments.getMethods` | POST /api/v2/payments/list | Guest cookies or JWT | none | Payment method step |
| `/api/sazito/payments/create` | POST | `payments.create` | POST /api/v2/payments | Guest cookies or JWT | none | Create payment for chosen method |
| `/api/sazito/payments/initialize` | POST | `payments.initialize` | POST /api/v2/payments/{id}/process_payment_step | Guest cookies or JWT | none | Start gateway flow |
| `/api/sazito/payments/status` | GET | `payments.getPaymentStep` | POST /api/v2/payments/{id}/process_payment_step | Guest cookies or JWT | none | Payment status polling (browser loops this route) |
| `/api/sazito/payments/step` | POST | `payments.processStep` | POST /api/v2/payments/{id}/process_payment_step | Guest cookies or JWT | none | Additional JSON payment steps (e.g. OTP) |
| `/api/sazito/payments/step-form` | POST | `payments.processStepForm` | POST /api/v2/payments/{id}/process_payment_step (multipart) | Guest cookies or JWT | none | Payment steps that need form/file upload |
| `/api/sazito/payments/callback` | POST | `payments.verifyPaymentCallback` | POST /api/v2/payments/{id}/process_payment_step (form-encoded) | Guest cookies or JWT | none | Verify a gateway return explicitly |

## users

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/users/login` | POST | `users.login` | POST /api/v1/sessions/login | Public | none | Email/password login |
| `/api/sazito/users/otp/request` | POST | `users.requestMobileOTP` | POST /api/v1/sessions/login_request | Public | none | Mobile OTP login (step 1) |
| `/api/sazito/users/otp/verify` | POST | `users.verifyMobileOTP` | POST /api/v1/sessions/login_request_verification | Public | none | Mobile OTP login (step 2) |
| `/api/sazito/users/email-login/request` | POST | `users.requestEmailLogin` | POST /api/v1/users/email_login_request | Public | none | Passwordless email login |
| `/api/sazito/users/register` | POST | `users.register` | POST /api/v1/users/register | Public | none | Registration form |
| `/api/sazito/users/current` | GET | `users.getCurrentUser` | GET /api/v1/users/current | JWT required | none | Profile, header account state |
| `/api/sazito/users/update-profile` | POST | `users.updateProfile` | PUT /api/v1/users/{id} | JWT required | none | Edit profile |
| `/api/sazito/users/mobile-update/request` | POST | `users.requestMobilePhoneUpdate` | POST /api/v1/users/update_mobile_phone_request | JWT required | none | Change mobile (step 1) |
| `/api/sazito/users/mobile-update/verify` | POST | `users.verifyMobilePhoneUpdate` | POST /api/v1/users/update_mobile_phone_verification | JWT required | none | Change mobile (step 2) |
| `/api/sazito/users/password/forgot` | POST | `users.forgotPassword` | POST /api/v1/users/forgot_password | Public | none | Forgot password |
| `/api/sazito/users/password/revive` | POST | `users.revivePassword` | POST /api/v1/users/revive_password | Public | none | Reset password with emailed token |
| `/api/sazito/users/merge` | POST | `users.mergeUser` | POST /api/v1/users/merge_user | JWT required | none | Merge guest data after login (behavior unverified) |

## orders

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/orders/list` | GET | `orders.list` | GET /api/v1/orders | JWT required | none | Order history |
| `/api/sazito/orders/get` | GET | `orders.get` | GET /api/v1/orders/{id} | Order identifier supplied by caller | none | Order detail and order tracking |

## wallet

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/wallet/balance` | GET | `wallet.getBalance` | GET /api/v1/users/wallet/balance | JWT required | none | Wallet balance |
| `/api/sazito/wallet/transactions` | GET | `wallet.listTransactions` | GET /api/v1/wallet/transactions | JWT required | none | Wallet transactions |

## images

| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |
|---|---|---|---|---|---|---|
| `/api/sazito/images/upload` | POST | `images.upload` | POST /api/v1/images (multipart) | JWT required | none | DISABLED by default — admin-style operation |
| `/api/sazito/images/delete` | DELETE | `images.delete` | DELETE /api/v1/images/{id} | JWT required | none | DISABLED by default — admin-style operation |

## Not proxied (no remote call)

`setAuthToken`, `getAuthToken`, `clearAuth`, `isAuthenticated`, `clearCache`, `clearCredentials`, `clearAll`, `getCredentialsManager`, `cart.clearCart`, `invoices.clearInvoice`, `shipping.clearAddress`, `payments.clearPayment`, `searchQuery`. Their effect is handled by HttpOnly cookie helpers (`/api/session/logout`).

## Composite SDK methods handled by the browser as separate requests

`products.search` (use `search.query`), `invoices.get` (= refresh), `invoices.toggleCredit` (add/remove credit), `payments.verify`, `payments.pollUntilSettled` (browser loops `payments/status`), `feedbacks.submitOrderFeedback` (seed → order-rating → product-review), `wallet.applyCredit/removeCredit` (use invoice credit routes), `shipping.updateAddress` (legacy), `booking.*` (excluded).

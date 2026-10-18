# Shopping Buddy MVP

A Flutter MVP foundation for meeting a local shopping companion (Buddy) in Japan.

## Current scope

- Primary home flow: browse Buddy profiles and send direct invitations
- Scheduled invitations: the requester proposes a date/time and the Buddy accepts or declines
- Secondary flow: public area-based companion requests
- Public requests and public profile fields can be browsed before signup; public request URLs can be shared through social media or messaging
- Verified Buddies can apply; only the requester sees the applicant list, compares Buddy profiles and 30-minute rates, then selects one Buddy before the deadline
- Exact meeting details are separated and exposed only to matched participants
- Direct invitations remain a separate flow
- Priority recruiting areas: Shimokitazawa, Shibuya/Harajuku, Asakusa/Kuramae, Akihabara, Jimbocho, Kyoto, Osaka/Shinsaibashi, Nagoya/Sakae, Fukuoka/Tenjin, Sendai, and Sapporo
- Buddy applications are accepted from any city in Japan, including cities outside the priority list
- Japanese and inbound visitors; planned ja/en/zh-Hans/zh-Hant/ko translations for requests, applications, and chat; immediate, same-day, and scheduled plans
- Card payments first; Bitcoin is out of initial scope
- Buddy fees are set in JPY; show an approximate conversion in the visitor’s currency

## Launch decisions

- Buddy profiles can cover multiple areas
- Enable matching independently in each city once at least 2 verified Buddy profiles are registered there; Buddy applications remain open nationwide
- Open beta without invitation-only access; regular Buddy rates apply during beta when live payments are enabled
- Launch iOS and Android together
- Launch with the Buddy referral program: tracked referral links, points redeemable toward the user's Buddy booking, and public nationwide monthly/all-time rankings
- Each redeemable service point is worth JPY 1 at booking
- After Buddy verification, present a prewritten social share message and a unique tracked public-profile link; users choose whether to share through the system share sheet
- Public request pages have shareable URLs that can be sent through social media or messaging; keep exact meeting details and applicant lists private
- Primary MVP success metric: number of matches formed
- Initial target: 10 matches in the first month

## Buddy growth and contribution tracking

- Guiding principle: Buddy talent quality drives service quality; continuously look for shareable UX and reward verified contributions that improve talent quality, successful matches, or nationwide growth
- Every Buddy whose profile passes review can participate in the referral program from launch
- Give each approved Buddy a unique tracked profile/referral link and a ready-to-share social post
- Attribute new Buddy applications to the referring profile
- Keep an admin contribution ledger for applications, approved profiles, first completed paid matches, contribution scores, redeemable service points, and rankings
- For a directly referred Buddy, award 200 service points and 200 contribution points to the direct referrer when the profile passes review, then an additional 400 service points and 400 contribution points when the Buddy completes their first paid match (600 points total for each balance)
- For a second-generation referral ("grandchild Buddy"), award 100 service points and 100 contribution points once to the original referrer when the grandchild Buddy's profile passes review; no extra second-generation match-completion bonus is included at launch
- Award contribution scores and service points for quality milestones rather than raw applications or share counts alone
- Consider future point moments when they produce measurable value: a referred Buddy's first completed match, quality profile improvements, useful post-match feedback (regardless of whether it is positive), a shared public request that leads to a match, or the first verified Buddy supply in a new city; these are candidate ideas and not all are launch commitments
- Track contribution scores separately from redeemable service points, so using points does not lower a person's ranking
- Redeemable service points are for the user's side of a future Buddy booking; they cannot be cashed out or transferred
- Keep the Buddy's agreed compensation intact when a customer uses points; the platform funds the point discount
- Each redeemable service point is worth JPY 1; contribution score values are tracked separately
- Show nationwide monthly and all-time rankings to all app users
- When gift-card rewards launch later, start by rewarding the top 3 of the monthly ranking with Starbucks or Amazon gift cards
- Start with contribution scores, redeemable service points, and rankings; plan to add gift-card rewards later
- Record referrals as a multi-generation network tree (referrer → referred Buddy → their referrals); add the detailed user-facing tree view after launch
- Each Buddy can eventually view their own referral branch, while admins can view the full network to help trace connections and contact the right people if an issue occurs; do not expose private contact details in the tree
- When a post includes a reward or other material benefit, include a clear advertising/PR disclosure in the suggested copy

## What is implemented

- Flutter board screen with area and category filters
- Buddy directory as the home screen, filtered by each Buddy's supported areas; demo directory shows the 11 priority areas, while the Buddy application form accepts other cities nationwide; matching opens independently when a city has 2 verified Buddies; public request board is secondary; Buddy form requires Instagram review (demo only)
- Request creation and applications, requester-only applicant lists with one-Buddy selection, multi-Buddy direct invites that wait for all replies and aggregate accepted rates, pre-payment chat, card payment previews, bilateral completion confirmation, and ratings (currently in-memory demo data)
- Supabase SQL migration for public requests, private applicant lists, private meeting details, one-Buddy selection, pre-payment chat, detail confirmation before payment, bilateral completion, 24-hour post-completion chat, and source/translation fields

The SQL migration has not been applied to a Supabase project. Translation source fields and storage are prepared, but no translation provider is connected. JPY is the rate source; foreign-currency estimates still need a live exchange-rate provider. The Flutter demo does not yet persist data or provide real signup, Buddy verification, messaging, payment, or push notifications.

## Run the Flutter demo

```sh
flutter pub get
flutter run
```

## Backend setup still needed

Create/configure Supabase, Stripe Connect, and Firebase projects, then connect credentials and implement the production auth/payment/push flows. Do not process real payments until Stripe is configured and tested.

## Stack

- Flutter
- Supabase Auth and Postgres (planned)
- Stripe Connect (planned)
- Firebase Cloud Messaging (planned)

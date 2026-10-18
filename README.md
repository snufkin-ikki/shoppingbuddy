# Shopping Buddy MVP

A Flutter MVP foundation for meeting a local shopping companion (Buddy) in Japan.

## Current scope

- Public area-based companion requests
- Visitors can browse public requests and public profile fields before signup
- Verified Buddies can apply; the requester selects one Buddy before the deadline
- Exact meeting details are separated and exposed only to matched participants
- Direct invitations remain a separate flow
- Initial areas: Shimokitazawa, Shibuya/Harajuku, Asakusa/Kuramae, Akihabara, Jimbocho, Kyoto, Osaka/Shinsaibashi, Nagoya/Sakae, Fukuoka/Tenjin, Sendai, and Sapporo
- Japanese and inbound visitors; immediate, same-day, and scheduled plans
- Card payments first; Bitcoin is out of initial scope

## What is implemented

- Flutter board screen with area and category filters
- Request details and a request creation form (currently in-memory demo data)
- Supabase SQL migration for public requests, applications, private meeting details, and one-Buddy selection

The SQL migration has not been applied to a Supabase project. The Flutter demo does not yet persist data or provide real signup, Buddy verification, messaging, payment, or push notifications.

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

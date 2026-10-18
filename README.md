# Shopping Buddy MVP

A Flutter MVP for meeting a local shopping companion (Buddy) in Japan.

## Current scope

- Public area-based companion requests
- Visitors can browse requests and requester profiles before signup
- Verified Buddies can apply; requester selects one Buddy before the deadline
- Existing direct invitation flow remains a separate path
- Initial launch areas: Shimokitazawa, Shibuya/Harajuku, Asakusa/Kuramae, Akihabara, Jimbocho, Kyoto, Osaka/Shinsaibashi, Nagoya/Sakae, Fukuoka/Tenjin, Sendai, and Sapporo
- Japanese and inbound visitors; immediate, same-day, and scheduled plans
- Card payments first; Bitcoin is out of initial scope

## Development status

The repository is being initialized with the public-request MVP flow. Backend credentials and service accounts are not configured yet. The app must not process real payments until Stripe is configured and tested.

## Stack

- Flutter
- Supabase (planned auth/database)
- Stripe Connect (planned payments)
- Firebase Cloud Messaging (planned push notifications)

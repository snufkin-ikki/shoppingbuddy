CREATE TABLE `user_voice` (
	`id` text PRIMARY KEY NOT NULL,
	`visit_reference` text NOT NULL,
	`buddy_id` text NOT NULL,
	`invite_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`status` text DEFAULT 'invited' NOT NULL,
	`rating` integer,
	`body` text,
	`submitted_at` integer,
	`published_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_voice_visit_reference_unique` ON `user_voice` (`visit_reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_voice_invite_hash_unique` ON `user_voice` (`invite_hash`);
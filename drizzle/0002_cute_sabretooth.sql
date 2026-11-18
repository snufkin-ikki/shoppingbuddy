CREATE TABLE `buddy_member_access` (
	`buddy_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `buddy_member_access_email_unique` ON `buddy_member_access` (`email`);--> statement-breakpoint
CREATE TABLE `buddy_peer_introductions` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`target_id` text NOT NULL,
	`strengths` text NOT NULL,
	`experience` text NOT NULL,
	`good_for` text NOT NULL,
	`status` text NOT NULL,
	`submitted_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `buddy_peer_author_target` ON `buddy_peer_introductions` (`author_id`,`target_id`);--> statement-breakpoint
CREATE TABLE `buddy_referrals` (
	`code` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`status` text NOT NULL,
	`name` text,
	`area` text,
	`interest` text,
	`media_url` text,
	`line_kind` text,
	`line_contact` text,
	`submitted_at` integer,
	`target_id` text
);

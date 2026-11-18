CREATE TABLE `buddy_search_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at_ms` integer NOT NULL,
	`area` text NOT NULL,
	`description` text NOT NULL,
	`line_kind` text NOT NULL,
	`line_contact` text NOT NULL
);

ALTER TABLE "orders" ADD COLUMN "delivery_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "public_token" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_name" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_phone" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_address1" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_address2" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_suburb" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_city" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_province" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_postal_code" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tracking_ref" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipped_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_public_token_unique" UNIQUE("public_token");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_nonneg" CHECK ("orders"."delivery_cents" >= 0);
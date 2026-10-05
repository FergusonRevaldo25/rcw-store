CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text,
	"seller_id" text,
	"name" text NOT NULL,
	"is_digital" boolean DEFAULT false NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"quantity" integer NOT NULL,
	"line_total_cents" integer NOT NULL,
	CONSTRAINT "order_items_qty_positive" CHECK ("order_items"."quantity" > 0),
	CONSTRAINT "order_items_price_nonneg" CHECK ("order_items"."unit_price_cents" >= 0),
	CONSTRAINT "order_items_line_matches" CHECK ("order_items"."line_total_cents" = "order_items"."unit_price_cents" * "order_items"."quantity")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"number" integer GENERATED ALWAYS AS IDENTITY (sequence name "orders_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1000 CACHE 1),
	"channel" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"customer_id" text,
	"customer_name" text,
	"customer_email" text,
	"cashier_id" text,
	"pos_session_id" text,
	"currency" text DEFAULT 'ZAR' NOT NULL,
	"subtotal_cents" integer NOT NULL,
	"discount_cents" integer DEFAULT 0 NOT NULL,
	"vat_cents" integer DEFAULT 0 NOT NULL,
	"vat_included" boolean DEFAULT true NOT NULL,
	"total_cents" integer NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_subtotal_nonneg" CHECK ("orders"."subtotal_cents" >= 0),
	CONSTRAINT "orders_discount_valid" CHECK ("orders"."discount_cents" >= 0 and "orders"."discount_cents" <= "orders"."subtotal_cents"),
	CONSTRAINT "orders_vat_nonneg" CHECK ("orders"."vat_cents" >= 0),
	CONSTRAINT "orders_total_nonneg" CHECK ("orders"."total_cents" >= 0),
	CONSTRAINT "orders_pos_has_session" CHECK ("orders"."channel" <> 'pos' or "orders"."pos_session_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "pos_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"till" text DEFAULT 'Till 1' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"opened_by" text,
	"closed_by" text,
	"opening_float_cents" integer DEFAULT 0 NOT NULL,
	"expected_cash_cents" integer,
	"counted_cash_cents" integer,
	"note" text,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	CONSTRAINT "pos_sessions_float_nonneg" CHECK ("pos_sessions"."opening_float_cents" >= 0),
	CONSTRAINT "pos_sessions_counted_nonneg" CHECK ("pos_sessions"."counted_cash_cents" is null or "pos_sessions"."counted_cash_cents" >= 0),
	CONSTRAINT "pos_sessions_closed_has_time" CHECK ("pos_sessions"."status" = 'open' or "pos_sessions"."closed_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"method" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"amount_cents" integer NOT NULL,
	"provider_ref" text,
	"recorded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmed_at" timestamp with time zone,
	CONSTRAINT "payments_amount_positive" CHECK ("payments"."amount_cents" > 0)
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"payment_id" text,
	"amount_cents" integer NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'requested' NOT NULL,
	"requested_by" text,
	"decided_by" text,
	"decision_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone,
	CONSTRAINT "refunds_amount_positive" CHECK ("refunds"."amount_cents" > 0),
	CONSTRAINT "refunds_maker_checker" CHECK ("refunds"."decided_by" is null or "refunds"."requested_by" is null or "refunds"."decided_by" <> "refunds"."requested_by")
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"delta" integer NOT NULL,
	"reason" text NOT NULL,
	"order_id" text,
	"note" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_movements_nonzero" CHECK ("stock_movements"."delta" <> 0)
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_seller_id_sellers_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."sellers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_cashier_id_user_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_pos_session_id_pos_sessions_id_fk" FOREIGN KEY ("pos_session_id") REFERENCES "public"."pos_sessions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sessions" ADD CONSTRAINT "pos_sessions_opened_by_user_id_fk" FOREIGN KEY ("opened_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sessions" ADD CONSTRAINT "pos_sessions_closed_by_user_id_fk" FOREIGN KEY ("closed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_user_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_requested_by_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_decided_by_user_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_product_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_number_idx" ON "orders" USING btree ("number");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_channel_created_idx" ON "orders" USING btree ("channel","created_at");--> statement-breakpoint
CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_session_idx" ON "orders" USING btree ("pos_session_id");--> statement-breakpoint
CREATE INDEX "pos_sessions_status_idx" ON "pos_sessions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "pos_sessions_one_open_idx" ON "pos_sessions" USING btree ("opened_by") WHERE "pos_sessions"."status" = 'open';--> statement-breakpoint
CREATE INDEX "payments_order_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_provider_ref_idx" ON "payments" USING btree ("method","provider_ref") WHERE "payments"."provider_ref" is not null;--> statement-breakpoint
CREATE INDEX "refunds_order_idx" ON "refunds" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "refunds_status_idx" ON "refunds" USING btree ("status");--> statement-breakpoint
CREATE INDEX "stock_movements_product_idx" ON "stock_movements" USING btree ("product_id","created_at");--> statement-breakpoint
CREATE INDEX "stock_movements_order_idx" ON "stock_movements" USING btree ("order_id");
ALTER TABLE "refunds" ADD COLUMN "pos_session_id" text;--> statement-breakpoint
ALTER TABLE "refunds" ADD COLUMN "paid_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_pos_session_id_pos_sessions_id_fk" FOREIGN KEY ("pos_session_id") REFERENCES "public"."pos_sessions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "refunds_session_idx" ON "refunds" USING btree ("pos_session_id");
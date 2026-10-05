import { and, asc, desc, eq, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orderItems, orders, payments, products } from "@/lib/db/schema";

const TZ = "Africa/Johannesburg";
export const LOW_STOCK_AT = 10;
const COUNTED = ["paid", "fulfilled"] as const;

export const saToday = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: TZ });

export function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export type Day = { day: string; cents: number; orders: number };

// The last 31 days, with empty days filled in as zero.
export async function dailySales(): Promise<Day[]> {
  const today = saToday();
  const start = addDays(today, -30);
  const dayExpr = sql<string>`to_char((${orders.createdAt} at time zone 'Africa/Johannesburg')::date, 'YYYY-MM-DD')`;

  const rows = await db
    .select({
      day: dayExpr,
      cents: sql<number>`coalesce(sum(${orders.totalCents}), 0)::int`,
      orders: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(
      and(
        inArray(orders.status, [...COUNTED]),
        sql`(${orders.createdAt} at time zone 'Africa/Johannesburg')::date >= ${start}::date`
      )
    )
    .groupBy(dayExpr);

  const map = new Map(rows.map((r) => [r.day, r]));
  return Array.from({ length: 31 }, (_, i) => {
    const day = addDays(start, i);
    const r = map.get(day);
    return { day, cents: r?.cents ?? 0, orders: r?.orders ?? 0 };
  });
}

export async function paymentSplit() {
  return db
    .select({
      method: payments.method,
      cents: sql<number>`coalesce(sum(${payments.amountCents}), 0)::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .where(
      and(
        inArray(orders.status, [...COUNTED]),
        sql`${orders.createdAt} >= now() - interval '30 days'`
      )
    )
    .groupBy(payments.method)
    .orderBy(desc(sql`sum(${payments.amountCents})`));
}

export async function topSellers() {
  return db
    .select({
      name: orderItems.name,
      units: sql<number>`sum(${orderItems.quantity})::int`,
      cents: sql<number>`sum(${orderItems.lineTotalCents})::int`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(
      and(
        inArray(orders.status, [...COUNTED]),
        sql`${orders.createdAt} >= now() - interval '30 days'`
      )
    )
    .groupBy(orderItems.name)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(5);
}

export async function lowStock() {
  return db
    .select({ id: products.id, name: products.name, stock: products.stock, sellerId: products.sellerId })
    .from(products)
    .where(
      and(
        eq(products.status, "live"),
        eq(products.trackStock, true),
        eq(products.isDigital, false),
        lte(products.stock, LOW_STOCK_AT)
      )
    )
    .orderBy(asc(products.stock), asc(products.name))
    .limit(5);
}
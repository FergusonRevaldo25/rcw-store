require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
(async () => {
  console.log("Host:", new URL(process.env.DATABASE_URL).host);
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    select p.slug, p.status, p.track_stock, p.stock, p.is_digital,
           c.slug as category, c.live as category_live,
           (select count(*) from product_images i where i.product_id = p.id)::int as images
    from products p join categories c on c.id = p.category_id
    order by p.created_at`;
  console.table(rows);
})();

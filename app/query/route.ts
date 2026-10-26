import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET() {
  try {
    // 1) Duplicate email ရှိမရှိ စစ်မယ် (စာလုံးကြီးသေး မခွဲဘဲ)
    const dups = await sql`
      SELECT lower(email) AS email, COUNT(*)::int AS n
      FROM customers
      GROUP BY lower(email)
      HAVING COUNT(*) > 1
    `;

    if (dups.length > 0) {
      // duplicate ရှိရင် unique index ထည့်လို့ မရလို့ ရပ်မယ်
      return Response.json(
        { step: 'duplicate-check', ok: false, duplicates: dups },
        { status: 409 },
      );
    }

    // 2) Unique index ထည့်မယ် (ရှိပြီးသားဆို ကျော်၊ ထပ်ဖွင့်လည်း error မတက်ဘူး)
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS customers_email_unique
      ON customers (lower(email))
    `;

    // 3) ထည့်ပြီးကြောင်း အတည်ပြုမယ်
    const idx = await sql`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'customers' AND indexname = 'customers_email_unique'
    `;

    // 4) Orphan နဲ့ FK က ဆက်ကောင်းနေသေးလား (Step 1 ရဲ့ ရလဒ်ကိုပါ စစ်မယ်)
    const orphans = await sql`
      SELECT COUNT(*)::int AS n
      FROM invoices i
      LEFT JOIN customers c ON c.id = i.customer_id
      WHERE c.id IS NULL
    `;
    const fks = await sql`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'invoices'::regclass AND contype = 'f'
    `;

    return Response.json({
      ok: true,
      duplicate_emails: dups.length,        // 0 ဖြစ်ရမယ်
      email_unique_index: idx.map((r) => r.indexname), // ['customers_email_unique']
      orphan_invoices: orphans[0].n,        // 0 ဖြစ်ရမယ်
      foreign_keys: fks.map((r) => r.conname),
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
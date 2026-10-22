'use server';
import { signIn } from '../auth';
import { AuthError } from 'next-auth';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { fetchCustomersPages } from './data';

declare const process: {
  env: {
    POSTGRES_URL?: string;
  };
};

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

// Use Zod to update the expected types

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {   // Define the State type for form validation errors and messages Chapter 13
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
    // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

    // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

   
  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  
  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
      // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

    // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

 export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
 
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

 // Use Zod to validate the form data for deleting an invoice
 export async function deleteInvoice(id: string) {
   // Unreachable code block
   await sql`DELETE FROM invoices WHERE id = ${id}`;
   revalidatePath('/dashboard/invoices');
 }

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
// Create new customer function အတွက်
const AVATARS = [
  '/customers/amy-burns.png',
  '/customers/balazs-orban.png',
  '/customers/delba-de-oliveira.png',
  '/customers/evil-rabbit.png',
  '/customers/lee-robinson.png',
  '/customers/michael-novotny.png',
] as const;

export type CustomerState = {
  errors?: {
    name?: string[];
    email?: string[];
    image_url?: string[];
  };
  message?: string | null;
};

const CustomerFormSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Please enter a name.'),
  email: z.string().trim().email('Please enter a valid email.'),
  image_url: z.string().optional(),
});

const CreateCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Please enter a name.'),
  email: z.string().trim().email('Please enter a valid email.'),
  image_url: z.enum(AVATARS, { message: 'Please choose an avatar.' }),
});

export async function createCustomer(formData: FormData) {
  const parsed = CreateCustomerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    image_url: formData.get('image_url'),
  });

  // Invalid input: insert မလုပ်ဘဲ ပြန်ထွက်။ throw မလုပ်လို့ page မပျက်ပါဘူး
  if (!parsed.success) return;

  const { name, email, image_url } = parsed.data;

  try {
    await sql`
      INSERT INTO customers (name, email, image_url)
      VALUES (${name}, ${email}, ${image_url})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return; // Task 8 မှာ error message ပြန်ပေးမယ်
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}
// Update customer function အတွက် ၁-၁၀-၂၀၂၆
const UpdateCustomer = CustomerFormSchema.omit({ id: true }); // create မှာသုံးတဲ့ schema 

export async function updateCustomer(
  id: string,
  prevState: CustomerState,
  formData: FormData,
) {
  const validated = UpdateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing or invalid fields. Failed to update customer.',
    };
  }

  const { name, email } = validated.data;

  try {
    await sql`
      UPDATE customers
      SET name = ${name}, email = ${email}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to update customer.' };
  }

  revalidatePath('/dashboard/customers');
  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard');
  redirect('/dashboard/customers');
}

type DeleteCustomerState = { message: string | null };

export async function deleteCustomer(
  id: string,
  query: string,
  page: number,
  _prevState: DeleteCustomerState,
  _formData: FormData,
): Promise<DeleteCustomerState> {
  let result;

  try {
    result = await sql.begin(async (tx) => {
      const [customer] = await tx`
        SELECT id, name FROM customers WHERE id = ${id} FOR UPDATE
      `;
      if (!customer) return { status: 'not_found' as const };

      const [{ count }] = await tx`
        SELECT COUNT(*)::int AS count FROM invoices WHERE customer_id = ${id}
      `;
      if (count > 0) {
        return {
          status: 'has_invoices' as const,
          name: customer.name as string,
          count: count as number,
        };
      }

      await tx`DELETE FROM customers WHERE id = ${id}`;
      return { status: 'deleted' as const };
    });
  } catch (error: any) {
    if (error?.code === '23503') {
      return { message: 'This customer has invoices, so it cannot be deleted.' };
    }
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to delete customer.' };
  }

  if (result.status === 'has_invoices') {
    return {
      message: `${result.name} has ${result.count} invoice(s). Delete those invoices first.`,
    };
  }

  revalidatePath('/dashboard', 'layout');

  const totalPages = await fetchCustomersPages(query);
  const safePage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));

  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (safePage > 1) params.set('page', String(safePage));
  const qs = params.toString();

  redirect(`/dashboard/customers${qs ? `?${qs}` : ''}`);
}

export async function signInWithGithub(formData: FormData) {
  const redirectTo = formData.get('redirectTo');
  const path =
    typeof redirectTo === 'string' &&
    redirectTo.startsWith('/') &&
    !redirectTo.startsWith('//')
      ? redirectTo
      : '/dashboard';

  await signIn('github', { redirectTo: path });
}
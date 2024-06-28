'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import {DateTime} from "luxon";
import OpenAI from "openai";

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
          console.error('Unexpected error:', error);
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function authenticateAPI(req: Request) {
  const authToken = (req.headers.get('authorization') || '').split("Bearer ").at(1)
  if (!authToken || authToken !== process.env.API_AUTH_TOKEN) {
    return false;
  }
  return true;
}

const FormSchema = z.object({
  hash: z.string(),
  author: z.string(),
  summary: z.string(),
  status: z.enum(['0', '1', '2'], {
    invalid_type_error: 'Please select a cast status.',
  }),
});

// Use Zod to update the expected types
const UpdateCast = FormSchema.omit({hash: true, author: true});

// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    summary?: string[];
    status?: string[];
  };
  message?: string | null;
};


export async function updateCast(
    hash: string,
    prevState: State,
    formData: FormData,
) {
  const validatedFields = UpdateCast.safeParse({
    summary: formData.get('summary'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update cast.',
    };
  }

  const {summary, status} = validatedFields.data;
  const now = DateTime.now().setZone('UTC').toISO();
  try {
    await sql`
            UPDATE casts
            SET summary = ${summary},
                status  = ${status},
                updated_at = ${now}
            WHERE hash = ${hash}
        `;
  } catch (error) {
    return {message: 'Database Error: Failed to Update Cast.'};
  }

  revalidatePath('/dashboard/casts');
  redirect('/dashboard/casts');
}

export async function askForHeadline(text: string) {
  console.log('askForHeadline', text);
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY as string,
  });

  try {
    const systemPrompt = process.env.OPENAI_SYSTEM_PROMPT as string;
    const userPrompt = process.env.OPENAI_USER_PROMPT as string;
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL as string,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${userPrompt}: ${text}` }
      ],
      max_tokens: 10,
    });
    let result = response.choices[0].message.content;
    // Not sure why it always starts with a quote
    if (result?.startsWith('"')) {
        result = result.slice(1);
    }
    console.log('Headline:', result);
    return result;
    // return 'This is a headline test';
  } catch (error) {
    console.error('Failed to generate headline:', error);
    throw new Error('Failed to generate headline.');
  }
}
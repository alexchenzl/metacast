'use client';

import 'react-farcaster-embed/dist/styles.css';
import { FarcasterEmbed } from 'react-farcaster-embed/dist/client';

import { CastForm } from '@/app/lib/definitions';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import {askForHeadline, updateCast} from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import React, {useTransition} from "react";

export default function EditCastForm({ cast }: { cast: CastForm }) {
  const initialState = { message: null, errors: {} };
  const updateCastWithHash = updateCast.bind(null, cast.hash);

  const [state, dispatch] = useFormState(updateCastWithHash, initialState);

  const [headline, setHeadline] = React.useState(cast.summary);
  const [isPending, startTransition] = useTransition()

  const generateHeadline = () => {
    startTransition(async () => {
    const text = cast.text;
    try {
      let result = await askForHeadline(text);
      if (result){
        setHeadline(result);
      }
    }catch (error) {
      console.error('Failed to generate headline:', error);
    }
    });
  }

  return (
    <div className="flex justify-center">
      <form action={dispatch} className="w-[64rem]">
        <div className="rounded-md bg-gray-50 p-4 md:p-6">
          <div className="mb-4">
            <FarcasterEmbed
              username={cast.username}
              hash={cast.hash.slice(0, 9)}
            />
          </div>

          {/* Cast Summary */}
          <div className="mb-4">
            <label htmlFor="amount" className="mb-2 block text-sm font-medium">
              Summary
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative flex">
                <input
                  id="summary"
                  name="summary"
                  type="text"
                  defaultValue={headline}
                  placeholder="Generate a head line for this cast"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                />
              </div>
              <div className="flex justify-end mt-3">
                <Button  type="button" onClick={ generateHeadline }>Generate Headline</Button>
              </div>
            </div>
          </div>

          {/* Cast Status */}
          <fieldset>
            <legend className="mb-2 block text-sm font-medium">Status</legend>
            <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    id="none"
                    name="status"
                    type="radio"
                    value="0"
                    defaultChecked={cast.status === 0}
                    className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  />
                  <label
                    htmlFor="pending"
                    className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                  >
                    None
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="pending"
                    name="status"
                    type="radio"
                    value="1"
                    defaultChecked={cast.status === 1}
                    className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  />
                  <label
                    htmlFor="pending"
                    className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-gray-600"
                  >
                    Pending <ClockIcon className="h-4 w-4" />
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="published"
                    name="status"
                    type="radio"
                    value="2"
                    defaultChecked={cast.status === 2}
                    className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  />
                  <label
                    htmlFor="published"
                    className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-gray-600"
                  >
                    published <CheckIcon className="h-4 w-4" />
                  </label>
                </div>
              </div>
            </div>
          </fieldset>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/dashboard/casts"
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Cancel
          </Link>
          <Button type="submit">Update Cast</Button>
        </div>
      </form>
    </div>
  );
}

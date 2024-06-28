import { UpdateCast } from '@/app/ui/casts/buttons';
import CastStatus from '@/app/ui/casts/status';
import {
  formatDatetimeToDateUTC,
  formatDatetimeToUTC,
} from '@/app/lib/utils';
import { fetchFilteredCasts } from '@/app/lib/data';
import clsx from "clsx";

export default async function CastsTable({
  period,
  tag,
  currentPage,
}: {
  period: string;
  tag: string;
  currentPage: number;
}) {
  const casts = await fetchFilteredCasts(period, tag, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
            <tr>
              <th scope="col" className="px-3 py-5 font-medium">
                No.
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Text
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Channel
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Tags
              </th>
              <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                User
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Likes
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Replies
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Recasts
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Casted At
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Summary
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Fetched At
              </th>
            </tr>
            </thead>
            <tbody className="bg-white">
            {casts?.map((cast, index) => (
                <tr
                    key={cast.hash}
                    className={ clsx("w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg",
                        {
                          "bg-gray-50": index % 2 !== 0,
                          "bg-white": index % 2 === 0,
                        }
                    )}
                >
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex items-center gap-3">
                      <p>{index + 1 + 10 * (currentPage - 1)}</p>
                      <div className="flex justify-end gap-3">
                        <UpdateCast hash={cast.hash}/>
                      </div>
                      <div><CastStatus status={cast.status}/></div>
                    </div>
                  </td>
                  <td className="w-96 whitespace-pre-line px-3 py-3 text-base">
                    <a
                        href={`https://warpcast.com/${cast.username}/${cast.hash.slice(0, 9)}`}
                        target="_blank"
                    >
                      <p className="line-clamp-5">{cast.text}</p>
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {cast.channel}
                  </td>
                  <td className="whitespace-pre-line px-3 py-3">
                    {cast.tags.split(',').join('\n')}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>@{cast.username}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{cast.likes}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {cast.replies}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {cast.recasts}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDatetimeToUTC(cast.casted_at)}
                  </td>
                  <td className="w-96 whitespace-pre-line px-3 py-3 text-base">
                    <p className="line-clamp-5">{cast.summary}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDatetimeToDateUTC(cast.fetched_at)}
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useDebouncedCallback} from 'use-debounce';

export default function Search({placeholder}: { placeholder: string }) {

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const {replace} = useRouter();

    const handleSearch = useDebouncedCallback((term) => {
        console.log(`Searching... ${term}`);

        const params = new URLSearchParams(searchParams);
        params.set('page', '1');

        if (term) {
            params.set('tag', term);
        } else {
            params.delete('tag');
        }

        params.set('period', searchParams.get('period') || 'latest');

        replace(`${pathname}?${params.toString()}`);
    }, 500);

    const handlePeriod = (period: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        params.set('period', period);
        params.set('tag', searchParams.get('tag') || '');
        replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="relative w-full flex justify-center">
            <div className=" flex flex-col flex-1  max-w-xl">
                <fieldset>
                    <legend className="mb-2 block text-sm font-medium">
                        Period
                    </legend>
                    <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
                        <div className="flex flex-1">
                            <div className="flex items-center w-1/3">
                                <input
                                    id="latest"
                                    name="period"
                                    type="radio"
                                    value="latest"
                                    defaultChecked={!searchParams.get('period') || searchParams.get('period')?.toString() === 'latest'}
                                    className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                                    onChange={(e) => { handlePeriod(e.target.value); }}
                                />
                                <label
                                    htmlFor="recent"
                                    className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                                >
                                    Latest
                                </label>
                            </div>
                            <div className="flex items-center w-1/3">
                                <input
                                    id="last7days"
                                    name="period"
                                    type="radio"
                                    value="last7days"
                                    defaultChecked={searchParams.get('period')?.toString() === 'last7days'}
                                    className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                                    onChange={(e) => { handlePeriod(e.target.value); }}
                                />
                                <label
                                    htmlFor="last7days"
                                    className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                                >
                                    Last 7 Days
                                </label>
                            </div>
                            <div className="flex items-center w-1/3">
                                <input
                                    id="alltime"
                                    name="period"
                                    type="radio"
                                    value="alltime"
                                    defaultChecked={searchParams.get('period')?.toString() === 'history'}
                                    className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                                    onChange={(e) => { handlePeriod(e.target.value); }}
                                />
                                <label
                                    htmlFor="alltime"
                                    className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                                >
                                   All Time
                                </label>
                            </div>
                        </div>
                    </div>
                </fieldset>

                <div className="mt-3">
                    <label htmlFor="search" className="mb-2 block text-sm font-medium">
                       Tag
                    </label>
                    <input
                        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                        placeholder={placeholder}
                        onChange={(e) => {
                            handleSearch(e.target.value);
                        }}
                        defaultValue={searchParams.get('tag')?.toString()}
                    />
                </div>
            </div>
        </div>


    );
}

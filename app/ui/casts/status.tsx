import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function CastStatus({ status }: { status: 0 | 1 | 2 }) {
    return (
        <span
            className={clsx(
                'inline-flex items-center rounded-full px-2 py-1 text-xs',
                {
                    'bg-blue-200 text-white': status === 1,
                    'bg-green-500 text-white': status === 2,
                },
            )}
        >
      {status === 1 ? (
          <>
              <ClockIcon className="ml-1 w-4 text-gray-500" />
          </>
      ) : null}
            {status === 2 ? (
                <>
                    <CheckIcon className="ml-1 w-4 text-white" />
                </>
            ) : null}
    </span>
    );
}
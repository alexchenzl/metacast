import {sql} from '@vercel/postgres';
import {DateTime} from 'luxon';
import {Cast, CastForm, HeadlineCast, User} from './definitions';
import {unstable_noStore as noStore} from 'next/cache';

const ITEMS_PER_PAGE = 10;

export async function getUser(email: string) {
    try {
        const user = await sql`SELECT *
                               FROM users
                               WHERE email = ${email}`;
        return user.rows[0] as User;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export async function fetchCastByHash(hash: string) {
    noStore();

    try {
        console.log('Fetching cast data...', hash);

        const data = await sql<CastForm>`
            SELECT casts.hash,
                   casts.username,
                   casts.text,
                   casts.channel,
                   casts.tags,
                   casts.summary,
                   casts.status,
                   casts.casted_at
            FROM casts
            WHERE casts.hash = ${hash};
        `;
        return data.rows[0];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch cast.');
    }
}

export async function fetchLatestPendingCasts() {
    const now = DateTime.now().setZone('UTC');
    let to = now.toISO();
    let from = now.minus({days: 1}).toISO();
    try {
        const casts = await sql<Cast>`
            SELECT *
            FROM casts
            WHERE (casts.fetched_at BETWEEN ${from} AND ${to})
              AND casts.status = 1
            ORDER BY casts.fetched_at::timestamp::date DESC, casts.scv DESC
        `;

        const pendingCasts: HeadlineCast[] = casts.rows.map((cast) => {
                return {
                    headline: cast.summary,
                    fid: cast.fid,
                    hash: cast.hash,
                };
            });

        return pendingCasts;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch casts.');
    }
}


export async function fetchFilteredCasts(
    period: string,
    tag: string,
    currentPage: number,
) {
    const now = DateTime.now().setZone('UTC');
    let to = now.toISO();

    let fromTime = now.minus({days: 1});
    if (period === 'last7days') {
        fromTime = now.minus({days: 7});
    } else if (period === 'alltime') {
        fromTime = now.minus({days: 365});
    }

    let from = fromTime.toISO();
    let castedAtFrom = fromTime.toISODate()
    console.log('date range', from, 'to', to);

    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    try {
        const casts = await sql<Cast>`
            SELECT *
            FROM casts
            WHERE (casts.fetched_at BETWEEN ${from} AND ${to})
              AND casts.casted_at::timestamp::date >= ${castedAtFrom}
              AND (casts.tags ILIKE ${`%${tag}%`} OR casts.channel ILIKE ${`%${tag}%`})
            ORDER BY  casts.status DESC, casts.fetched_at::timestamp::date DESC, casts.scv DESC
                LIMIT ${ITEMS_PER_PAGE}
            OFFSET ${offset}
        `;
        return casts.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch casts.');
    }
}

export async function fetchCastsPages(period: string, tag: string) {
    noStore();
    try {
        const now = DateTime.now().setZone('UTC');
        let to = now.toISO();

        let fromTime = now.minus({days: 1});
        if (period === 'last7days') {
            fromTime = now.minus({days: 7});
        } else if (period === 'alltime') {
            fromTime = now.minus({days: 365});
        }

        let from = fromTime.toISO();
        let castedAtFrom = fromTime.toISODate()

        const count = await sql`SELECT COUNT(*)
                                FROM casts
                                WHERE (casts.fetched_at BETWEEN ${from} AND ${to})
                                  AND casts.casted_at::timestamp::date >= ${castedAtFrom}
                                  AND (casts.tags ILIKE ${`%${tag}%`} OR casts.channel ILIKE ${`%${tag}%`})
        `;

        const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
        return totalPages;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of invoices.');
    }
}

export async function bulkInsertCasts(casts: Cast[]) {
    try {
        const r = await sql`
            INSERT INTO casts (hash, username, fid, text, channel, tags, likes, replies, recasts, scv, casted_at,
                               fetched_at)
            SELECT hash,
                   username,
                   fid,
                   text,
                   channel,
                   tags,
                   likes,
                   replies,
                   recasts,
                   scv,
                   casted_at,
                   fetched_at
            FROM json_populate_recordset(NULL::casts, ${JSON.stringify(casts)}) ON CONFLICT (hash) DO
            UPDATE SET
                likes = EXCLUDED.likes,
                replies = EXCLUDED.replies,
                recasts = EXCLUDED.recasts;
        `;
        return r.rowCount;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to insert casts.');
    }
}

export async function bulkUpdateCastStatuses(hashes: string[], status: number) {
    try {
        let count = 0;
        for (const hash of hashes) {
            console.log('Updating cast status...', hash, status);
            // sql template can only support primitive values
            const r = await sql`
                UPDATE casts
                SET status = ${status}
                WHERE casts.hash = ${hash} 
            `;
            count += r.rowCount;
        }
        return count;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to update cast statuses.');
    }
}
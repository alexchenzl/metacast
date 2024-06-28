import {z, ZodError} from "zod";
import {bulkInsertCasts} from "@/app/lib/data";
import {DateTime} from "luxon";
import {authenticateAPI} from "@/app/lib/actions";

const castSchema = z.object({
    hash: z.string(),
    username: z.string(),
    fid: z.number(),
    text: z.string(),
    channel: z.string().nullable(),
    tags: z.string().nullable(),
    likes: z.number(),
    replies: z.number(),
    recasts: z.number(),
    scv: z.number(),
    casted_at: z.string(),
});
const castsSchema = z.array(castSchema)


export async function POST(req: Request) {

    if (await authenticateAPI(req) === false) {
        return Response.json({error: 'Unauthorized'}, {status: 401})
    }

    const now = DateTime.now().setZone('UTC').toISO();
    try {
        let data = await req.json()

        await castsSchema.parseAsync(data)

        data.forEach((cast: any) => {
            cast.fetched_at = now;
            if (cast.tags === null) {
                cast.tags = '';
            }
        });

        await bulkInsertCasts(data)
    } catch (e) {
        console.error(e)
        let message = 'unknown error';
        if (e instanceof ZodError) {
            message = e.toString();
        } else if (e instanceof Error) {
            message = e.message;
        }
        return Response.json({code: "error", message: message})
    }
    return Response.json({code: "ok"})
}
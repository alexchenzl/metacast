import {publishCast} from "@/app/lib/cast";
import {HeadlineCast} from "@/app/lib/definitions";
import {fetchLatestPendingCasts} from "@/app/lib/data";
import {authenticateAPI} from "@/app/lib/actions";

// Fetch the latest pending casts to be published
export async function GET(req: Request) {
    if (await authenticateAPI(req) === false) {
        return Response.json({error: 'Unauthorized'}, {status: 401})
    }

    try {
        const casts = await fetchLatestPendingCasts();
        return Response.json(casts)
    } catch (e) {
        if (e instanceof Error) {
            return Response.json({code: "error", message: e.message})
        }
        return Response.json({code: "error", message: "unknown error"})
    }
}

export async function POST(req: Request) {
    if (await authenticateAPI(req) === false) {
        return Response.json({error: 'Unauthorized'}, {status: 401})
    }

    try {
        const casts = await fetchLatestPendingCasts();
        if (casts.length === 0) {
            return Response.json({code: "ok", message: "No casts to publish"})
        }
        const results = await publishCast(casts as HeadlineCast[]);

        console.log('Publishing casts results:', results);
        return Response.json({code: "ok", results: results})
    } catch (e) {
        return Response.json({code: "error", message: e})
    }
}
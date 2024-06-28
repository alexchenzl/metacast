import {
    FarcasterNetwork,
    getAuthMetadata,
    getSSLHubRpcClient,
    makeCastAdd,
    NobleEd25519Signer,
} from "@farcaster/hub-nodejs";
import {config} from "dotenv";
import {bytesToHex, Hex, hexToBytes} from "viem";
import {CastAddMessage, CastType, HubResult} from "@farcaster/core";
import {HeadlineCast} from "@/app/lib/definitions";
import {DateTime} from "luxon";
import {bulkUpdateCastStatuses} from "@/app/lib/data";

config();

const NEYNAR_HUB_URL = process.env.NEYNAR_HUB_URL as string;
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY as string;
const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY as Hex;
const FID = process.env.FID ? parseInt(process.env.FID) : 0; // Your fid
const FC_NETWORK = FarcasterNetwork.MAINNET;

const ed25519Signer = new NobleEd25519Signer(hexToBytes(SIGNER_PRIVATE_KEY));
const dataOptions = {
    fid: FID,
    network: FC_NETWORK,
};
const CHANNEL_URL = process.env.CHANNEL_URL as string;

export async function makeHeadlineCastToAdd(message: HeadlineCast): Promise<HubResult<CastAddMessage>> {
    const cast = await makeCastAdd(
        {
            text: ` ${message.headline}`,
            embeds: [{castId: {hash: hexToBytes(<`0x${string}`>message.hash), fid: message.fid}}],
            embedsDeprecated: [],
            mentions: [message.fid],
            mentionsPositions: [0],
            parentUrl: CHANNEL_URL,
            type: CastType.CAST,
        },
        dataOptions,
        ed25519Signer
    );
    return cast;
}

export async function publishCast(messages: HeadlineCast[]) {
    const results = [];
    if (messages.length === 0) {
        console.log('No messages to post');
        return [];
    }


    const client = getSSLHubRpcClient(NEYNAR_HUB_URL);
    // // const client = getSSLHubRpcClient(AIRSTACK_HUB_URL);
    // client.$.waitForReady(Date.now() + 5000, async (e) => {
    //     if (e) {
    //         console.error(`Failed to connect to the gRPC server:`, e);
    //     } else {
    console.log(`Connected to the grpc server`);

    const now = DateTime.now().setZone('UTC').toISO();
    const authMetadata = getAuthMetadata("api_key", NEYNAR_API_KEY);

    const succeeds = [];
    for (const msg of messages) {
        const result = {
            // hash of the new meta cast
            meta: '',
            // hash of the quoted cast
            hash: msg.hash,
            headline: msg.headline,
            error: 'ok'
        };
        const cast = await makeHeadlineCastToAdd(msg);
        if (cast.isOk()) {
            // Broadcast the cast/message to the Farcaster network
            const submitResult = await client.submitMessage(
                cast.value,
                authMetadata,
            );
            if (submitResult.isOk()) {
                succeeds.push(msg.hash);
                const hash = bytesToHex(submitResult.value.hash);
                result.meta = hash;
                console.log(`Posted ${now} ${hash} ${msg.hash} ${msg.headline}`);
            } else {
                result.error = submitResult.error.message;
                console.error(`Failed to post:  ${now} ${msg.hash} ${msg.headline} ${submitResult.error}`);
            }
            succeeds.push(msg.hash);
        } else {
            const error = cast.error;
            // Handle the error case
            result.error = error.message;
            console.error(`Error posting: ${now} ${msg.hash} ${msg.headline} ${error}`);
        }
        results.push(result);
    }
    // After everything, close the RPC connection
    client.close();

    if (succeeds.length > 0) {
        await bulkUpdateCastStatuses(succeeds, 2);
    }
    return results;
}

// });
// return;
// }


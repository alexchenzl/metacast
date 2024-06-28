// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
};

export type Cast = {
    hash: string;
    username: string;
    fid: number;
    text: string;
    likes: number;
    replies: number;
    recasts: number;
    channel: string;
    tags: string;
    summary: string;
    status: 0 | 1 | 2;
    scv: number;
    casted_at: string;
    fetched_at: string;
    updated_at: string;
}

export type CastForm = {
    hash: string;
    username: string;
    text: string;
    channel: string;
    tags: string;
    casted_at: string;
    summary: string;
    status: 0 | 1 | 2;
}


export type HeadlineCast = {
    /** Headline to post */
    headline: string;
    /** Fid of the user who created the original cast */
    fid: number;
    /** Hash of the original cast */
    hash: string;
}
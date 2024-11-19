import { NextResponse } from 'next/server';

const root = 'https://ensembledata.com/apis';
const endpoint = '/tt/hashtag/posts';
const token = 'jCWoWxc8XqoLv4de';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const name = searchParams.get('name') || '';
    const cursor = searchParams.get('cursor') || '0';

    try {
        // Construct API URL
        const params = new URLSearchParams({ name, cursor, token });
        const url = `${root}${endpoint}?${params.toString()}`;

        // Fetch data from TikTok API
        const response = await fetch(url);
        if (!response.ok) {
            return NextResponse.json(
                { message: `Failed to fetch TikTok API. Status: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Return data to the frontend
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching TikTok API:', error.message);
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}

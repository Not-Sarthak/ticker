import { NextResponse } from 'next/server';
interface FrameMetadata {
    accountAssociation?: {
        header: string;
        payload: string;
        signature: string;
    };
    frame: {
        version: string;
        description: string;
        name: string;
        iconUrl: string;
        tagline: string;
        homeUrl: string;
        imageUrl: string;
        buttonTitle: string;
        tags: string[];
        splashImageUrl: string;
        splashBackgroundColor: string;
        primaryCategory: string;
        ogTitle: string;
        ogDescription: string;
        ogImageUrl: string;
        heroImageUrl: string;
    };
}

const appUrl = "https://ticker.megabyte0x.xyz";


async function generateMetadata(): Promise<FrameMetadata> {
    const metadata: FrameMetadata = {
        frame: {
            version: "1",
            description: "Get yourself some RWAs",
            name: "Ticker",
            iconUrl: `${appUrl}/splash.png`,
            tagline: "Get yourself some RWAs",
            homeUrl: `${appUrl}`,
            imageUrl: `${appUrl}/splash.png`,
            buttonTitle: "Launch Frame",
            splashImageUrl: `${appUrl}/splash.png`,
            splashBackgroundColor: "#ffd698",
            primaryCategory: "finance",
            ogTitle: "Ticker",
            ogDescription: "Get yourself some RWAs",
            tags: ["crypto", "rwa", "swap", "bridge", "crosschain"],
            ogImageUrl: `${appUrl}/splash.png`,
            heroImageUrl: `${appUrl}/splash.png`,
        },
        accountAssociation: {
            header: "eyJmaWQiOjE0NTgyLCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4RTc0NzUyQTZlQTgyOWJmMEY0N0Q4ODMzRjVjMEY5MDMwYWIyMTU1MyJ9",
            payload: "eyJkb21haW4iOiJ0aWNrZXIubWVnYWJ5dGUweC54eXoifQ",
            signature: "MHhlMjZiZmM3YzRmOTM0M2ZjNjFiNjNlODVkMDgyZWIyOThjZTg5MDU5ZTM5NTRiMzFiYjUwYzEwZDMwZmExZDJmMTdiYWFjNjgyZmE1ZmIzZjUxMzdjNmJjNDIzMTM4ZjJhMmJkOWZhMDJlZWNjYjZlZjZlN2M2NGRmYWU3OTUwZTFj"
        }
    }
    return metadata;
}

export async function GET() {
    try {
        const config = await generateMetadata();
        return NextResponse.json(config);
    } catch (error) {
        console.error('Error generating metadata:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

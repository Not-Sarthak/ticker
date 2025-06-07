import { NextResponse } from 'next/server';
import { Metadata } from "next";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
    version: "1",
    name: "Ticker",
    homeUrl: "ticker.megabyte0x.xyz",
    iconUrl: `${appUrl}/favicon.ico`,
    splashImageUrl: `${appUrl}/splash.png`,
    splashBackgroundColor: "#ffd698",
    description: "Get yourself some RWAs",
    primaryCategory: "finance",
    tags: ["crypto", "rwa", "swap", "bridge", "crosschain"],
    tagline: "Get yourself some RWAs",
    ogTitle: "Ticker",
    ogDescription: "Get yourself some RWAs",
    ogImageUrl: `${appUrl}/splash.png`,
};


async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Ticker",
        openGraph: {
            title: "Ticker",
            description:
                "Get yourself some RWAs",
            images: [`${appUrl}/splash.png`],
        },
        other: {
            "fc:frame": JSON.stringify(frame),
        },
    };
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

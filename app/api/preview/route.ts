
import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            }
        })

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch URL' }, { status: response.status })
        }

        const contentType = response.headers.get('content-type') || ''
        if (contentType.startsWith('image/')) {
            return NextResponse.json({
                title: url.split('/').pop() || 'Image',
                description: 'Direct Image URL',
                image: url,
                url
            })
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        const getMeta = (prop: string) =>
            $(`meta[property="${prop}"]`).attr('content') ||
            $(`meta[name="${prop}"]`).attr('content')

        const title = getMeta('og:title') || getMeta('twitter:title') || $('title').text()
        const description = getMeta('og:description') || getMeta('twitter:description') || getMeta('description')

        // Comprehensive image search
        let image = getMeta('og:image') ||
            getMeta('twitter:image') ||
            getMeta('twitter:image:src') ||
            $('link[rel="image_src"]').attr('href') ||
            $('link[rel="apple-touch-icon"]').attr('href') ||
            $('link[rel="icon"]').attr('href')

        // Resolve relative URLs
        if (image && !image.startsWith('http')) {
            try {
                image = new URL(image, url).toString()
            } catch (e) {
                // Keep original if resolution fails
            }
        }

        return NextResponse.json({
            title,
            description,
            image,
            url
        })

    } catch (error) {
        console.error('Preview error for URL:', url, error)
        return NextResponse.json({ error: 'Failed to parse URL' }, { status: 500 })
    }
}

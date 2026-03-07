// middleware.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getValidSubdomain } from '@/utils/subdomain';

// RegExp for public files
const PUBLIC_FILE = /\.(.*)$/; // Files

const SUBDOMAINS = ["user", "admin"];

export async function middleware(req: NextRequest) {
	// Clone the URL
	const url = req.nextUrl.clone();

	//   // Skip public files
	//   if (PUBLIC_FILE.test(url.pathname) || url.pathname.includes('_next')) return;

	const hostname = req.headers.get('host');
	const subdomain = getValidSubdomain(hostname);

	if (!subdomain) {
		return NextResponse.next();
	}

	if (SUBDOMAINS.includes(subdomain)) {
		// Subdomain available, rewriting
		console.log(`>>> Rewriting: ${url.pathname} to /${subdomain}${url.pathname}`);
		url.pathname = `/${subdomain}${url.pathname}`;

		return NextResponse.rewrite(url);
	}

	return NextResponse.next();
}
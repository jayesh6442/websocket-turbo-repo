'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Prevent static generation of error pages
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>404 - Page Not Found</CardTitle>
          <CardDescription>
            The page you&apos;re looking for doesn&apos;t exist.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Link href="/" className="flex-1">
            <Button className="w-full">Go Home</Button>
          </Link>
          <Link href="/login" className="flex-1">
            <Button variant="outline" className="w-full">Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

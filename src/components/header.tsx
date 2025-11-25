import Link from 'next/link';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  return (
    <header className="no-print sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="h-6 w-6"
            >
              <rect width="256" height="256" fill="none" />
              <path
                d="M32,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H40A8,8,0,0,1,32,64Zm8,64H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16Zm176,56H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"
                fill="hsl(var(--primary))"
              />
            </svg>
            <span className="font-bold sm:inline-block font-headline text-lg">
              ProList
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
            <Link href="/admin">
              <Button variant="ghost" size="icon" aria-label="Admin Settings">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

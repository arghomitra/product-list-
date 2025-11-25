import Link from 'next/link';
import { Settings, Menu, History, Trash2, Share2, Printer, FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import React from 'react';

type AppHeaderProps = {
    isSuggestingOrder: boolean;
    consentGiven: boolean | null;
    handleSuggestOrder: () => void;
    handleClearList: () => void;
    handleShare: () => void;
    handlePrint: () => void;
    handleDownloadPdf: () => void;
};

export function AppHeader({ 
    isSuggestingOrder, 
    consentGiven, 
    handleSuggestOrder, 
    handleClearList, 
    handleShare, 
    handlePrint, 
    handleDownloadPdf 
}: AppHeaderProps) {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);


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
            <div className="md:hidden ml-auto">
                {isMounted && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleSuggestOrder} disabled={isSuggestingOrder || !consentGiven}>
                        {isSuggestingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <History className="mr-2 h-4 w-4" />}
                        Suggest Order
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={!consentGiven}>
                                <Trash2 className="mr-2 h-4 w-4" /> Clear List
                            </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will permanently clear your current list quantities and notes.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearList}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <DropdownMenuItem onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDownloadPdf}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Link href="/admin" passHref>
                           <DropdownMenuItem>
                             <Settings className="mr-2 h-4 w-4" />
                             Admin
                           </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
                )}
            </div>
             <nav className="hidden md:flex items-center">
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

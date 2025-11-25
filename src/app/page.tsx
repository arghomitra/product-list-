'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useListStore } from '@/hooks/use-list-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { FileDown, Printer, Share2, Loader2, History, Menu, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { AppHeader } from '@/components/header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { suggestOrder } from '@/ai/flows/suggest-order-flow';
import { useToast } from '@/hooks/use-toast';
import { Quantities } from '@/hooks/use-list-store';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCookieConsent } from '@/hooks/use-cookie-consent';

export default function Home() {
  const { items, quantities, notes, isLoaded, updateQuantity, updateNotes, saveOrder, pastOrders, setQuantities, clearList } = useListStore();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { consent, giveConsent } = useCookieConsent();

  const [isSuggestingOrder, setIsSuggestingOrder] = useState(false);
  const [creationDate, setCreationDate] = useState<string | null>(null);

  React.useEffect(() => {
    setCreationDate(new Date().toLocaleDateString());
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const handleSaveOrder = () => {
    if(!consent) return;
    const selectedItems = Object.keys(quantities).length > 0;
    if (selectedItems) {
      saveOrder();
      toast({
        title: "Order Saved",
        description: "Your current list has been saved to your order history.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Cannot Save Empty List",
        description: "Add items to your list before saving an order.",
      });
    }
  };

  const generatePdf = async () => {
    handleSaveOrder();
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    
    doc.setFont('PT Sans', 'bold');
    doc.setFontSize(18);
    doc.text('ProList - Item List', 14, 22);

    doc.setFont('PT Sans', 'normal');
    doc.setFontSize(10);
    doc.text(`Date: ${creationDate}`, 14, 28);


    const tableData = Object.entries(quantities)
      .map(([itemId, quantity]) => {
        const item = items.find(i => i.id === itemId);
        return item ? [item.name, quantity] : null;
      })
      .filter((row): row is [string, number] => row !== null);

    if (tableData.length > 0) {
      autoTable(doc, {
        head: [['Item', 'Quantity']],
        body: tableData,
        startY: 35,
        theme: 'striped',
        headStyles: { fillColor: [46, 58, 135] }, // Navy blue
      });
    } else {
      doc.text('No items selected.', 14, 35);
    }

    const finalY = (doc as any).lastAutoTable.finalY || (tableData.length > 0 ? 35 : 45);

    if (notes.trim() !== '') {
      doc.setFontSize(12);
      doc.text('Notes:', 14, finalY + 10);
      doc.setFontSize(10);
      const splitNotes = doc.splitTextToSize(notes, 180);
      doc.text(splitNotes, 14, finalY + 16);
    }
    
    return doc;
  };

  const handleDownloadPdf = async () => {
    const doc = await generatePdf();
    doc.save('ProList_Items.pdf');
  };

  const handlePrint = () => {
    handleSaveOrder();
    window.print();
  };

  const handleShare = async () => {
    const doc = await generatePdf();
    const pdfBlob = doc.output('blob');
    const pdfFile = new File([pdfBlob], 'ProList_Items.pdf', { type: 'application/pdf' });
    
    const shareData = {
      files: [pdfFile],
      title: 'ProList Item List',
      text: 'Here is the item list I created.',
    };

    if (navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "List Shared",
          description: "Your item list was shared successfully.",
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
            console.error('Share failed:', error);
            toast({
                variant: 'destructive',
                title: "Share Failed",
                description: "There was an error trying to share the list.",
            });
        }
      }
    } else {
      doc.save('ProList_Items.pdf');
      toast({
        title: "Share Not Supported",
        description: "Your browser doesn't support sharing files, so the PDF has been downloaded instead.",
      });
    }
  };

  const handleSuggestOrder = async () => {
    if (pastOrders.length < 15) {
      toast({
        variant: 'destructive',
        title: 'Not Enough Data',
        description: `Need at least 15 past orders to suggest a new one. You have ${pastOrders.length}.`,
      });
      return;
    }
    setIsSuggestingOrder(true);
    try {
      const ordersToSuggestFrom = pastOrders.slice(0, 15).map(order => ({
        ...order,
        items: order.items.map(item => ({...item, name: items.find(i => i.id === item.id)?.name || 'Unknown Item' }))
      }));

      const result = await suggestOrder({ pastOrders: ordersToSuggestFrom });
      
      const newQuantities: Quantities = {};
      result.suggestedOrder.forEach(suggestedItem => {
        const item = items.find(i => i.name.toLowerCase() === suggestedItem.name.toLowerCase());
        if (item) {
          newQuantities[item.id] = suggestedItem.quantity;
        }
      });
      setQuantities(newQuantities);

      toast({
        title: 'Order Suggested',
        description: 'Your item list has been updated with the AI-powered suggestion.',
      });

    } catch (error) {
      console.error("AI order suggestion failed:", error);
      toast({
        variant: "destructive",
        title: "Suggestion Failed",
        description: "Could not suggest an order at this time. Please try again later.",
      });
    } finally {
      setIsSuggestingOrder(false);
    }
  };
  
  const handleClearList = () => {
    clearList();
    toast({
      title: "List Cleared",
      description: "All item quantities and notes have been removed.",
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4 no-print">
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
            My Item List
          </h1>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
             <Button variant="outline" size="sm" onClick={handleSuggestOrder} disabled={isSuggestingOrder || !consent}>
              {isSuggestingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <History className="mr-2 h-4 w-4" />}
              Suggest Order
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={!consent}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear List
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently clear your current list quantities and notes. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearList}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button size="sm" onClick={handleDownloadPdf}>
              <FileDown className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
          <div className="md:hidden ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSuggestOrder} disabled={isSuggestingOrder || !consent}>
                  {isSuggestingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <History className="mr-2 h-4 w-4" />}
                  Suggest Order
                </DropdownMenuItem>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={!consent}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear List
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will permanently clear your current list quantities and notes. This cannot be undone.
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Card>
          <div className="no-print p-6 pt-6">
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm mt-0 hidden md:block"
            />
          </div>
          <Separator className="no-print" />
          <CardContent className="p-0">
            <div id="print-area">
              <h1 className="p-6 font-headline text-2xl font-bold hidden print:block">ProList</h1>
              <p className="px-6 pb-2 text-sm text-muted-foreground hidden print:block">Date: {creationDate}</p>
              <ScrollArea className="h-96">
                <div className="p-6 pt-0">
                  {isLoaded ? (
                    filteredItems.length > 0 ? (
                      filteredItems.map(item => (
                        <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-b-0">
                          <span className="flex-1 font-medium">{item.name}</span>
                          <Input
                            type="number"
                            min="0"
                            value={quantities[item.id] || ''}
                            onChange={e => updateQuantity(item.id, parseInt(e.target.value, 10) || 0)}
                            className="w-20 text-center no-print"
                            aria-label={`Quantity for ${item.name}`}
                          />
                          <span className="w-20 text-center hidden print:inline-block font-medium">{quantities[item.id] > 0 ? `x ${quantities[item.id]}`: ''}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-10">No items found.</div>
                    )
                  ) : (
                    <div className="text-center text-muted-foreground py-10">Loading list...</div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-6 hidden print:block">
                  {notes && (
                      <>
                        <h2 className="font-bold text-lg mb-2">Notes:</h2>
                        <p className="whitespace-pre-wrap">{notes}</p>
                      </>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="no-print">
            <CardHeader>
                <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                placeholder="Add extra items or notes for the PDF here..."
                value={notes}
                onChange={e => updateNotes(e.target.value)}
                />
            </CardContent>
        </Card>
      </main>

      {consent === false && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg no-print">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-foreground">
              We use cookies to save your list and order history. By using the app, you consent to our use of cookies.
            </p>
            <Button onClick={giveConsent}>Accept</Button>
          </div>
        </div>
      )}
    </div>
  );
}

    

    
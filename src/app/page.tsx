'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useListStore } from '@/hooks/use-list-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { FileDown, Printer, Share2, Sparkles, Loader2, ListPlus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { AppHeader } from '@/components/header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { suggestSimilarItems } from '@/ai/flows/suggest-similar-items';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { items, quantities, notes, isLoaded, updateQuantity, updateNotes } = useListStore();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
  const [creationDate, setCreationDate] = useState<string | null>(null);

  React.useEffect(() => {
    setCreationDate(new Date().toLocaleDateString());
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const generatePdf = async () => {
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
        // This can happen if the user cancels the share dialog.
        // We don't need to show an error in that case.
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
      // Fallback for browsers that don't support Web Share API for files
      doc.save('ProList_Items.pdf');
      toast({
        title: "Share Not Supported",
        description: "Your browser doesn't support sharing files, so the PDF has been downloaded instead.",
      });
    }
  };

  const handleSuggestItems = async () => {
    setIsSuggesting(true);
    const currentItems = Object.keys(quantities).map(id => items.find(i => i.id === id)?.name).filter(Boolean) as string[];
    
    if (currentItems.length === 0) {
      toast({
        variant: "destructive",
        title: "No Items Selected",
        description: "Please select some items before asking for suggestions.",
      });
      setIsSuggesting(false);
      return;
    }

    try {
      const result = await suggestSimilarItems({ items: currentItems });
      setSuggestions(result.suggestions);
      setIsSuggestionDialogOpen(true);
    } catch (error) {
      console.error("AI suggestion failed:", error);
      toast({
        variant: "destructive",
        title: "Suggestion Failed",
        description: "Could not get suggestions at this time. Please try again later.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };
  
  const addSuggestedItem = (itemName: string) => {
    const existingItem = items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (existingItem) {
        updateQuantity(existingItem.id, (quantities[existingItem.id] || 0) + 1);
        toast({ title: "Quantity Updated", description: `Increased quantity for ${itemName}.` });
    } else {
        toast({ title: "Item Not Found", description: `${itemName} is not in the master list. An admin can add it.` });
    }
    setSuggestions(prev => prev.filter(s => s !== itemName));
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
            <Button variant="outline" size="sm" onClick={handleSuggestItems} disabled={isSuggesting}>
              {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Suggest Items
            </Button>
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
        </div>
        <Card>
          <CardHeader className="no-print">
            <CardTitle>Items</CardTitle>
            <CardDescription>
              Select quantities for the items you need. Use the search box to filter.
            </CardDescription>
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm mt-4"
            />
          </CardHeader>
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
          <Separator className="no-print" />
          <CardFooter className="p-6 no-print">
            <Textarea
              placeholder="Add extra items or notes for the PDF here..."
              value={notes}
              onChange={e => updateNotes(e.target.value)}
            />
          </CardFooter>
        </Card>
      </main>

      <Dialog open={isSuggestionDialogOpen} onOpenChange={setIsSuggestionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>AI Suggestions</DialogTitle>
            <DialogDescription>
              Here are some items you might also be interested in. Click to add them to your list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{suggestion}</span>
                  <Button variant="outline" size="sm" onClick={() => addSuggestedItem(suggestion)}>
                    <ListPlus className="h-4 w-4 mr-2" /> Add
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center">No new suggestions found.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSuggestionDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useListStore } from '@/hooks/use-list-store';
import { AppHeader } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const addItemSchema = z.object({
  name: z.string().min(3, { message: "Item name must be at least 3 characters." }),
});

function AdminPage() {
  const { items, addItem, deleteItem, isLoaded } = useListStore();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const form = useForm<z.infer<typeof addItemSchema>>({
    resolver: zodResolver(addItemSchema),
    defaultValues: { name: '' },
  });

  function onSubmit(values: z.infer<typeof addItemSchema>) {
    addItem(values.name);
    toast({ title: "Item Added", description: `Successfully added "${values.name}".` });
    form.reset();
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline">Manage Items</CardTitle>
        <CardDescription>
          Add or remove items from the master list. These changes will be saved for all users.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel className="sr-only">New Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter new item name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </form>
        </Form>

        <div>
          <Input
            placeholder="Search items to delete..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-96 border rounded-md">
            <div className="p-4">
              {!isLoaded && (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {isLoaded && filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 py-2 border-b last:border-b-0">
                    <span className="flex-1">{item.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete {item.name}</span>
                    </Button>
                  </div>
                ))
              ) : isLoaded ? (
                <p className="text-center text-muted-foreground">No items found.</p>
              ) : null}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminContainer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    // In a real application, this would be a secure check against a backend.
    if (password === 'admin') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
        {isAuthenticated ? (
          <AdminPage />
        ) : (
          <Dialog open={true} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>Admin Access Required</DialogTitle>
                <DialogDescription>
                  Please enter the password to manage the item list.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="password" className="sr-only">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="font-code"
                  />
                </div>
              </div>
               {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter className="sm:justify-start">
                <Button type="button" onClick={handleLogin}>
                  Login
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
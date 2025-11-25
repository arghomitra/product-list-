'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function AdminContainer() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (password === 'admin') {
      window.location.href = 'https://docs.google.com/spreadsheets/d/11znIZUTFc-xSbMapphpjoMPQHFdSBuH4wt4ObFXarEI/edit?usp=sharing';
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
          <Dialog open={true} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => {
                e.preventDefault();
                router.push('/');
            }}>
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
      </main>
    </div>
  );
}

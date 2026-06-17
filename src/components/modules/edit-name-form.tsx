'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditNameFormProps {
  initialName: string;
}

export function EditNameForm({ initialName }: EditNameFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name || name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to update name');
      }

      toast.success('Name updated successfully');
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setName(initialName);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 max-w-xs w-full">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          className="h-8 py-1 px-2 text-sm"
          placeholder="Enter name"
          autoFocus
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSave}
          disabled={loading}
          className="h-8 w-8 text-success hover:text-success hover:bg-success/10 shrink-0"
          title="Save"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCancel}
          disabled={loading}
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
          title="Cancel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">{name}</span>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent"
        title="Edit Name"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

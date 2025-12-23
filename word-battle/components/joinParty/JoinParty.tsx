import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users } from "lucide-react";

export default function JoinParty() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full h-full flex flex-col items-center justify-center gap-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-2xl transition-all active:scale-95 border border-zinc-300 shadow-sm p-0"
        >
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-tighter leading-none text-center px-2">
            Join a<br />Party
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form>
          <DialogHeader>
            <DialogTitle>Join a Party</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="code">Party Code</Label>
              <Input id="code" name="code" placeholder="Party Code" required />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit">Join</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
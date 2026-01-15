
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SizeGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SizeGuideDialog({ open, onOpenChange }: SizeGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Size Guide - T-Shirts</DialogTitle>
          <DialogDescription>
            All measurements are in inches.
          </DialogDescription>
        </DialogHeader>
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Chest</TableHead>
                <TableHead>Length</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell>S</TableCell>
                    <TableCell>36-38</TableCell>
                    <TableCell>28</TableCell>
                </TableRow>
                 <TableRow>
                    <TableCell>M</TableCell>
                    <TableCell>39-41</TableCell>
                    <TableCell>29</TableCell>
                </TableRow>
                 <TableRow>
                    <TableCell>L</TableCell>
                    <TableCell>42-44</TableCell>
                    <TableCell>30</TableCell>
                </TableRow>
                 <TableRow>
                    <TableCell>XL</TableCell>
                    <TableCell>45-47</TableCell>
                    <TableCell>31</TableCell>
                </TableRow>
            </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}

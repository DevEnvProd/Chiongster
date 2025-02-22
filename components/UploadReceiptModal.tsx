"use client"

import { useState } from "react"
import { supabase } from "@/utils/supabaseClient"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface UploadReceiptModalProps {
  bookingId: string
  onClose: () => void
  onUploadSuccess: (bookingId: string, receiptPath: string) => void
}

export default function UploadReceiptModal({ bookingId, onClose, onUploadSuccess }: UploadReceiptModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const fileName = `${bookingId}_${Date.now()}_${file.name}`
      const { data, error } = await supabase.storage.from("receipts").upload(fileName, file)

      if (error) throw error

      const { data: publicUrlData } = supabase.storage.from("receipts").getPublicUrl(data.path)

      const receiptPath = publicUrlData.publicUrl

      const { error: updateError } = await supabase
        .from("booking")
        .update({
          hasReceipt: true,
          uploaded: receiptPath,
        })
        .eq("id", bookingId)

      if (updateError) throw updateError

      onUploadSuccess(bookingId, receiptPath)
    } catch (error) {
      console.error("Error uploading receipt:", error)
      setError("Failed to upload receipt. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Receipt</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input type="file" onChange={handleFileChange} accept="image/*,.pdf" disabled={uploading} />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Receipt"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


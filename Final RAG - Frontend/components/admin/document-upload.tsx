"use client"

import type React from "react"
import type { User } from "@/lib/auth"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, X } from "lucide-react"
import { documentStore } from "@/lib/document-store"
import { useToast } from "@/hooks/use-toast"

interface DocumentUploadProps {
  user: User
  onUploadSuccess?: () => void
}

export function DocumentUpload({ user, onUploadSuccess }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const categories = [
    "Academic",
    "Admissions",
    "Administration",
    "Campus Life",
    "Faculty",
    "Research",
    "Student Services",
    "Technology",
    "Other",
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setMessage("")
      setMessageType("")
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      setMessage("")
      setMessageType("")
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !category) {
      setMessage("Please select a file and category")
      setMessageType("error")
      return
    }

    if (!user || user.role !== "admin") {
      setMessage("Only administrators can upload documents")
      setMessageType("error")
      return
    }

    setIsUploading(true)
    setMessage("")

    try {
      const formData = new FormData()
      formData.append("email", user.email)
      formData.append("file", selectedFile)

      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()

        documentStore.addDocument({
          name: selectedFile.name,
          type: selectedFile.type || "application/octet-stream",
          size: selectedFile.size,
          uploadedBy: user.email,
          category,
          description: description || undefined,
        })

        setMessage("Document uploaded successfully")
        setMessageType("success")
        setSelectedFile(null)
        setCategory("")
        setDescription("")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        toast({
          title: "Upload Successful",
          description: `${selectedFile.name} has been added to the knowledge base.`,
        })

        onUploadSuccess?.()
      } else {
        const errorData = await response.json().catch(() => ({}))
        setMessage(errorData.detail || "Upload failed")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setMessage("Network error. Please check if the backend server is running.")
      setMessageType("error")
    }

    setIsUploading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload Documents</span>
        </CardTitle>
        <CardDescription>Add new documents to the knowledge base</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert variant={messageType === "error" ? "destructive" : "default"}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
          <p className="text-sm text-muted-foreground">Supports PDF, DOC, DOCX, TXT files</p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
          />
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-accent" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={removeFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the document..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <Button onClick={handleUpload} disabled={!selectedFile || !category || isUploading} className="w-full">
          {isUploading ? "Uploading..." : "Upload Document"}
        </Button>
      </CardContent>
    </Card>
  )
}

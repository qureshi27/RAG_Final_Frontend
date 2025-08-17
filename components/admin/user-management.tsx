"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  role: "admin" | "user"
  createdAt: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      email: "admin@uol.edu.pk",
      role: "admin",
      createdAt: "2024-01-01",
    },
  ])
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user")
  const [isAdding, setIsAdding] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const { toast } = useToast()

  const handleAddUser = async () => {
    if (!newUserEmail) {
      setMessage("Please enter an email address")
      setMessageType("error")
      return
    }

    if (!newUserPassword) {
      setMessage("Please enter a password")
      setMessageType("error")
      return
    }

    if (newUserPassword.length < 6) {
      setMessage("Password must be at least 6 characters long")
      setMessageType("error")
      return
    }

    if (users.some((user) => user.email === newUserEmail)) {
      setMessage("User with this email already exists")
      setMessageType("error")
      return
    }

    setIsAdding(true)

    try {
      const formData = new FormData()
      formData.append("email", newUserEmail)
      formData.append("password", newUserPassword)

      const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: newUserEmail,
          password: newUserPassword,
        }),
      })

      if (response.ok) {
        const newUser: User = {
          id: Date.now().toString(),
          email: newUserEmail,
          role: newUserRole,
          createdAt: new Date().toISOString().split("T")[0],
        }

        setUsers([...users, newUser])
        setNewUserEmail("")
        setNewUserPassword("")
        setNewUserRole("user")
        setMessage("User created successfully")
        setMessageType("success")

        toast({
          title: "Success",
          description: `User ${newUserEmail} has been created with role: ${newUserRole}`,
        })
      } else {
        const errorData = await response.text()
        setMessage(`Failed to create user: ${errorData}`)
        setMessageType("error")
      }
    } catch (error) {
      setMessage("Failed to create user. Please check your connection.")
      setMessageType("error")
      console.error("Error creating user:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((user) => user.id === userId)
    if (userToDelete?.email === "admin@uol.edu.pk") {
      setMessage("Cannot delete the main admin user")
      setMessageType("error")
      return
    }

    setUsers(users.filter((user) => user.id !== userId))
    setMessage("User deleted successfully")
    setMessageType("success")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>User Management</span>
        </CardTitle>
        <CardDescription>Manage users and their roles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <Alert variant={messageType === "error" ? "destructive" : "default"}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Add New User */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-medium flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add New User</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUserRole} onValueChange={(value: "admin" | "user") => setNewUserRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleAddUser} disabled={isAdding} className="w-full">
                {isAdding ? "Creating..." : "Create User"}
              </Button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div>
          <h3 className="font-medium mb-4">Existing Users ({users.length})</h3>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.email === "admin@uol.edu.pk"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

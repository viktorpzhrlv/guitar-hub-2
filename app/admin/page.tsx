"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import AdminLayout from "@/components/layout/admin-layout"
import type { UserRole } from "@/lib/firebase/auth"

interface UserData {
  id: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  role: UserRole
  createdAt: any
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)

        const userData: UserData[] = []
        querySnapshot.forEach((doc) => {
          userData.push({
            id: doc.id,
            ...doc.data(),
          } as UserData)
        })

        setUsers(userData)
      } catch (error) {
        console.error("Грешка при извличане на потребители:", error)
        toast({
          title: "Грешка",
          description: "Неуспешно зареждане на потребители",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, { role: newRole })

      // Актуализиране на локалното състояние
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

      toast({
        title: "Ролята е актуализирана",
        description: "Ролята на потребителя беше актуализирана успешно",
      })
    } catch (error) {
      console.error("Грешка при актуализиране на ролята:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно актуализиране на ролята на потребителя",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Потребители</h1>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Търсене на потребители..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Име</TableHead>
              <TableHead>Имейл</TableHead>
              <TableHead>Роля</TableHead>
              <TableHead>Създаден на</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Зареждане на потребители...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Не са намерени потребители
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.displayName || "N/A"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Изберете роля" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Потребител</SelectItem>
                        <SelectItem value="admin">Администратор</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {user.createdAt?.toDate ? new Date(user.createdAt.toDate()).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Вижте детайли
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  )
}

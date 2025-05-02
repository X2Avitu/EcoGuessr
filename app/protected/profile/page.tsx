"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Edit, Trash2, Plus, ArrowRight, XCircle } from "lucide-react"
import Link from "next/link"
import { getProfile } from "@/app/actions"

// Types
interface Location {
  lat: number
  lng: number
}

interface Attendee {
  id: string
  name: string
  joinedAt: string
  avatar: string
}

interface Party {
  id: string
  name: string
  description: string
  location: Location
  attendees: number
  attendeeList: Attendee[]
  creatorId: string
  creatorName: string
  color: string
  createdAt: string
  status: "active" | "cancelled" | "completed"
  category: string
}

interface User {
  id: string
  name: string
  email: string
  avatar: string
  createdParties: string[]
  joinedParties: string[]
}

// Mock user data - in a real app, this would come from your authentication system
console.log(getProfile())

const mockUser: User = {
  id: "user-1",
  name: "Alex Johnson",
  email: "alex@example.com",
  avatar: "",
  createdParties: ["party-1", "party-3"],
  joinedParties: ["party-2", "party-4"],
}

// Mock party data - in a real app, this would come from your API
const mockParties: Party[] = [
  {
    id: "party-1",
    name: "Beach Bonfire",
    description: "Join us for a fun beach bonfire with music and snacks!",
    location: { lat: 40.7128, lng: -74.006 },
    attendees: 12,
    attendeeList: [
      {
        id: "user-2",
        name: "Jamie Smith",
        joinedAt: "2023-04-15T14:30:00Z",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "user-3",
        name: "Taylor Brown",
        joinedAt: "2023-04-15T15:45:00Z",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "user-4",
        name: "Jordan Lee",
        joinedAt: "2023-04-15T16:20:00Z",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
    creatorId: "user-1",
    creatorName: "Alex Johnson",
    color: "#f43f5e",
    createdAt: "2023-04-15T10:30:00Z",
    status: "active",
    category: "Social",
  },
  {
    id: "party-2",
    name: "Downtown Art Walk",
    description: "Explore local galleries and street art in the downtown area.",
    location: { lat: 40.7228, lng: -73.996 },
    attendees: 8,
    attendeeList: [
      {
        id: "user-5",
        name: "Casey Wilson",
        joinedAt: "2023-04-16T09:30:00Z",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "user-1",
        name: "Alex Johnson",
        joinedAt: "2023-04-16T10:15:00Z",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
    creatorId: "user-5",
    creatorName: "Casey Wilson",
    color: "#8b5cf6",
    createdAt: "2023-04-16T08:00:00Z",
    status: "active",
    category: "Art",
  },
  {
    id: "party-3",
    name: "Rooftop Yoga",
    description: "Morning yoga session with amazing city views. All levels welcome!",
    location: { lat: 40.7328, lng: -73.986 },
    attendees: 5,
    attendeeList: [
      {
        id: "user-6",
        name: "Riley Green",
        joinedAt: "2023-04-17T07:10:00Z",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "user-7",
        name: "Morgan Taylor",
        joinedAt: "2023-04-17T07:15:00Z",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
    creatorId: "user-1",
    creatorName: "Alex Johnson",
    color: "#10b981",
    createdAt: "2023-04-17T06:00:00Z",
    status: "completed",
    category: "Fitness",
  },
  {
    id: "party-4",
    name: "Tech Meetup",
    description: "Networking event for developers and tech enthusiasts.",
    location: { lat: 40.7428, lng: -74.016 },
    attendees: 15,
    attendeeList: [
      {
        id: "user-8",
        name: "Sam Davis",
        joinedAt: "2023-04-18T17:30:00Z",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "user-1",
        name: "Alex Johnson",
        joinedAt: "2023-04-18T17:45:00Z",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "user-9",
        name: "Quinn Miller",
        joinedAt: "2023-04-18T18:00:00Z",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
    creatorId: "user-8",
    creatorName: "Sam Davis",
    color: "#3b82f6",
    createdAt: "2023-04-18T16:00:00Z",
    status: "active",
    category: "Technology",
  },
]

export default function Dashboard() {
  const [user, setUser] = useState<User>(mockUser)
  const [parties, setParties] = useState<Party[]>(mockParties)
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // In a real app, you would fetch user data and parties from your API
  useEffect(() => {
    // Fetch user data
    // const fetchUser = async () => {
    //   const response = await fetch('/api/user');
    //   const userData = await response.json();
    //   setUser(userData);
    // }
    // Fetch parties
    // const fetchParties = async () => {
    //   const response = await fetch('/api/parties');
    //   const partiesData = await response.json();
    //   setParties(partiesData);
    // }
    // fetchUser();
    // fetchParties();
  }, [])

  const createdParties = parties.filter((party) => user.createdParties?.includes(party.id))
  const joinedParties = parties.filter(
    (party) => user.joinedParties?.includes(party.id) && !user.createdParties?.includes(party.id),
  )

  const openPartyDetail = (party: Party) => {
    setSelectedParty(party)
    setIsDetailModalOpen(true)
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}'s Dashboard</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Link href="/map">
          <Button>
            <MapPin className="mr-2 h-4 w-4" />
            Back to Map
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="created" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="created">My Parties ({createdParties.length})</TabsTrigger>
          <TabsTrigger value="joined">Joined Parties ({joinedParties.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="created">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/app" className="block h-full">
              <Card className="border-dashed h-full flex flex-col justify-center items-center cursor-pointer hover:border-primary transition-colors">
                <CardContent className="pt-6 text-center">
                  <div className="rounded-full bg-primary/10 p-6 mx-auto mb-4 w-fit">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mb-2">Create New Party</CardTitle>
                  <CardDescription>Plan a new event and invite people to join</CardDescription>
                </CardContent>
              </Card>
            </Link>

            {createdParties.map((party) => (
              <Card key={party.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{party.name}</CardTitle>
                      <CardDescription className="mt-1">{party.description}</CardDescription>
                    </div>
                    <div className="flex-shrink-0">{getStatusBadge(party.status)}</div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(party.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Users className="h-4 w-4" />
                    <span>{party.attendees} attendees</span>
                  </div>

                  <div className="flex -space-x-2 mb-4">
                    {party.attendeeList?.slice(0, 5).map((attendee, i) => (
                      <Avatar key={attendee.id} className="border-2 border-background">
                        <AvatarImage src={attendee.avatar || "/placeholder.svg"} alt={attendee.name} />
                        <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {party.attendees > 5 && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-medium">
                        +{party.attendees - 5}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openPartyDetail(party)}>
                      Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {createdParties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You haven't created any parties yet.</p>
              <Link href="/app">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Party
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="joined">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedParties.map((party) => (
              <Card key={party.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{party.name}</CardTitle>
                      <CardDescription className="mt-1">Created by {party.creatorName}</CardDescription>
                    </div>
                    <div className="flex-shrink-0">{getStatusBadge(party.status)}</div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(party.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Users className="h-4 w-4" />
                    <span>{party.attendees} attendees</span>
                  </div>

                  <div className="flex -space-x-2 mb-4">
                    {party.attendeeList?.slice(0, 5).map((attendee) => (
                      <Avatar key={attendee.id} className="border-2 border-background">
                        <AvatarImage src={attendee.avatar || "/placeholder.svg"} alt={attendee.name} />
                        <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {party.attendees > 5 && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-medium">
                        +{party.attendees - 5}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openPartyDetail(party)}>
                      View Details
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <XCircle className="h-4 w-4 mr-1" />
                      Leave Party
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {joinedParties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You haven't joined any parties yet.</p>
              <Link href="/app">
                <Button>
                  <MapPin className="mr-2 h-4 w-4" />
                  Explore Parties
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Party Detail Modal would be imported and used here */}
      {/* For frontend-only implementation, we'll just show a placeholder */}
      {isDetailModalOpen && selectedParty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{selectedParty.name}</h2>
            <p className="mb-4">{selectedParty.description}</p>
            <div className="flex justify-end">
              <Button onClick={() => setIsDetailModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

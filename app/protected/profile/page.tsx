"use client"

import { useState, useEffect, Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Edit, Trash2, Plus, ArrowRight, XCircle } from "lucide-react"
import Link from "next/link"
import { getAttendeesList, getGoogleAccountInfo, getJoinedParties, getPartiesCreatedByUser, getProfile, getProfileById } from "@/app/actions"

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
const mockUser: User = {
  id: "",
  name: "",
  email: "",
  avatar: "",
  createdParties: [],
  joinedParties: [],
}

function DashboardContent() {
  const [user, setUser] = useState<User>(mockUser)
  const [parties, setParties] = useState<Party[]>([])
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [googleProfileImage, setGoogleProfileImage] = useState<string | null>(null)
  const [googleName, setGoogleName] = useState<string | null>(null)
  const [partyAttendeeAvatars, setPartyAttendeeAvatars] = useState<Record<string, { id: string; avatar: string; name: string }[]>>({});
  const [joinedPartiesData, setJoinedPartiesData] = useState<any[]>([]);

  useEffect(() => {
    console.log(getJoinedParties())
  }
, [])

  useEffect(() => {
    getProfile().then(profile => {
      if (profile && profile.email) {
        setUser({
          id: profile.id,
          name: profile.display_name || "No Name",
          email: profile.email,
          avatar: profile.public_profile_image || "",
          createdParties: [],
          joinedParties: [],
        });
      }
    });
    getGoogleAccountInfo().then(info => {
      if (info) {
        if (info.profile_image) setGoogleProfileImage(info.profile_image);
        if (info.full_identity?.identity_data?.full_name) setGoogleName(info.full_identity.identity_data.full_name);
      }
    });
  }, []);
  useEffect(() => {
    getJoinedParties().then(data => {
      if (Array.isArray(data)) {
        setJoinedPartiesData(data);
      }
    }).catch(err => console.error("Error fetching joined parties:", err));
  }, []);
  useEffect(() => {
    getPartiesCreatedByUser().then(data => {
      if (Array.isArray(data)) {
        setParties(
          data.map((party: any) => ({
            id: party.id,
            name: party.name,
            description: party.description,
            location: { lat: party.lat, lng: party.lng },
            attendees: party.attendees,
            attendeeList: [],
            creatorId: party.user,
            creatorName: user.name,
            color: party.color,
            createdAt: party.createdAt,
            status: "active",
            category: "General",
          }))
        )
      }
    })
  }, [user.name])

  useEffect(() => {
    // For each party, fetch its attendees
    parties.forEach(party => {
      getAttendeesList(party.id).then(async (attendees: string[]) => {
        const profiles = await Promise.all(
          attendees.map(async (id) => {
            try {
              const profile = await getProfileById(id);
              return {
                id,
                avatar: profile?.public_profile_image || "/placeholder.svg",
                name: profile?.display_name || "User",
              };
            } catch (error) {
              console.error("Error fetching profile:", error);
              return { id, avatar: "/placeholder.svg", name: "User" };
            }
          })
        );
        
        setPartyAttendeeAvatars(prev => ({
          ...prev,
          [party.id]: profiles
        }));
      }).catch(err => console.error("Error fetching attendees:", err));
    });
  }, [parties]);

  const createdParties = parties
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

  // Prefer Google name if user.name is "No Name"
  const displayName = (user.name === "No Name" && googleName) ? googleName : user.name

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={googleProfileImage || user.avatar || "/placeholder.svg"} alt={displayName} />
            <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{displayName}'s Dashboard</h1>
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
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {/* <span>{party.attendees || 0} attendees</span> */}
                      <span>{0}</span>

                    </div>
                    
                    <div className="flex -space-x-2">
                      {partyAttendeeAvatars[party.id]?.slice(0, 5).map((attendee, index) => (
                        <Avatar key={index} className="border-2 border-background h-8 w-8">
                          <AvatarImage src={attendee.avatar || "/placeholder.svg"} alt={attendee.name || "Attendee"} />
                          <AvatarFallback>{(attendee.name && attendee.name.charAt(0)) || "?"}</AvatarFallback>
                        </Avatar>
                      ))}
                      {partyAttendeeAvatars[party.id]?.length > 5 && (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium border-2 border-background">
                          +{partyAttendeeAvatars[party.id].length - 5}
                        </div>
                      )}
                    </div>
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
    {joinedPartiesData.map((party) => (
      <Card key={party.id} className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{party.name}</CardTitle>
              <CardDescription className="mt-1">
                Created by {party.creator_name || "Unknown"}
              </CardDescription>
            </div>
            <div className="flex-shrink-0">{getStatusBadge(party.status || "active")}</div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-3 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(party.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>
                {party.location || (party.lat && party.lng 
                  ? `${party.lat.toFixed(4)}, ${party.lng.toFixed(4)}` 
                  : "No location")}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{party.attendees || 0} attendees</span>
            </div>
            
            <div>
              <p className="font-medium mt-2">Creator ID:</p>
              <code className="text-xs bg-muted p-1 rounded">{party.user || party.creator_id}</code>
            </div>
          </div>

          <div className="flex -space-x-2 mb-4">
            {partyAttendeeAvatars[party.id]?.slice(0, 5).map((attendee, index) => (
              <Avatar key={index} className="border-2 border-background h-6 w-6">
                <AvatarImage src={attendee.avatar || "/placeholder.svg"} alt={attendee.name || "Attendee"} />
                <AvatarFallback>{(attendee.name && attendee.name.charAt(0)) || "?"}</AvatarFallback>
              </Avatar>
            ))}
            {partyAttendeeAvatars[party.id]?.length > 5 && (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium border-2 border-background">
                +{partyAttendeeAvatars[party.id].length - 5}
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

  {joinedPartiesData.length === 0 && (
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

      {/* Party Detail Modal */}
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

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div
          className="p-8 text-center rounded-lg border border-gray-200 bg-gray-100 text-gray-500 shadow-md max-w-md mx-auto mt-16"
          style={{ minHeight: 120 }}
        >
          Loading profile...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
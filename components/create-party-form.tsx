"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { Party } from "../types/party"
import { MapPin } from "lucide-react"
import { createParty } from "@/app/actions" // Assuming you have a function to create the party in your database
interface CreatePartyFormProps {
  addParty: (party: Party) => void
  userLocation: { lat: number; lng: number } | null
  defaultLocation?: boolean
}

export function CreatePartyForm({ addParty, userLocation, defaultLocation = false }: CreatePartyFormProps) {
  const [useCurrentLocation, setUseCurrentLocation] = useState(true)
  const [customLocation, setCustomLocation] = useState({ lat: 0, lng: 0 })

 
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      customLat: "",
      customLng: "",
    },
  })

  const onSubmit = async (data: any) => {
    if (!userLocation && useCurrentLocation) return

    const location = useCurrentLocation
      ? userLocation!
      : { lat: Number.parseFloat(data.customLat), lng: Number.parseFloat(data.customLng) }

    const serverParty = await createParty({
      name: data.name,
      description: data.description,
      lat: location.lat,
      lng: location.lng,
    })

    addParty(serverParty)
    reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Party</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Party Name</Label>
            <Input
              id="name"
              placeholder="Beach Bonfire"
              {...register("name", { required: "Party name is required" })}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Join us for a fun beach bonfire with music and snacks!"
              {...register("description", { required: "Description is required" })}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant={useCurrentLocation ? "default" : "outline"}
                className="flex-1"
                onClick={() => setUseCurrentLocation(true)}
              >
                <MapPin className="mr-2 h-4 w-4" />
                {defaultLocation ? "Default Location" : "Current Location"}
              </Button>
              <Button
                type="button"
                variant={!useCurrentLocation ? "default" : "outline"}
                className="flex-1"
                onClick={() => setUseCurrentLocation(false)}
              >
                Custom Location
              </Button>
            </div>
            {defaultLocation && useCurrentLocation && (
              <p className="text-xs text-muted-foreground mt-1">
                Using New York City as the default location. Enter custom coordinates for a different location.
              </p>
            )}
          </div>

          {!useCurrentLocation && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customLat">Latitude</Label>
                <Input
                  id="customLat"
                  placeholder="40.7128"
                  {...register("customLat", {
                    required: !useCurrentLocation ? "Latitude is required" : false,
                    pattern: {
                      value: /^-?\d+(\.\d+)?$/,
                      message: "Please enter a valid number",
                    },
                  })}
                />
                {errors.customLat && <p className="text-sm text-red-500">{errors.customLat.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customLng">Longitude</Label>
                <Input
                  id="customLng"
                  placeholder="-74.0060"
                  {...register("customLng", {
                    required: !useCurrentLocation ? "Longitude is required" : false,
                    pattern: {
                      value: /^-?\d+(\.\d+)?$/,
                      message: "Please enter a valid number",
                    },
                  })}
                />
                {errors.customLng && <p className="text-sm text-red-500">{errors.customLng.message as string}</p>}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full">
            Create Party
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

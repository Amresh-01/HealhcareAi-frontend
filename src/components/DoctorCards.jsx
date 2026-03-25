import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Star,
  MapPin,
  Calendar,
  Clock,
  Video,
  Search,
  Heart,
  Shield,
  Award,
  CheckCircle,
} from "lucide-react"

// cn helper
const cn = (...classes) => classes.filter(Boolean).join(" ")

const doctors = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialization: "General Practitioner",
    rating: 4.9,
    reviews: 324,
    experience: 15,
    location: "Medical Center",
    nextAvailable: "Today, 2:30 PM",
    isVerified: true,
    acceptsInsurance: true,
    languages: ["English", "Spanish"],
    consultationFee: 150,
    videoConsultation: true,
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialization: "Cardiologist",
    rating: 4.8,
    reviews: 256,
    experience: 20,
    location: "Heart Clinic",
    nextAvailable: "Tomorrow, 10:00 AM",
    isVerified: true,
    acceptsInsurance: true,
    languages: ["English"],
    consultationFee: 200,
    videoConsultation: true,
  },
]

export function DoctorCards() {
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState([])

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4" />
            <Input
              placeholder="Search doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Doctors */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="p-4">
            <div className="flex gap-4">

              <Avatar className="h-14 w-14">
                <AvatarImage src={doctor.image} />
                <AvatarFallback>
                  {doctor.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{doctor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {doctor.specialization}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(doctor.id)}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        favorites.includes(doctor.id) && "text-red-500"
                      )}
                    />
                  </Button>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>{doctor.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({doctor.reviews})
                  </span>
                </div>

                {/* Info */}
                <div className="mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {doctor.location}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    {doctor.nextAvailable}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {doctor.acceptsInsurance && (
                    <Badge>Insurance</Badge>
                  )}
                  {doctor.videoConsultation && (
                    <Badge variant="outline">Video</Badge>
                  )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold">
                    ${doctor.consultationFee}
                  </span>

                  <Button size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book
                  </Button>
                </div>

              </div>
            </div>
          </Card>
        ))}
      </div>

    </div>
  )
}
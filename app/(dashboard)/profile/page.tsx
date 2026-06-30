"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [position, setPosition] = useState("");

  const handleSaveProfile = () => {
    alert("Profile updated successfully!");
  };

  const handleChangePassword = () => {
    alert("Password change functionality coming soon!");
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Profile"
        description="Manage your account information and preferences"
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-lg font-semibold">{name || "User"}</h3>
              <p className="text-sm text-muted-foreground">{session?.user?.role || "User"}</p>
            </div>
            <Button variant="outline" className="w-full">
              Upload New Photo
            </Button>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <div className="md:col-span-2">
          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList>
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          className="pl-10"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          className="pl-10"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          className="pl-10"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="position"
                        className="pl-10"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="Job Title"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and authentication methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="Enter current password" />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="Enter new password" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                  <Button onClick={handleChangePassword}>Update Password</Button>

                  <div className="border-t pt-4 mt-6">
                    <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Secure your account with 2FA
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>User Preferences</CardTitle>
                  <CardDescription>
                    Customize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Input defaultValue="English" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input defaultValue="UTC-5 (Eastern Time)" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Input defaultValue="MM/DD/YYYY" disabled />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Additional preference options coming soon!
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

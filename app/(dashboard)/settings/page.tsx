"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("CoreGrid Inc.");
  const [companyEmail, setCompanyEmail] = useState("contact@coregrid.com");
  const [ollamaUrl, setOllamaUrl] = useState(process.env.NEXT_PUBLIC_OLLAMA_API_URL || "http://localhost:11434");
  const [modelName, setModelName] = useState(process.env.NEXT_PUBLIC_OLLAMA_MODEL || "llama3.2:latest");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);

  const handleSaveGeneral = () => {
    alert("General settings saved!");
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      // Test Ollama connection with actual API call
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: 'Hello',
          stream: false
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`✓ Connection successful! Model: ${modelName}\nResponse: ${data.response?.substring(0, 100)}...`);
      } else {
        const error = await response.text();
        alert(`✗ Connection failed: ${response.status} ${response.statusText}\n${error}`);
      }
    } catch (error) {
      alert(`✗ Connection failed: ${error instanceof Error ? error.message : String(error)}\n\nMake sure Ollama is running and the model "${modelName}" is installed.`);
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Settings"
        description="Configure system preferences and integrations"
      />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI Configuration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Manage your organization's basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input 
                  id="company-name" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-email">Contact Email</Label>
                <Input 
                  id="company-email" 
                  type="email" 
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveGeneral}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>
                Configure local LLM settings (Ollama)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ollama-url">Ollama API URL</Label>
                <Input
                  id="ollama-url"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model Name</Label>
                <Input 
                  id="model" 
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="llama3.2:latest"
                />
              </div>
              <Button onClick={handleTestConnection} disabled={testingConnection}>
                {testingConnection ? "Testing..." : "Test Connection"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch 
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline">Enable 2FA</Button>
              </div>
              <div className="space-y-2">
                <Label>Change Password</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Update your account password
                </p>
                <Button variant="outline">Change Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

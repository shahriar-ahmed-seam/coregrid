"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  FileQuestion, 
  BookOpen, 
  Video,
  Clock,
  CheckCircle,
  Send
} from "lucide-react";
import { toast } from "sonner";

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success("Support ticket submitted successfully! We'll respond within 24 hours.");
    setFormData({ name: "", email: "", category: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support Center</h1>
        <p className="text-muted-foreground">Get help with CoreGrid - we're here to assist you</p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold mb-2">Documentation</h3>
            <p className="text-sm text-muted-foreground">
              Browse our comprehensive guides and tutorials
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <FileQuestion className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold mb-2">FAQs</h3>
            <p className="text-sm text-muted-foreground">
              Find answers to frequently asked questions
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
              <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">Video Tutorials</h3>
            <p className="text-sm text-muted-foreground">
              Watch step-by-step video guides
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Submit a Support Ticket
              </CardTitle>
              <CardDescription>
                Fill out the form below and our support team will get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="security">Security Concern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your issue or question in detail..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">support@coregrid.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Hours</p>
                  <p className="text-sm text-muted-foreground">Mon - Fri: 9AM - 6PM PST</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Times</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Critical Issues</p>
                  <p className="text-sm text-muted-foreground">Within 2 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">High Priority</p>
                  <p className="text-sm text-muted-foreground">Within 4 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Normal</p>
                  <p className="text-sm text-muted-foreground">Within 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Low Priority</p>
                  <p className="text-sm text-muted-foreground">Within 48 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                For critical system outages affecting your business operations, 
                contact our emergency hotline:
              </p>
              <p className="font-bold text-lg">+1 (555) 911-GRID</p>
              <p className="text-xs text-muted-foreground mt-2">
                Available 24/7 for Enterprise customers
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

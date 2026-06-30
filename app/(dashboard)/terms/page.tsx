import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Scale, Shield, AlertTriangle, Ban, CreditCard, RefreshCw } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground">Please read these terms carefully before using CoreGrid</p>
      </div>

      <div className="mb-8">
        <p className="text-sm text-muted-foreground">
          Last updated: January 26, 2026
        </p>
      </div>

      <div className="space-y-8">
        {/* Agreement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              By accessing or using CoreGrid's enterprise resource planning platform ("Service"), 
              you agree to be bound by these Terms of Service ("Terms"). If you disagree with any 
              part of these terms, you may not access the Service.
            </p>
            <p>
              These Terms apply to all visitors, users, and others who access or use the Service, 
              including administrators, employees, and authorized third parties.
            </p>
          </CardContent>
        </Card>

        {/* Use of Service */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Use of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">License Grant</h4>
              <p>
                Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, 
                and revocable license to use the Service for your internal business purposes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Account Responsibilities</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>You must be at least 18 years old to use this Service</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must provide accurate and complete registration information</li>
                <li>You are responsible for all activities under your account</li>
                <li>You must notify us immediately of any unauthorized access</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Prohibited Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-primary" />
              Prohibited Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Use the Service for any unlawful purpose or in violation of any laws</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Transmit viruses, malware, or other harmful code</li>
              <li>Reverse engineer, decompile, or attempt to extract source code</li>
              <li>Sell, resell, or commercially exploit the Service without authorization</li>
              <li>Use the Service to store or transmit infringing or illegal content</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Collect or harvest user data without consent</li>
            </ul>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Subscription Fees</h4>
              <p>
                Some features of the Service require payment of subscription fees. You agree to 
                pay all applicable fees as described on our pricing page at the time of purchase.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Billing</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Fees are billed in advance on a monthly or annual basis</li>
                <li>All fees are non-refundable unless otherwise stated</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
                <li>Failure to pay may result in suspension or termination of service</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Our Property</h4>
              <p>
                The Service and its original content, features, and functionality are owned by 
                CoreGrid and are protected by international copyright, trademark, patent, trade 
                secret, and other intellectual property laws.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Your Content</h4>
              <p>
                You retain ownership of all data and content you upload to the Service. By using 
                the Service, you grant us a limited license to host, store, and process your content 
                solely for the purpose of providing the Service to you.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We may terminate or suspend your account and access to the Service immediately, 
              without prior notice or liability, for any reason, including breach of these Terms.
            </p>
            <p>
              Upon termination, your right to use the Service will immediately cease. You may 
              request a copy of your data within 30 days of termination.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. 
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, COREGRID DISCLAIMS ALL WARRANTIES, EXPRESS 
              OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
              AND NON-INFRINGEMENT.
            </p>
            <p>
              IN NO EVENT SHALL COREGRID BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
              CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
            <p>
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU FOR THE SERVICE IN THE 
              TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We reserve the right to modify or replace these Terms at any time. We will provide 
              notice of material changes by posting the updated Terms on this page and updating 
              the "Last updated" date.
            </p>
            <p>
              Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>For questions about these Terms, please contact us at:</p>
            <div className="mt-2">
              <p><strong>Email:</strong> legal@coregrid.com</p>
              <p><strong>Address:</strong> 123 Tech Street, San Francisco, CA 94102</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

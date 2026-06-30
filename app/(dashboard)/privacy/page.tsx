import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, Database, UserCheck, Globe } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground">How we collect, use, and protect your data</p>
      </div>

      <div className="mb-8">
        <p className="text-sm text-muted-foreground">
          Last updated: January 26, 2026
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              CoreGrid ("we", "our", or "us") is committed to protecting your privacy. This Privacy 
              Policy explains how we collect, use, disclose, and safeguard your information when you 
              use our enterprise resource planning platform and related services.
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree with the terms of this 
              privacy policy, please do not access the platform.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Personal Information</h4>
              <p className="text-muted-foreground">
                We may collect personal information that you voluntarily provide when registering 
                for an account, including:
              </p>
              <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                <li>Name and email address</li>
                <li>Phone number and address</li>
                <li>Company name and job title</li>
                <li>Payment information (processed by secure third-party providers)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Business Data</h4>
              <p className="text-muted-foreground">
                When using our platform, you may input business-related data including employee 
                records, customer information, inventory data, financial records, and project details.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Automatically Collected Information</h4>
              <p className="text-muted-foreground">
                We automatically collect certain information when you visit our platform, including 
                IP address, browser type, device information, and usage patterns.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send administrative information, updates, and security alerts</li>
              <li>Respond to customer service requests and support needs</li>
              <li>Personalize user experience and deliver relevant content</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Detect and prevent fraudulent or unauthorized access</li>
              <li>Comply with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We implement appropriate technical and organizational security measures to protect 
              your personal information, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>End-to-end encryption for data in transit and at rest</li>
              <li>Regular security audits and penetration testing</li>
              <li>Role-based access controls and authentication</li>
              <li>Secure cloud infrastructure with redundancy and backups</li>
              <li>Employee training on data protection practices</li>
            </ul>
            <p className="text-muted-foreground">
              However, no method of transmission over the Internet or electronic storage is 100% 
              secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Objection:</strong> Object to certain processing of your data</li>
              <li><strong>Restriction:</strong> Request limitation of processing</li>
            </ul>
            <p className="text-muted-foreground">
              To exercise any of these rights, please contact us at privacy@coregrid.com.
            </p>
          </CardContent>
        </Card>

        {/* International Data Transfers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              International Data Transfers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your information may be transferred to and maintained on servers located outside your 
              country of residence. We ensure appropriate safeguards are in place to protect your 
              data in accordance with this privacy policy and applicable laws.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If you have questions or concerns about this Privacy Policy, please contact us:
            </p>
            <div className="text-muted-foreground">
              <p><strong>Email:</strong> privacy@coregrid.com</p>
              <p><strong>Address:</strong> 123 Tech Street, San Francisco, CA 94102</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

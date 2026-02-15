import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CheckCircle,
  FileText,
  Heart,
  Mail,
  MapPin,
  Scale,
  Shield,
  Users,
  Video,
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export default function TermsConditions() {
  return (
    <>
      <Head>
        <title>Terms and Conditions | TrickBook</title>
        <link rel="icon" href="/favicon.png" />
        <meta
          name="description"
          content="TrickBook Terms and Conditions - Fair, transparent terms that respect your rights as a user."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://thetrickbook.com/terms-conditions" />
      </Head>
      <Header />

      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 mb-4">
              <FileText className="h-8 w-8 text-yellow-500" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Terms and Conditions</h1>
            <p className="text-muted-foreground">Last updated: January 21, 2025</p>
          </div>

          {/* Welcome Banner */}
          <Card className="border-yellow-500/50 bg-yellow-500/5 mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Welcome to TrickBook</h2>
              <p className="text-muted-foreground mb-4">
                TrickBook is a community platform built by skaters, for skaters. These terms are
                written to be fair, transparent, and actually readable (no lawyer-speak). By using
                TrickBook, you agree to these terms. If you don't agree, please don't use our
                service.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">The short version:</strong> Be respectful,
                create awesome content, don't be a jerk, and we'll all have a great time.
              </p>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Section 1 - Account */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-yellow-500" />
                  1. Your Account
                </h2>

                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Account Creation</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• You must be at least 13 years old to use TrickBook</li>
                      <li>• You must provide accurate information when creating your account</li>
                      <li>
                        • You are responsible for maintaining the security of your account and
                        password
                      </li>
                      <li>• One person, one account - no duplicate or fake accounts</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Account Security</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Use a strong, unique password for your TrickBook account</li>
                      <li>• Never share your login credentials with anyone</li>
                      <li>
                        • Notify us immediately if you suspect unauthorized access to your account
                      </li>
                      <li>• You are responsible for all activity that occurs under your account</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Account Termination</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• You can delete your account at any time from your settings</li>
                      <li>• We may suspend or terminate accounts that violate these terms</li>
                      <li>• Upon deletion, your data will be permanently removed within 30 days</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2 - Content */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Video className="h-5 w-5 text-yellow-500" />
                  2. Content & Intellectual Property
                </h2>

                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Your Content</h3>
                    <p className="text-sm mb-2">
                      You retain ownership of all content you create and post on TrickBook,
                      including:
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li>• Feed posts, photos, and videos</li>
                      <li>• Comments and replies</li>
                      <li>• Direct messages</li>
                      <li>• Spot submissions and descriptions</li>
                      <li>• Profile information and bio</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <h3 className="font-semibold text-foreground mb-2">License Grant</h3>
                    <p className="text-sm">
                      By posting content on TrickBook, you grant us a non-exclusive, royalty-free
                      license to display, distribute, and promote your content within the TrickBook
                      platform. This license exists solely to operate the service (showing your
                      posts to other users, etc.).
                      <strong className="text-foreground">
                        {' '}
                        We will never sell your content or use it for advertising.
                      </strong>
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">TrickBook Content</h3>
                    <p className="text-sm">
                      The TrickBook name, logo, and original content (Trickipedia entries, The Couch
                      videos, interface design) are owned by TrickBook. You may not copy, modify, or
                      distribute our proprietary content without permission.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3 - Community Features */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-yellow-500" />
                  3. Community Features
                </h2>

                <div className="space-y-4 text-muted-foreground">
                  <div className="border-l-2 border-yellow-500 pl-4">
                    <h3 className="font-semibold text-foreground">Feed & Posts</h3>
                    <p className="text-sm mt-1">
                      Share your skating journey with photos, videos, and updates. Posts can be
                      liked and commented on by other users. You control who sees your content
                      through your privacy settings.
                    </p>
                  </div>

                  <div className="border-l-2 border-yellow-500 pl-4">
                    <h3 className="font-semibold text-foreground">Comments</h3>
                    <p className="text-sm mt-1">
                      Engage with other skaters by commenting on posts. Comments should be
                      constructive and respectful. You can delete your own comments at any time.
                      Post authors can also remove comments from their posts.
                    </p>
                  </div>

                  <div className="border-l-2 border-yellow-500 pl-4">
                    <h3 className="font-semibold text-foreground">Direct Messaging</h3>
                    <p className="text-sm mt-1">
                      Send private messages to your homies (friends on TrickBook). Messages are
                      private between you and the recipient. You can only message users who are your
                      homies - this prevents spam and unwanted contact.
                    </p>
                  </div>

                  <div className="border-l-2 border-yellow-500 pl-4">
                    <h3 className="font-semibold text-foreground">Homies (Friends)</h3>
                    <p className="text-sm mt-1">
                      Connect with other skaters by becoming homies. Send and accept homie requests
                      to build your skating network. You can remove homies at any time from your
                      settings.
                    </p>
                  </div>

                  <div className="border-l-2 border-yellow-500 pl-4">
                    <h3 className="font-semibold text-foreground">Progress Tracking</h3>
                    <p className="text-sm mt-1">
                      Track your trick progress across skateboarding and snowboarding. Your progress
                      data is private by default. Share achievements when you're ready.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4 - Spots */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-yellow-500" />
                  4. Skate Spots
                </h2>

                <div className="space-y-4 text-muted-foreground">
                  <p className="text-sm">
                    TrickBook features a community-driven database of skate spots. When submitting
                    or using spot information:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-foreground">Accuracy:</strong> Provide accurate
                        location and description information
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-foreground">Respect:</strong> Don't submit private
                        property without owner permission
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-foreground">Safety:</strong> Note any safety hazards
                        or access restrictions
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-foreground">Updates:</strong> Report spots that are
                        closed, demolished, or changed
                      </span>
                    </li>
                  </ul>

                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm">
                      <strong className="text-foreground">Disclaimer:</strong> TrickBook provides
                      spot information as a community resource. We do not guarantee accuracy,
                      safety, or legal access to any spot. Always skate responsibly, respect
                      property, and follow local laws. Skate at your own risk.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5 - The Couch */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Video className="h-5 w-5 text-yellow-500" />
                  5. The Couch (Video Content)
                </h2>

                <div className="space-y-4 text-muted-foreground">
                  <p className="text-sm">
                    The Couch is TrickBook's curated video section featuring skating content. When
                    viewing or interacting with The Couch:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>• Videos are provided for entertainment and educational purposes</li>
                    <li>
                      • Do not attempt dangerous tricks without proper training and safety equipment
                    </li>
                    <li>• Video content is owned by TrickBook or licensed from creators</li>
                    <li>
                      • You may not download, redistribute, or re-upload videos without permission
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Section 6 - Trickipedia */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-yellow-500" />
                  6. Trickipedia
                </h2>

                <div className="space-y-4 text-muted-foreground">
                  <p className="text-sm">
                    Trickipedia is our comprehensive trick database for skateboarding and
                    snowboarding. This educational resource includes:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>• Trick names, descriptions, and difficulty ratings</li>
                    <li>• Step-by-step instructions and tips</li>
                    <li>• Images and video demonstrations</li>
                    <li>• Related tricks and progressions</li>
                  </ul>
                  <p className="text-sm">
                    Trickipedia content is provided for educational purposes. Always practice tricks
                    safely, wear appropriate protective gear, and progress at your own pace.
                    TrickBook is not responsible for injuries resulting from attempting tricks.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 7 - Prohibited Content */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Ban className="h-5 w-5 text-red-500" />
                  7. Prohibited Content & Behavior
                </h2>

                <div className="space-y-4 text-muted-foreground">
                  <p className="text-sm">
                    To keep TrickBook a positive community, the following content and behavior are
                    prohibited:
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <h3 className="font-semibold text-foreground mb-2">Prohibited Content</h3>
                      <ul className="text-sm space-y-1">
                        <li>• Harassment, bullying, or hate speech</li>
                        <li>• Explicit sexual content or nudity</li>
                        <li>• Graphic violence or gore</li>
                        <li>• Content promoting illegal activities</li>
                        <li>• Spam, scams, or misleading content</li>
                        <li>• Copyrighted content you don't own</li>
                        <li>• Content that endangers minors</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <h3 className="font-semibold text-foreground mb-2">Prohibited Behavior</h3>
                      <ul className="text-sm space-y-1">
                        <li>• Creating fake or impersonation accounts</li>
                        <li>• Harassing or stalking other users</li>
                        <li>• Attempting to hack or exploit the platform</li>
                        <li>• Automated posting or botting</li>
                        <li>• Selling accounts or engagement</li>
                        <li>• Doxxing or sharing others' private info</li>
                        <li>• Circumventing bans or suspensions</li>
                      </ul>
                    </div>
                  </div>

                  <p className="text-sm">
                    Violations may result in content removal, account suspension, or permanent ban.
                    Severe violations may be reported to law enforcement.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 8 - Safety */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-500" />
                  8. Safety & Liability
                </h2>

                <div className="space-y-4 text-muted-foreground">
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <h3 className="font-semibold text-foreground mb-2">Assumption of Risk</h3>
                    <p className="text-sm">
                      Skateboarding and snowboarding are inherently dangerous activities. By using
                      TrickBook, you acknowledge that you participate in these activities at your
                      own risk. TrickBook is not responsible for any injuries, damages, or losses
                      that occur while skating or snowboarding, whether or not influenced by content
                      on our platform.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Safety Recommendations</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Always wear appropriate safety gear (helmet, pads, etc.)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Progress gradually - master basics before attempting advanced tricks
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Skate within your ability level</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Inspect spots for hazards before skating</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Respect private property and local laws</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 9 - Disclaimers */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  9. Disclaimers
                </h2>

                <div className="space-y-4 text-muted-foreground text-sm">
                  <p>
                    <strong className="text-foreground">Service Availability:</strong> TrickBook is
                    provided "as is" without warranties of any kind. We strive for 99.9% uptime but
                    cannot guarantee uninterrupted service. We reserve the right to modify or
                    discontinue features at any time.
                  </p>

                  <p>
                    <strong className="text-foreground">User Content:</strong> We do not pre-screen
                    user content. While we moderate for violations, we are not responsible for
                    content posted by users. If you encounter inappropriate content, please report
                    it.
                  </p>

                  <p>
                    <strong className="text-foreground">Third-Party Links:</strong> TrickBook may
                    contain links to external websites. We are not responsible for the content,
                    privacy practices, or availability of third-party sites.
                  </p>

                  <p>
                    <strong className="text-foreground">Accuracy:</strong> While we strive for
                    accuracy in Trickipedia and spot information, we cannot guarantee that all
                    information is current or error-free. Use your judgment and verify information
                    independently.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 10 - Limitation of Liability */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-yellow-500" />
                  10. Limitation of Liability
                </h2>

                <div className="space-y-4 text-muted-foreground text-sm">
                  <p>
                    To the maximum extent permitted by law, TrickBook and its owners, employees, and
                    affiliates shall not be liable for any indirect, incidental, special,
                    consequential, or punitive damages, including but not limited to:
                  </p>
                  <ul className="space-y-1">
                    <li>• Personal injury or property damage</li>
                    <li>• Loss of profits, data, or goodwill</li>
                    <li>• Service interruption or data loss</li>
                    <li>• Unauthorized access to your account</li>
                    <li>• Any damages arising from your use of the service</li>
                  </ul>
                  <p>
                    Our total liability for any claims related to the service shall not exceed the
                    amount you paid us in the past 12 months (if any).
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 11 - Governing Law */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  11. Governing Law & Disputes
                </h2>

                <div className="space-y-4 text-muted-foreground text-sm">
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of
                    the United States. Any disputes arising from these terms or your use of
                    TrickBook shall be resolved through binding arbitration, except where prohibited
                    by law.
                  </p>
                  <p>
                    Before initiating any legal action, you agree to first contact us and attempt to
                    resolve the dispute informally. We're skaters - we'd rather talk it out.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 12 - Changes */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  12. Changes to These Terms
                </h2>

                <div className="space-y-4 text-muted-foreground text-sm">
                  <p>
                    We may update these Terms from time to time. When we make significant changes,
                    we will:
                  </p>
                  <ul className="space-y-1">
                    <li>• Update the "Last updated" date at the top of this page</li>
                    <li>• Post a notice on the app/website</li>
                    <li>• Send you an email notification for major changes</li>
                  </ul>
                  <p>
                    Your continued use of TrickBook after changes take effect constitutes acceptance
                    of the new terms. If you disagree with any changes, please stop using the
                    service and delete your account.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 13 - Contact */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-yellow-500" />
                  13. Contact Us
                </h2>

                <div className="space-y-4 text-muted-foreground">
                  <p className="text-sm">Questions about these terms? We're happy to help.</p>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong className="text-foreground">Email:</strong>{' '}
                      <a
                        href="mailto:admin@thetrickbook.com"
                        className="text-yellow-500 hover:text-yellow-400"
                      >
                        admin@thetrickbook.com
                      </a>
                    </p>
                    <p>
                      <strong className="text-foreground">Website:</strong>{' '}
                      <a
                        href="https://thetrickbook.com"
                        className="text-yellow-500 hover:text-yellow-400"
                      >
                        thetrickbook.com
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Links */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Related Documents</h2>
                <div className="flex flex-wrap gap-4">
                  <Link href="/privacy-policy">
                    <Button variant="outline" className="gap-2">
                      <Shield className="h-4 w-4" />
                      Privacy Policy
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Back Button */}
          <div className="mt-8 flex justify-center">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

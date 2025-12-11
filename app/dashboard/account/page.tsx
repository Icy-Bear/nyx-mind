"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BadgeCheck,
  Camera,
  Mail,
  Trash2,
  User,
  Smartphone,
} from "lucide-react";
import {
  IconBrandWindows,
  IconBrandApple,
  IconBrandAndroid,
  IconBrandChrome,
  IconBrandFirefox,
  IconBrandSafari,
  IconBrandEdge,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconWorld,
  IconBrandOpera,
} from "@tabler/icons-react";
import { deleteUser, useSession, listSessions, revokeSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

const parseUserAgent = (userAgent: string) => {
  if (!userAgent) return { browser: "Unknown", os: "Unknown", type: "Unknown" };

  let browser = "Unknown";
  let os = "Unknown";
  let type = "Desktop";

  // Browser
  if (/edg/i.test(userAgent)) browser = "Edge";
  else if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent))
    browser = "Chrome";
  else if (/firefox/i.test(userAgent)) browser = "Firefox";
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent))
    browser = "Safari";
  else if (/opera|opr/i.test(userAgent)) browser = "Opera";

  // OS
  if (/windows/i.test(userAgent)) os = "Windows";
  else if (/mac/i.test(userAgent) && !/iphone|ipad|ipod/i.test(userAgent))
    os = "macOS";
  else if (/linux/i.test(userAgent) && !/android/i.test(userAgent)) os = "Linux";
  else if (/android/i.test(userAgent)) {
    os = "Android";
    type = "Mobile";
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = "iOS";
    type = "Mobile";
  }

  return { browser, os, type };
};

const getBrowserIcon = (browser: string) => {
  switch (browser) {
    case "Chrome":
      return IconBrandChrome;
    case "Firefox":
      return IconBrandFirefox;
    case "Safari":
      return IconBrandSafari;
    case "Edge":
      return IconBrandEdge;
    case "Opera":
      return IconBrandOpera;
    default:
      return IconWorld;
  }
};

const getOSIcon = (os: string) => {
  switch (os) {
    case "Windows":
      return IconBrandWindows;
    case "macOS":
      return IconBrandApple;
    case "iOS":
      return IconBrandApple;
    case "Android":
      return IconBrandAndroid;
    default:
      return IconDeviceDesktop;
  }
};

export default function AccountPage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { isPending, data } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    bio: "Full-stack developer passionate about building great user experiences.",
  });

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoadingSessions(true);
      try {
        const res = await listSessions();
        setSessions(res.data || []);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setIsLoadingSessions(false);
      }
    };
    fetchSessions();
  }, []);

  const handleRevokeSession = async (token: string) => {
    try {
      await revokeSession({ token });
      const res = await listSessions();
      setSessions(res.data || []);
    } catch (error) {
      console.error("Failed to revoke session:", error);
    }
  };

  // Update profile data when session data is available
  useEffect(() => {
    if (data?.user) {
      const nameParts = data.user.name?.split(" ") || [];
      setProfileData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || " ",
        email: data.user.email || "",
        username: data.user.email?.split("@")[0] || "",
        bio: "Full-stack developer passionate about building great user experiences.",
      });
    }
  }, [data]);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;

    setIsDeleting(true);
    try {
      await deleteUser();
      // After successful deletion, redirect to goodbye page
      window.location.href = "/goodbye";
    } catch (error) {
      console.error("Failed to delete account:", error);
      setIsDeleting(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-2 ">
        <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mb-6">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">
            <User className="h-4 w-4 sm:mr-2 hidden sm:inline" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="devices"
            className="text-xs sm:text-sm hidden lg:flex"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Devices
          </TabsTrigger>
          {data?.user.role === "admin" && (
            <TabsTrigger
              value="danger"
              className="text-xs sm:text-sm text-red-600 flex"
            >
              <Trash2 className="h-4 w-4 sm:mr-2 sm:inline" />
              Danger
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <CardTitle>Profile Information</CardTitle>
                  </div>
                  <Button
                    variant={isEditingProfile ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    {isEditingProfile ? "Cancel" : "Edit"}
                  </Button>
                </div>
                <CardDescription>
                  {isEditingProfile
                    ? "Update your personal information and profile picture"
                    : "View your personal information and profile picture"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                    <AvatarImage src={data?.user.image || ""} alt="Profile" />
                    <AvatarFallback className="text-lg sm:text-xl">
                      {profileData.firstName[0]?.toUpperCase() || "U"}
                      {profileData.lastName[0]?.toUpperCase() || "N"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                      disabled={!isEditingProfile}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Profile Information */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      {isEditingProfile ? (
                        <Input
                          id="firstName"
                          // value={data?.user.name.split(" ")[0]}
                          value={"hello"}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              firstName: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <div className="p-2 border rounded-md bg-muted/30">
                          {profileData.firstName}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      {isEditingProfile ? (
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              lastName: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <div className="p-2 border rounded-md bg-muted/30">
                          {profileData.lastName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    {isEditingProfile ? (
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/30 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {profileData.email}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    {isEditingProfile ? (
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            username: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/30 flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />@
                        {profileData.username}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    {isEditingProfile ? (
                      <Input
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            bio: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/30 min-h-[40px]">
                        {profileData.bio || "No bio added yet"}
                      </div>
                    )}
                  </div>
                </div>

                {isEditingProfile && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Account Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Member Since
                  </span>
                  <Badge variant="secondary">
                    {data?.user.createdAt
                      ? new Date(data.user.createdAt).toLocaleDateString(
                        "en-US",
                        { month: "short", year: "numeric" }
                      )
                      : "Unknown"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Account Type
                  </span>
                  <Badge
                    variant={
                      data?.user.role === "admin" ? "default" : "secondary"
                    }
                  >
                    {data?.user.role || "User"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Email Verified
                  </span>
                  {data?.user.emailVerified ? (
                    <BadgeCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    2FA Enabled
                  </span>
                  <Badge variant="outline">No</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Connected Devices
              </CardTitle>
              <CardDescription>
                Manage devices that have access to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSessions ? (
                <div className="flex justify-center p-4">
                  <Spinner />
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => {
                    const isCurrent = session.token === data?.session?.token;
                    const { browser, os, type } = parseUserAgent(
                      session.userAgent || ""
                    );
                    const BrowserIcon = getBrowserIcon(browser);
                    const OSIcon = getOSIcon(os);

                    return (
                      <div
                        key={session.token}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`relative p-2 rounded-full ${isCurrent ? "bg-green-100" : "bg-blue-100"
                              }`}
                          >
                            <BrowserIcon
                              className={`h-6 w-6 ${isCurrent ? "text-green-600" : "text-blue-600"
                                }`}
                            />
                            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                              <OSIcon className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {browser} on {os}
                              </p>
                              {type === "Mobile" ? (
                                <IconDeviceMobile className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <IconDeviceDesktop className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.createdAt).toLocaleDateString()}
                              {session.ipAddress && ` • ${session.ipAddress}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isCurrent ? (
                            <Badge variant="secondary">Current</Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeSession(session.token)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {sessions.length === 0 && (
                    <p className="text-center text-muted-foreground">
                      No active sessions found.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {data?.user.role === "admin" && (
          <TabsContent value="danger" className="space-y-6">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="space-y-2">
                    <h3 className="font-medium text-red-900">Delete Account</h3>
                    <p className="text-sm text-red-700">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="mt-4">
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account and remove your data from our
                          servers.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="confirm-delete">
                            Type &quot;DELETE&quot; to confirm
                          </Label>
                          <Input
                            id="confirm-delete"
                            placeholder="DELETE"
                            value={deleteConfirmation}
                            onChange={(e) =>
                              setDeleteConfirmation(e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmation !== "DELETE" || isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete Account"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

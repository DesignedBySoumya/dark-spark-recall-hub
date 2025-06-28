
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

export const AuthPage = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Successfully signed in!');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Check your email to confirm your account!');
    }
    
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0E27]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E27] p-4">
      <Card className="w-full max-w-md bg-[#1C2541] border-[#2563EB]/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Welcome</CardTitle>
          <CardDescription className="text-[#93A5CF]">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#0A0E27]">
              <TabsTrigger value="signin" className="text-[#93A5CF] data-[state=active]:text-white">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-[#93A5CF] data-[state=active]:text-white">
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-[#93A5CF]">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    required
                    className="bg-[#0A0E27] border-[#2563EB]/30 text-white"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-[#93A5CF]">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    required
                    className="bg-[#0A0E27] border-[#2563EB]/30 text-white"
                    placeholder="••••••••"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#2563EB] hover:bg-[#1E3A8A]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-[#93A5CF]">Full Name</Label>
                  <Input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    className="bg-[#0A0E27] border-[#2563EB]/30 text-white"
                    placeholder="Your Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-[#93A5CF]">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    className="bg-[#0A0E27] border-[#2563EB]/30 text-white"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-[#93A5CF]">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                    className="bg-[#0A0E27] border-[#2563EB]/30 text-white"
                    placeholder="••••••••"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#2563EB] hover:bg-[#1E3A8A]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

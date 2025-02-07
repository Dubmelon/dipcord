
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "sonner";

export const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (value: string) => {
    setTheme(value as "light" | "dark" | "froggy");
    toast.success(`${value.charAt(0).toUpperCase() + value.slice(1)} theme activated`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Theme</Label>
          <RadioGroup
            defaultValue={theme}
            onValueChange={handleThemeChange}
            className="grid grid-cols-3 gap-4"
          >
            <Label
              htmlFor="light"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <RadioGroupItem value="light" id="light" className="sr-only" />
              <div className="w-8 h-8 rounded-full bg-[#FFFFFF] border"></div>
              <span className="mt-2">Light</span>
            </Label>
            <Label
              htmlFor="dark"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <RadioGroupItem value="dark" id="dark" className="sr-only" />
              <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border"></div>
              <span className="mt-2">Dark</span>
            </Label>
            <Label
              htmlFor="froggy"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <RadioGroupItem value="froggy" id="froggy" className="sr-only" />
              <div className="w-8 h-8 rounded-full bg-[#66CDAA] border"></div>
              <span className="mt-2">Froggy</span>
            </Label>
          </RadioGroup>
          <p className="text-sm text-muted-foreground mt-2">
            Choose your preferred theme appearance
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

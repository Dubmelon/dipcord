
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "sonner";

export const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (value: string) => {
    setTheme(value as any);
    toast.success(`${value.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')} theme activated`);
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
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            <Label
              htmlFor="light"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer card-hover"
            >
              <RadioGroupItem value="light" id="light" className="sr-only" />
              <div className="w-8 h-8 rounded-full bg-[#FFFFFF] border"></div>
              <span className="mt-2">Light</span>
            </Label>
            <Label
              htmlFor="dark"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer card-hover"
            >
              <RadioGroupItem value="dark" id="dark" className="sr-only" />
              <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border"></div>
              <span className="mt-2">Dark</span>
            </Label>
            <Label
              htmlFor="halloween"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer card-hover"
            >
              <RadioGroupItem value="halloween" id="halloween" className="sr-only" />
              <div className="w-8 h-8 rounded-full bg-[#FFA500] border"></div>
              <span className="mt-2">Halloween Light</span>
            </Label>
            <Label
              htmlFor="halloween-dark"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer card-hover"
            >
              <RadioGroupItem value="halloween-dark" id="halloween-dark" className="sr-only" />
              <div className="w-8 h-8 rounded-full bg-[#2D1600] border"></div>
              <span className="mt-2">Halloween Dark</span>
            </Label>
            <Label
              htmlFor="froggy"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer card-hover"
            >
              <RadioGroupItem value="froggy" id="froggy" className="sr-only" />
              <div className="w-8 h-8">
                <img 
                  src="/lovable-uploads/17a3d408-05f9-493e-a745-3b97f781d182.png" 
                  alt="Froggy theme" 
                  className="w-full h-full object-cover rounded-full border"
                />
              </div>
              <span className="mt-2">Froggy Light</span>
            </Label>
            <Label
              htmlFor="froggy-dark"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer card-hover"
            >
              <RadioGroupItem value="froggy-dark" id="froggy-dark" className="sr-only" />
              <div className="w-8 h-8 rounded-full bg-[#1A4D2E] border"></div>
              <span className="mt-2">Froggy Dark</span>
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

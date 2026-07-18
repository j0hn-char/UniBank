import { Sun, Moon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/context/ThemeContext"

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    return (
        <div className="flex items-center justify-center gap-2">
            <Sun className="size-4 text-muted-foreground" />
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            <Moon className="size-4 text-muted-foreground" />
        </div>
    )
}
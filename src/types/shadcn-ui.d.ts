declare module "@/components/ui/card" {
  export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
  export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
}

declare module "@/components/ui/button" {
  interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  }
  export const Button: React.FC<ButtonProps>;
}

// Add similar declarations for other shadcn/ui components 
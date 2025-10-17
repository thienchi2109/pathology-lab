# Component Library

This directory contains the Lab Sample Management System's component library, built with React, Next.js 15, and shadcn/ui with a custom pastel color theme.

## Directory Structure

```
components/
├── layout/          # Layout components (AppShell, Header, MobileNav)
├── forms/           # Form-related components (FormSheet)
├── ui/              # Base UI components (shadcn/ui + custom)
├── dashboard/       # Dashboard-specific widgets (to be added)
└── grid/            # Data grid components (to be added)
```

## Design System

### Color Palette (Pastel Theme)

- **Primary**: Soft Blue (#93C5FD) - Main actions, links
- **Secondary**: Lavender (#C4B5FD) - Secondary actions
- **Success**: Mint Green (#86EFAC) - Success states, positive metrics
- **Warning**: Peach (#FED7AA) - Warnings, pending states
- **Error**: Soft Rose (#FCA5A5) - Errors, destructive actions
- **Background**: Off-white (#FAFAFA) - Page background
- **Surface**: White (#FFFFFF) - Card backgrounds
- **Text Primary**: Charcoal (#1F2937) - Main text
- **Text Secondary**: Slate (#6B7280) - Secondary text

### Typography

- **Font Family**: Inter (sans-serif)
- **Font Sizes**:
  - Small: 14px
  - Body: 16px
  - H3: 20px
  - H2: 24px
  - H1: 32px
- **Font Weights**:
  - Body: 400
  - Heading: 600

### Spacing

- Base unit: 4px
- Component padding: 16px, 24px
- Section margins: 32px, 48px

### Border Radius

- Buttons: 8px
- Cards: 8px
- Modals: 12px

## Layout Components

### AppShell

Main application layout wrapper that includes header and mobile navigation.

```tsx
import { AppShell } from "@/components/layout";

export default function Page() {
  return (
    <AppShell>
      <h1>Your content here</h1>
    </AppShell>
  );
}
```

### Header

Sticky header with transparency and backdrop blur. Shows navigation for desktop (≥1024px).

- Height: 64px
- Background: rgba(255, 255, 255, 0.95) with backdrop-blur
- Role-based navigation items
- User menu with sign out

### MobileNav

Bottom navigation bar for mobile and tablet (<1024px).

- Height: 64px
- Fixed at bottom
- Touch-friendly targets (min 44x44px)
- Active state with pastel color highlight

## UI Components

### Button

```tsx
import { Button } from "@/components/ui/button";

<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Input & Textarea

```tsx
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter email" />
</div>

<div>
  <Label htmlFor="notes">Notes</Label>
  <Textarea id="notes" placeholder="Enter notes" />
</div>
```

### Select

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Badge

```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

### Sheet (Off-canvas Panel)

```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Title</SheetTitle>
      <SheetDescription>Description</SheetDescription>
    </SheetHeader>
    <div>Content here</div>
  </SheetContent>
</Sheet>
```

### Loading States

```tsx
import { LoadingSpinner, LoadingOverlay, LoadingCard, LoadingSkeleton } from "@/components/ui/loading";

// Spinner
<LoadingSpinner size="md" />

// Full-screen overlay
<LoadingOverlay message="Loading data..." />

// Card with spinner
<LoadingCard message="Loading..." />

// Skeleton placeholder
<LoadingSkeleton className="h-20 w-full" />
```

### Error States

```tsx
import { ErrorMessage, ErrorCard, ErrorBanner } from "@/components/ui/error";

// Inline error message
<ErrorMessage 
  title="Validation Error" 
  message="Please check your input" 
/>

// Error card with retry
<ErrorCard 
  title="Failed to load data"
  message="Unable to fetch records"
  onRetry={() => refetch()}
/>

// Dismissible banner
<ErrorBanner 
  message="Connection lost"
  onDismiss={() => setError(null)}
/>
```

### Toast Notifications

```tsx
import { useToast } from "@/components/ui/toast";

function MyComponent() {
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast({
      title: "Success",
      message: "Sample created successfully",
      variant: "success",
      duration: 5000
    });
  };

  return <button onClick={handleSuccess}>Create</button>;
}
```

## Form Components

### FormSheet

Reusable off-canvas sheet for forms that slides from the right.

```tsx
import { FormSheet } from "@/components/forms";

<FormSheet
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Create New Sample"
  description="Enter sample details below"
>
  <form>
    {/* Form fields here */}
  </form>
</FormSheet>
```

## Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px (bottom navigation)
- **Desktop**: ≥ 1024px (header navigation)

## Accessibility

- All interactive elements have minimum 44x44px touch targets
- Focus states with 2px pastel blue outline
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support

## Usage Guidelines

1. **Always use the AppShell** for consistent layout across pages
2. **Use pastel colors** from the theme for consistency
3. **Provide loading states** for async operations
4. **Show clear error messages** in Vietnamese when operations fail
5. **Make forms mobile-friendly** with appropriate input types and sizes
6. **Use FormSheet** for data entry forms that slide from the right
7. **Add toast notifications** for user feedback on actions

## Next Steps

Additional components to be added:
- Dashboard widgets (charts, metrics)
- Data grid components (TanStack Table)
- Image upload components
- Autocomplete components
- Date picker components

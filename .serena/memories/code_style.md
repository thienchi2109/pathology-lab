# Code Style and Conventions

## Naming Conventions

### Files
- **React components**: PascalCase (e.g., `SampleForm.tsx`, `ProtectedRoute.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`, `utils.ts`)
- **API routes**: kebab-case (e.g., `next-code.ts`, `lab-records.ts`)
- **Folders**: kebab-case (e.g., `sample-management/`, `lab-records/`)

### Database
- **Tables**: snake_case plural (e.g., `sample_results`, `kit_batches`)
- **Columns**: snake_case (e.g., `created_at`, `kit_type_id`)
- **Views**: prefix with `v_` (e.g., `v_lab_records`, `v_kq_chung`)
- **Functions**: snake_case (e.g., `next_sample_code()`)

### TypeScript
- **Interfaces**: PascalCase (e.g., `Sample`, `KitBatch`, `UserWithRole`)
- **Types**: PascalCase (e.g., `KitStatus`, `UserRole`)
- **Enums**: PascalCase with UPPER_CASE values
- **Variables**: camelCase (e.g., `sampleCode`, `kitType`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_IMAGES_PER_SAMPLE`)

## TypeScript Configuration
- **Strict mode enabled**: `strict: true` in tsconfig.json
- **No implicit any**: All types must be explicit
- **Path aliases**: Use `@/*` for imports from root (e.g., `@/lib/utils`)
- **Type safety**: Prefer interfaces over types for object shapes
- **Zod validation**: Use for all API request/response schemas

## React Patterns

### Component Structure
```typescript
// 1. Imports (grouped)
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import type { Sample } from '@/types';

// 2. Types/Interfaces
interface SampleFormProps {
  initialData?: Sample;
  onSubmit: (data: Sample) => void;
}

// 3. Component
export function SampleForm({ initialData, onSubmit }: SampleFormProps) {
  // Hooks first
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Event handlers
  const handleSubmit = async () => {
    // Implementation
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Import Order
```typescript
// 1. React/Next
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party
import { z } from 'zod';
import * as echarts from 'echarts';

// 3. Internal (absolute imports with @/)
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

// 4. Types (separate import)
import type { Sample, Kit } from '@/types';
```

### Hooks Usage
- Use custom hooks for reusable logic (e.g., `useAuth`, `useIsEditor`)
- Keep hooks at the top of components
- Follow React hooks rules (no conditional hooks)

## API Route Patterns

### Error Responses (Standardized)
```typescript
// 422: Validation error
return NextResponse.json({ 
  error: "Số lượng quá lớn" 
}, { status: 422 });

// 409: Business logic conflict
return NextResponse.json({ 
  error: "Không còn kit <type>" 
}, { status: 409 });

// 403: Forbidden (wrong role)
return NextResponse.json({ 
  error: "Bạn không có quyền thực hiện thao tác này" 
}, { status: 403 });

// 401: Unauthorized (no session)
return NextResponse.json({ 
  error: "Chưa đăng nhập" 
}, { status: 401 });
```

### Authentication Pattern
```typescript
import { requireEditor } from '@/lib/auth/roles';

export async function POST(request: Request) {
  // Always check auth first
  const user = await requireEditor();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // Business logic
  // ...
}
```

## Styling Conventions

### Tailwind CSS
- Use utility classes directly (no custom CSS unless necessary)
- Use pastel color palette from theme
- Use `cn()` helper for conditional classes
```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}>
```

### Component Styling
- Mobile-first approach
- Touch-friendly targets (min 44x44px)
- Generous whitespace
- Consistent border radius (lg: 12px, md: 8px, sm: 4px)

## Database Query Patterns

### Use Supabase Client
```typescript
// Good - Type-safe with Supabase
const { data, error } = await supabase
  .from('kits')
  .select('*')
  .eq('status', 'in_stock')
  .limit(100);

// Bad - Raw SQL (avoid unless necessary)
const query = `SELECT * FROM kits WHERE status='${userInput}'`;
```

### Always Use Transactions for Multi-Table Operations
```typescript
const { data, error } = await supabase.rpc('create_sample_with_kit', {
  sample_data: {...},
  kit_id: kitId
});
```

## Error Handling

### Try-Catch Pattern
```typescript
try {
  // DB operation
  const { data, error } = await supabase.from('samples').insert(sample);
  
  if (error) throw error;
  
  return NextResponse.json({ data });
} catch (err) {
  console.error('[API] Error:', err);
  
  // Audit log
  await supabase.from('audit_logs').insert({
    action: 'ERROR',
    entity: 'samples',
    diff: { error: String(err) }
  });
  
  return NextResponse.json({ 
    error: 'Internal error' 
  }, { status: 500 });
}
```

## Comments and Documentation

### When to Comment
- Complex business logic
- Non-obvious workarounds
- Important security considerations
- API endpoint documentation

### JSDoc for Functions
```typescript
/**
 * Generates the next sample code based on received date
 * Format: T<MM>_<#####> (e.g., T09_00042)
 * 
 * @param receivedAt - The date the sample was received
 * @returns The generated sample code
 */
export async function generateSampleCode(receivedAt: Date): Promise<string> {
  // Implementation
}
```

## Language
- **User-facing messages**: Vietnamese
- **Code**: English (variables, functions, comments)
- **Documentation**: English (technical docs), Vietnamese (user guides)

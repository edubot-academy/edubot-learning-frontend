# EduBot Dashboard Design System

## Overview
This document defines the standardized UI/UX patterns for all EduBot dashboards (Instructor, Student, Admin, etc.) to ensure consistency, accessibility, and optimal user experience across all platforms.

## Design Principles

### 1. Consistency
- Unified visual language across all dashboards
- Consistent spacing, typography, and color usage
- Standardized component behaviors and interactions

### 2. Accessibility
- WCAG 2.1 AA compliance
- Touch-friendly mobile interactions (44px minimum touch targets)
- Keyboard navigation support
- Screen reader compatibility

### 3. Responsive Design
- Mobile-first approach
- Adaptive layouts for different screen sizes
- Touch-optimized mobile navigation

### 4. Performance
- Smooth animations and transitions
- Optimized loading states
- Efficient data fetching patterns

## Color System

### Primary Colors
```css
--edubot-orange: #f17e22;
--edubot-soft: #f39647;
--edubot-dark: #122144;
--edubot-green: #0ea78b;
--edubot-teal: #1e605e;
```

### Semantic Colors
- **Success**: `--edubot-green`
- **Warning**: `--amber-500`
- **Error**: `--red-500`
- **Info**: `--blue-500`

### Neutral Colors
- **Background**: `white` / `gray-900` (dark mode)
- **Surface**: `gray-50` / `gray-800` (dark mode)
- **Border**: `gray-200` / `gray-700` (dark mode)
- **Text Primary**: `gray-900` / `gray-100` (dark mode)
- **Text Secondary**: `gray-600` / `gray-400` (dark mode)

## Typography

### Font Stack
```css
font-family: 'Inter', system-ui, sans-serif;
```

### Scale
- **Headline 1**: 32px, font-bold (page headers)
- **Headline 2**: 24px, font-bold (section headers)
- **Headline 3**: 20px, font-semibold (card titles)
- **Body Large**: 16px, font-medium (important text)
- **Body**: 14px, font-normal (default text)
- **Caption**: 12px, font-medium (metadata)

## Spacing System

### Scale (in rem)
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)

### Layout Containers
- **Page Padding**: `px-4 py-6` (mobile), `px-6 py-8` (desktop)
- **Section Spacing**: `space-y-6` (mobile), `space-y-8` (desktop)
- **Card Spacing**: `space-y-4`

## Component Patterns

### 1. Dashboard Layout
```jsx
<div className="min-h-screen pt-24 bg-gray-50 dark:bg-gray-900">
  <SkipNavigation />
  
  {/* Mobile Navigation */}
  <div className="md:hidden">
    <DashboardTabs />
  </div>
  
  {/* Desktop Layout */}
  <div className="hidden md:block mx-auto max-w-7xl px-6 pb-12">
    <div className="flex gap-6">
      <DashboardSidebar />
      <main className="flex-1">
        <DashboardHeader />
        <DashboardContent />
      </main>
    </div>
  </div>
  
  {/* Mobile Content */}
  <div className="mx-auto max-w-6xl px-4 pb-12 md:hidden">
    <DashboardHeader />
    <DashboardContent />
  </div>
</div>
```

### 2. Card Components

#### Base Card
```jsx
<div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
  {/* Content */}
</div>
```

#### Glass Card (Premium)
```jsx
<div className="relative">
  <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl transition-all duration-500" />
  <div className="relative p-6 z-10">
    {/* Content */}
  </div>
</div>
```

#### Stat Card
```jsx
<div className="group relative">
  <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl transition-all duration-500" />
  <div className="absolute inset-0 bg-gradient-to-br from-edubot-orange/5 via-transparent to-edubot-soft/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  
  <div className="relative p-6 z-10">
    <div className="w-10 h-10 bg-gradient-to-br from-edubot-orange/20 to-edubot-soft/10 rounded-xl mb-3 flex items-center justify-center">
      {/* Icon */}
    </div>
    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</p>
    <p className="text-3xl font-bold text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
      {value}
    </p>
  </div>
</div>
```

#### Action Card
```jsx
<div className="group relative">
  <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1" />
  
  <div className="relative p-6 z-10">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-edubot-orange transition-colors duration-300">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
    
    <ActionButton accent={accent}>
      {buttonText}
    </ActionButton>
  </div>
</div>
```

### 3. Button Patterns

#### Primary Button
```jsx
<button className="bg-gradient-to-r from-edubot-orange to-edubot-soft hover:from-edubot-soft hover:to-edubot-orange text-white rounded-xl px-6 py-3 text-sm font-medium transform transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 touch-manipulation min-h-[44px] min-w-[100px]">
  {children}
</button>
```

#### Secondary Button
```jsx
<button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-6 py-3 text-sm font-medium transform transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 touch-manipulation min-h-[44px] min-w-[100px]">
  {children}
</button>
```

#### Ghost Button
```jsx
<button className="text-edubot-orange hover:bg-edubot-orange/10 rounded-xl px-6 py-3 text-sm font-medium transform transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation min-h-[44px] min-w-[100px]">
  {children}
</button>
```

### 4. Navigation Patterns

#### Desktop Sidebar
```jsx
<nav className="w-64 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-4" role="navigation">
  <div className="space-y-2">
    {navItems.map((item) => (
      <button
        key={item.id}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 touch-manipulation min-h-[44px] ${
          isActive
            ? 'bg-edubot-orange text-white shadow-lg'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        role="menuitem"
      >
        <item.icon className="w-5 h-5" />
        <span className="font-medium">{item.label}</span>
      </button>
    ))}
  </div>
</nav>
```

#### Mobile Tab Bar
```jsx
<div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-[60]">
  <div className="flex justify-around items-center py-2">
    {visibleItems.map((item) => (
      <button
        key={item.id}
        className={`flex flex-col items-center justify-center p-2 rounded-lg touch-manipulation active:scale-95 min-h-[56px] min-w-[60px] transition-all duration-200 ${
          isActive
            ? 'bg-edubot-orange text-white'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        role="tab"
      >
        <span className="text-lg mb-1">{item.icon}</span>
        <span className="text-xs font-medium text-center">{item.label}</span>
      </button>
    ))}
  </div>
</div>
```

### 5. Header Patterns

#### Dashboard Header
```jsx
<div className="bg-gradient-to-r from-edubot-dark to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800 text-white">
  <div className="flex items-center justify-between flex-wrap gap-3">
    <div>
      <p className="text-sm uppercase tracking-wide text-edubot-orange font-medium">
        {roleLabel}
      </p>
      <h1 className="text-3xl font-bold text-white mt-1">
        {user.fullName || user.email}
      </h1>
      <p className="text-sm text-slate-300 mt-2">
        {subtitle}
      </p>
    </div>
    
    <div className="flex items-center gap-3">
      {headerActions}
    </div>
  </div>
</div>
```

### 6. Loading States

#### Skeleton Loading
```jsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
</div>
```

#### Card Loading
```jsx
<div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
  </div>
</div>
```

### 7. Form Patterns

#### Input Field
```jsx
<input
  type="text"
  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-edubot-orange focus:border-edubot-orange transition-all duration-200 touch-manipulation"
  placeholder={placeholder}
/>
```

#### Form Layout
```jsx
<div className="space-y-4">
  <div className="grid sm:grid-cols-2 gap-4">
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <InputField />
    </div>
  </div>
</div>
```

## Animation Guidelines

### Transitions
- **Duration**: 200ms (fast), 300ms (normal), 500ms (slow)
- **Easing**: `ease-out` for most interactions
- **Transform**: Use `scale`, `translate` for micro-interactions

### Hover Effects
- Buttons: `hover:scale-105`
- Cards: `hover:shadow-xl`, `hover:-translate-y-1`
- Links: `hover:text-edubot-orange`

### Loading Animations
- Spin: `animate-spin`
- Pulse: `animate-pulse`
- Bounce: `animate-bounce`

## Accessibility Guidelines

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Logical tab order
- Focus indicators on all interactive elements
- Skip navigation links

### Screen Reader Support
- Semantic HTML5 elements
- ARIA labels and descriptions
- Role attributes
- Alt text for images

### Touch Targets
- Minimum 44px × 44px touch targets
- Adequate spacing between touch targets
- Touch-friendly button sizes

## Responsive Breakpoints

```css
xs: 475px
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Mobile-First Approach
- Base styles for mobile (default)
- `sm:` for small tablets
- `md:` for tablets and small desktops
- `lg:` for desktops
- `xl:` for large desktops

## Dark Mode

### Implementation
- Use `dark:` prefix for dark mode styles
- Toggle dark mode class on HTML element
- Respect system preference by default

### Color Adaptations
- Backgrounds: `white` → `gray-900`
- Surfaces: `gray-50` → `gray-800`
- Text: `gray-900` → `gray-100`
- Borders: `gray-200` → `gray-700`

## Performance Guidelines

### Optimization
- Use CSS transforms for animations
- Minimize reflows and repaints
- Optimize images and assets
- Lazy load non-critical components

### Loading Strategy
- Show skeleton states immediately
- Load data progressively
- Implement optimistic updates
- Handle errors gracefully

## Implementation Checklist

### Before Development
- [ ] Review design system guidelines
- [ ] Choose appropriate component patterns
- [ ] Plan responsive layout
- [ ] Consider accessibility requirements

### During Development
- [ ] Use semantic HTML
- [ ] Implement proper ARIA attributes
- [ ] Add keyboard navigation
- [ ] Test touch interactions
- [ ] Implement loading states
- [ ] Add error handling

### After Development
- [ ] Test on multiple devices
- [ ] Verify accessibility compliance
- [ ] Check performance metrics
- [ ] Validate responsive behavior
- [ ] Test dark mode functionality

## Component Library

### Core Components
- `DashboardLayout`
- `DashboardHeader`
- `DashboardSidebar`
- `DashboardTabs`
- `StatCard`
- `ActionButton`
- `InputField`
- `LoadingState`
- `EmptyState`

### Specialized Components
- `AnalyticsCard`
- `ProgressCard`
- `NotificationCard`
- `UserCard`
- `CourseCard`
- `SessionCard`

This design system should be consistently applied across all dashboard implementations to ensure a cohesive and professional user experience.

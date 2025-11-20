# Harvest Hub Agricultural Management System - Design Guidelines

## Design Approach
**System-Based Approach** - Using principles from Material Design and Carbon Design System, optimized for agricultural data management and farmer accessibility. Focus on clarity, efficiency, and data visualization.

## Design Principles
1. **Agricultural Clarity**: Large touch targets, high contrast, readable fonts for outdoor/varied lighting conditions
2. **Data First**: Information hierarchy prioritizes actionable data and quick task completion
3. **Trustworthy & Professional**: Clean, organized layouts that inspire confidence in financial/production tracking
4. **Accessible Simplicity**: Minimize cognitive load for users with varying tech proficiency

## Typography
- **Primary Font**: Inter or Roboto (via Google Fonts CDN)
- **Heading Hierarchy**: 
  - H1: text-2xl font-semibold (Module titles)
  - H2: text-xl font-medium (Section headers)
  - H3: text-lg font-medium (Card/subsection titles)
- **Body**: text-base (forms, lists, content)
- **Small text**: text-sm (labels, metadata, timestamps)

## Layout System
**Tailwind Spacing Units**: Consistent use of 2, 4, 6, 8, 12, 16 units
- Container padding: p-6 or p-8
- Card spacing: p-6 internally, gap-6 between cards
- Section margins: mb-6 or mb-8
- Button padding: px-4 py-2 (standard), px-6 py-3 (primary CTAs)
- Grid gaps: gap-4 (tight layouts), gap-6 (card grids)

## Component Library

### Navigation
- **Top Navigation Bar**: Fixed, full-width with green-700 background
- **Dropdown Menus**: White background, soft shadows (shadow-lg), rounded-lg corners
- **Dropdown Items**: Hover state with light green background (green-50 or green-100)
- **Active Indicators**: Subtle underline or green-300 text for current page

### Cards & Containers
- **Standard Card**: White background, rounded-lg, shadow-md, border border-gray-200
- **Elevated Card**: shadow-lg for important or interactive cards
- **Section Containers**: Subtle background (gray-50) with white cards on top for depth

### Tabs (Milk Collection pattern)
- **Tab Container**: Flex layout with gap-3, mb-6
- **Tab Buttons**: Rounded, clear active/inactive states
- **Active Tab**: Darker green (green-700), slightly elevated (shadow-sm)
- **Inactive Tab**: Lighter green (green-600), hover transitions

### Forms & Data Entry
- **Form Layout**: Max-width containers (max-w-2xl) for readability
- **Input Fields**: 
  - Border: border-gray-300, focus:border-green-500, focus:ring-2 focus:ring-green-200
  - Padding: px-4 py-2
  - Rounded: rounded-md
  - Full width for mobile, appropriate widths for desktop
- **Labels**: text-sm font-medium text-gray-700, mb-2
- **Form Sections**: Group related fields with mb-6 spacing
- **Required Fields**: Asterisk indicator, clear error states (border-red-500, text-red-600)

### Buttons
- **Primary Action**: Green-700 background, white text, hover:green-800, px-6 py-3
- **Secondary Action**: Green-600 background, hover:green-700, px-4 py-2
- **Outline/Ghost**: Border-green-600, text-green-700, hover:bg-green-50
- **Destructive**: Red-600 background for delete actions

### Data Tables (Reports)
- **Table Container**: Overflow-x-auto for mobile scrolling, shadow-md, rounded-lg
- **Table Headers**: Background gray-100, font-semibold, text-left, px-4 py-3
- **Table Rows**: Border-b border-gray-200, px-4 py-3, hover:bg-gray-50
- **Alternating Rows**: Optional bg-gray-50 for better readability in long tables
- **Responsive**: Stack to cards on mobile (hidden table headers, card-style rows)

### Stats & Metrics
- **Stat Cards**: Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- **Stat Display**: Large number (text-3xl font-bold), label below (text-sm text-gray-600)
- **Trend Indicators**: Small icons/arrows with green (positive) or red (negative) coloring

### Dropdowns & Filters (Reports)
- **Filter Bar**: Flex layout, gap-4, mb-6, items-end alignment
- **Select Dropdowns**: Consistent with input styling, appropriate width
- **Date Pickers**: Standard input with calendar icon
- **Apply Filters Button**: Primary button style

## Responsive Behavior
- **Mobile First**: Single column layouts (grid-cols-1), full-width components
- **Tablet (md:)**: 2-column grids where appropriate
- **Desktop (lg:)**: 3-4 column grids for cards, multi-column forms
- **Navigation**: Hamburger menu consideration for mobile (if many modules added)

## Visual Hierarchy
1. **Page Title**: Prominent, top-left, mb-6 or mb-8
2. **Action Buttons**: Top-right or immediately below title
3. **Filters/Tabs**: Below title, above content area
4. **Content Area**: Main focus, adequate spacing from navigation elements
5. **Secondary Actions**: Bottom of cards or sections

## Animations
**Minimal & Purposeful**:
- Dropdown transitions: transition-all duration-200
- Button hovers: Subtle color shifts, no scale transforms
- Tab switches: Instant content swap, no fade animations
- Loading states: Simple spinners, no elaborate animations

## Images
**No Hero Images** - This is a utility application, not a marketing site.
**Icon Usage**: Heroicons via CDN for navigation, actions, and data visualization indicators.

## Milk Management Module Specifics

### Dropdown Navigation Structure
- Milk Collection → Tabs (Add Milk, Milk List, Stats)
- Milk Payout → Form interface for payment processing
- Milk Collection Reports → Filterable data table with date ranges, farmer filters
- Milk Payout Reports → Financial summary with totals, payment history table

### Module-Specific Patterns
- **Collection Forms**: Date, farmer selector, quantity, quality metrics
- **Payout Interface**: Farmer selection, period selection, calculated amounts, payment status
- **Reports**: Date range picker, export buttons, summary statistics at top, detailed table below
- **Data Visualization**: Simple bar charts or line graphs for trends (optional, using Chart.js if needed)
# UI Guidelines

These guidelines define the look, feel, and interaction principles for the TODO app. The goal is an interface that is **sleek, calm, and very easy to use**: a modern take on the Frutiger Aero aesthetic (glossy, airy, glassy, nature-inspired) combined with Apple-style clarity and restraint. Functional behavior is defined in [functional-requirements.md](functional-requirements.md).

## 1. Design Principles

1. **Clarity first**: every screen has one obvious primary action. Content comes before chrome.
2. **Deference**: the UI supports the user's tasks and never competes with them. Decoration is subtle.
3. **Depth with purpose**: layers, translucency, and shadows show hierarchy (what is on top, what is interactive), not just style.
4. **Consistency**: the same action looks and behaves the same everywhere.
5. **Forgiveness**: actions are reversible (undo), destructive actions are confirmed, errors explain how to recover.
6. **Delight in moderation**: small, smooth animations and gloss add polish but never slow the user down.

## 2. Visual Style: Modern Frutiger Aero

Frutiger Aero is characterized by glossy surfaces, soft gradients, translucent "glass" panels, bright natural colors, and a sense of light and openness. Use a **refined, modern** version: flatter and cleaner than the 2000s originals, with gloss as an accent.

- **Material components**: build the UI from Material-style components (cards, chips, app bar, floating action button, dialogs/sheets, text fields, segmented controls, snackbars), restyled with the Aero look below. Prefer a well-maintained component library (e.g. MUI) with a custom theme over hand-rolled components.
- **Glass surfaces**: cards, sheets, and the app bar use a translucent white background (`rgba(255,255,255,0.65-0.85)`) with `backdrop-filter: blur(12-20px)`, a 1px light border (`rgba(255,255,255,0.6)`), and a soft shadow.
- **Soft gradients**: page background uses a gentle sky-to-aqua gradient. Primary buttons use a subtle top-to-bottom gradient with a faint highlight along the top edge for a "glossy" feel.
- **Rounded shapes**: generous corner radii (see section 3). No sharp corners.
- **Light and space**: lots of whitespace, bright backgrounds, and light shadows. Avoid heavy borders and dense layouts.
- **Nature motifs (optional, subtle)**: soft bokeh circles, water-like or leaf-like shapes in the page background or empty states. Keep them low contrast and never behind text.
- **Iconography**: simple, rounded, outlined icons with a consistent stroke weight (Material Symbols Rounded or equivalent). Filled variants only for selected/active states.

## 3. Design Tokens

Define these as CSS custom properties (or the theme object) and use them everywhere. Never hard-code colors, radii, or spacing in components.

### Color palette

| Token | Value | Use |
|-------|-------|-----|
| `--color-primary` | `#1E9BE8` (sky blue); the implementation uses `#0F7AC4` for filled buttons and text so contrast meets WCAG AA, keeping `#1E9BE8` for gradients and highlights | Primary actions, active states, focus |
| `--color-primary-dark` | `#0B6FB8` | Pressed state, links on light backgrounds |
| `--color-secondary` | `#2EC4A6` (aqua green) | Secondary accents, success, "completed" |
| `--color-accent` | `#8BD450` (fresh leaf green) | Highlights, progress |
| `--color-warning` | `#FFB84D` | Due soon, medium priority |
| `--color-danger` | `#F0566A` | Overdue, delete, high priority |
| `--color-bg-top` / `--color-bg-bottom` | `#E8F6FF` / `#D6F5EC` | Page background gradient |
| `--color-surface` | `rgba(255,255,255,0.75)` | Glass cards and panels |
| `--color-text` | `#14324A` | Primary text (dark navy, not pure black) |
| `--color-text-muted` | `#4F6D85` | Secondary text |
| `--color-border` | `rgba(20,50,74,0.12)` | Dividers and outlines |

Task color options (see FR-5.x) use a soft, bright set that fits the palette: sky `#4FB3F6`, aqua `#3DD6B5`, leaf `#8BD450`, sun `#FFD24D`, coral `#FF8A65`, rose `#F0729A`, lilac `#A58BF0`, slate `#8DA2B5`.

### Dark mode

Provide a dark theme that keeps the Aero feel: deep navy-teal background gradient (`#0B1E2D` to `#0E2B33`), translucent dark glass surfaces, light text (`#E6F3FA`), and slightly brightened accent colors. Follow the system preference by default (FR-8.14).

### Typography

- Font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", sans-serif`.
- Scale: 12 / 14 / 16 (body) / 20 / 24 / 32 px. Use weight (400, 500, 600) rather than many sizes to create hierarchy.
- Body text is at least 16px; line height 1.4-1.6. Never use text below 12px.
- Sentence case for labels and buttons ("Add task", not "ADD TASK").

### Spacing, radius, elevation

- **Spacing**: 4px base unit (4, 8, 12, 16, 24, 32, 48).
- **Radius**: 8px (inputs, chips), 16px (cards), 24px (sheets/dialogs), full pill for buttons and chips.
- **Elevation**: three levels only: resting (`0 2px 8px rgba(20,50,74,0.08)`), raised (`0 6px 20px rgba(20,50,74,0.12)`), overlay (`0 16px 40px rgba(20,50,74,0.18)`).

## 4. Buttons and Accessibility of Controls

Buttons must be **easy to find, easy to reach, and easy to hit**.

- **Primary action always visible**: a floating action button (FAB) or persistent "Add task" control is anchored bottom-right (bottom-center on mobile) on every view. It never scrolls out of view.
- **Touch targets**: minimum 44x44px (Apple HIG) on every interactive element, with at least 8px spacing between adjacent targets.
- **Thumb-friendly on mobile**: primary controls (add task, view switcher, today) live in the bottom half of the screen. Avoid placing key actions in the top corners.
- **One primary button per screen or dialog**: use a filled gradient button for the primary action, a tonal/outlined button for secondary actions, and a text button for tertiary actions. Destructive actions use the danger color and are never the default.
- **Clear labels**: buttons use a verb ("Add task", "Save", "Delete"). Icon-only buttons need a tooltip and an `aria-label`.
- **Visible states**: every button has distinct default, hover, focus, pressed, and disabled states. Focus rings are always visible (2px `--color-primary` ring with 2px offset) and never removed.
- **Quick actions on tasks**: complete (checkbox), edit, and delete are reachable directly from each task row (swipe actions on touch, hover actions on desktop, always keyboard accessible).
- **Keyboard support**: everything is reachable by Tab in a logical order, Enter/Space activates controls, Escape closes dialogs and sheets. Keyboard shortcuts are listed in a help dialog (FR-8.10).

## 5. Views: Calendar and List

The user can switch between views with a single **segmented control** (List | Day | Calendar) placed at the top of the content area. The control is always visible and shows the active view clearly. The last choice is remembered (FR-6.8).

### List view

- Tasks are grouped under **sticky date headings** (Overdue, Today, Tomorrow, then dates such as "Mon, 12 Jan", then "No date").
- Each task row shows: completion checkbox, title, due date (friendly format), priority indicator, and a color accent bar on the left edge.
- Dates are always visible on each row (muted text), with overdue dates in the danger color.
- Row height is at least 56px. Completed tasks are dimmed with a strikethrough on the title and move below active tasks.
- Group headings show a task count and can be collapsed.

### Day view

- Shows a single day with previous/next arrows and a "Today" button, and the full date as a large heading.
- Swiping left/right on touch devices changes the day.

### Calendar view

- Monthly grid with previous/next month arrows and a "Today" button. Today is highlighted with a filled circle in `--color-primary`.
- Each day cell shows up to 3 tasks as small color-coded pills; extra tasks collapse into a "+N more" indicator.
- Tapping a day opens that day's tasks in a bottom sheet (mobile) or side panel (desktop) with a button to add a task for that date.
- Days outside the current month are muted. Weekends are subtly distinguished.
- Tasks can be dragged to another day in the Calendar view to reschedule (FR-8.13); the time of day is kept and an Undo is offered. Each row has a `Move <task>` handle that also works with the keyboard (Space to pick up, arrows to move, Space to drop, Esc to cancel).
- In the List view, active tasks can be dragged to reorder (FR-4.4). The first drag switches sorting to "Manual order" and shows an Undo that restores the previous sort. Completed tasks are not draggable.

## 6. Components

- **Task card/row**: glass surface, 16px radius, color accent on the left edge, subtle raise on hover. Priority is shown with an icon and label, never color alone.
- **Task form** (create/edit): opens in a dialog on desktop and a bottom sheet on mobile. Title field is focused automatically. Due date, priority, and color pickers are visible without extra navigation. The primary "Save" button is at the bottom right; Cancel is next to it.
- **Quick add bar**: a single input at the top of the list; pressing Enter adds the task and keeps focus for fast entry (FR-8.1).
- **Chips**: used for priority, tags, and filters. Selected chips are filled; unselected chips are outlined.
- **Color picker**: a row of round swatches (at least 32px visual, 44px target) with a checkmark on the selected one and a "no color" option.
- **Snackbars**: bottom-center, used for confirmations with an **Undo** action (FR-8.3). Auto-dismiss after about 5 seconds.
- **Dialogs**: used only when a decision is required (e.g. confirm delete). Keep them short with a clear title and two buttons.
- **Empty states**: friendly illustration or soft Aero-style graphic, one sentence of guidance, and a primary button ("Add your first task").

## 7. Motion and Feedback

- Use short, smooth transitions: 150-250ms, ease-out for entering and ease-in for leaving. Springy, natural motion for drag and drop.
- Animate meaningful changes only: task completion (checkmark draw plus fade), adding/removing items (slide and fade), view switching (cross-fade or slide).
- Provide immediate feedback for every action (pressed state, optimistic update). Show a skeleton or spinner if a request takes longer than about 300ms.
- Respect `prefers-reduced-motion`: replace movement with simple fades or no animation.

## 8. Layout and Responsiveness

- **Mobile first**, with breakpoints at 600px (tablet) and 1024px (desktop).
- **Mobile**: single column, bottom FAB, bottom sheets for forms and day details, bottom-aligned view switcher.
- **Tablet/desktop**: centered content column (max about 720px) for list view; calendar view uses the full width. Optional side panel for day details and filters.
- Respect safe areas (notches, home indicator) on mobile devices.
- Keep a clear, consistent hierarchy: app bar (title, search, theme toggle), then view switcher and filters, then content.

## 9. Accessibility

- Text contrast of at least 4.5:1 (3:1 for large text and UI components), including on glass surfaces. If translucency reduces contrast, increase the surface opacity.
- Never rely on color alone: pair color with icons, labels, or patterns (priority, overdue, task colors).
- Semantic HTML and ARIA roles for dialogs, tabs/segmented controls, calendar grid (`role="grid"`), and live regions for snackbars.
- All functionality is available via keyboard, with a logical focus order and focus returned to the trigger when a dialog closes.
- Support browser zoom to 200% and text scaling without loss of content or function.
- Provide meaningful `alt`/`aria-label` text for icons and images.

## 10. Content and Tone

- Short, friendly, and direct. Prefer "Task deleted. Undo" over technical or formal wording.
- Error messages say what happened and how to fix it ("Couldn't save your task. Check your connection and try again.").
- Use friendly dates ("Today", "Tomorrow") in the UI, and the full date in tooltips and the calendar.

## 11. Do and Don't

| Do | Don't |
|----|-------|
| Use tokens for color, spacing, radius, and elevation | Hard-code values in components |
| Keep one primary action per screen | Show several competing filled buttons |
| Use glass and gloss as subtle accents | Stack heavy gradients, shadows, and blur everywhere |
| Make touch targets at least 44px | Use small icon-only controls without padding |
| Offer undo for destructive actions | Rely only on "Are you sure?" dialogs |
| Pair color with icon or text | Use color as the only indicator |
| Respect system theme and reduced motion | Force a theme or unskippable animations |

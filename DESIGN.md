# Design Brief

## Purpose & Tone
Life-critical healthcare app. Clinical minimalism with purposeful warmth. Communicate trust, urgency, and human connection. Confident, calm, medical-grade clarity.

## Color Palette

| Semantic     | Light               | Dark                | Usage                                      |
| ------------ | ------------------- | ------------------- | ------------------------------------------ |
| Primary      | `0.55 0.24 25` (CR)  | `0.65 0.20 25` (CR)  | Action buttons, CTA, navigation            |
| Accent       | `0.65 0.15 142` (GN) | `0.72 0.16 142` (GN) | Available donor badge, positive states     |
| Destructive  | `0.58 0.22 25` (RD)  | `0.65 0.19 22` (RD)  | Unavailable donor badge, alerts            |
| Background   | `0.98 0 0` (WH)      | `0.12 0 0` (DK)      | Page background                            |
| Foreground   | `0.15 0 0` (DK)      | `0.95 0 0` (LT)      | Text body                                  |
| Card         | `1.0 0 0` (WH)       | `0.18 0 0` (DK2)     | Donor cards, content surfaces              |
| Muted        | `0.92 0 0` (LT-GY)   | `0.24 0 0` (MD-GY)   | Secondary text, disabled states            |
| Border       | `0.88 0 0` (MD-GY)   | `0.26 0 0` (MD-GY)   | Card borders, dividers                     |

**Legend**: CR=Crimson Red, GN=Green, RD=Red, WH=White, DK=Dark, LT=Light, GY=Grey

## Typography
- **Display**: General Sans (clean, geometric, medical-grade confidence)
- **Body**: DM Sans (highly readable, professional, small-size optimized)
- **Mono**: Geist Mono (blood type codes, donation timestamps)
- **Type Scale**: xl=3xl, lg=2xl, md=lg, base=base, sm=sm

## Structural Zones

| Zone       | Treatment                                   | Visual Intent                         |
| ---------- | ------------------------------------------- | ------------------------------------- |
| Header     | Crimson accent bar, white text, search box  | Clear wayfinding, prominent search    |
| Donor Card | White surface, border, green/red badge      | Signature detail: status badge first  |
| Badge      | 24–32px circle, high contrast ring-offset   | Unavoidable visual signal             |
| Footer     | Muted background, medical shop directory    | Secondary information, low hierarchy  |

## Spacing & Rhythm
- **Radii**: sm=4px, md=6px, lg=8px (tight, clinical feel)
- **Gaps**: 16px baseline, 8px micro, 24px macro
- **Density**: Compact card layout, tight line-height (1.4) for readability

## Component Patterns
- **Donor Card**: Status badge + avatar, name, address, blood type, distance, contact CTA
- **Status Badge**: Prominent 24–32px circle (green=available, red=unavailable) with subtle ring-offset for depth
- **Search Input**: Crimson ring on focus, white background, grey placeholder
- **Button**: Crimson primary, white text, 4px radius, no shadow (clinical)

## Motion & Transitions
- **Default**: 0.3s cubic-bezier(0.4, 0, 0.2, 1) for all interactive elements
- **Card Hover**: Subtle shadow lift (0 12px 24px -4px rgba)
- **No animation**: No entrance animations, no bounce — clinical restraint

## Anti-Patterns
- No playfulness, no rounded corners >12px, no gradients, no depth blur
- Single-color status badges (no gradient), medical clarity always

## Signature Detail
**Status Badge as Visual Language**: Every donor card is immediately framed by a large, prominent green (available) or red (unavailable) circle. This is the primary visual hierarchy. The badge is the first element the eye lands on — it answers "can I get blood from this person?" before any text is read.

## Differentiation
Clinical minimalism executed with precision. White + crimson + green/red creates an instantly recognizable medical interface. No generic tech aesthetics — every choice serves life-saving clarity.


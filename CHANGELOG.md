# Changelog

## [1.1.1] - 2026-05-19

### Added
- **IP restriction middleware**: Requests from public IP addresses are now blocked with a `403 Forbidden` response. Only private/local network ranges (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) and IPv6 local addresses (`::1`, `fe80::/10`, `fc00::/7`) are allowed.

## [1.1.0] - 2025-05-18

### Changed

#### UI Redesign
- **Layout**: Replaced compact terminal-style layout with a spacious, modern design featuring a prominent hero section and card-based components. Max width increased from 680px to 760px.
- **Color scheme**: Switched from flat black (`#111`) to a deep navy (`#0b0f1a`) with an indigo/purple accent color (`#6366f1`) for interactive elements.
- **Typography**: Replaced monospace-only fonts with **Inter** as the primary UI font for better readability. **JetBrains Mono** is now only used for code, URLs, and technical content.
- **Hero section**: Added a large header area with a globe icon, app title, and subtitle. Includes a subtle radial gradient glow effect.
- **Search bar**: Redesigned as a raised card with a full-width input field, focus glow ring, and a prominent "Fetch Icon" button with hover/active animations.
- **Example domains**: Restyled as rounded pill-shaped buttons instead of plain text links.
- **Favicon previews**: Enlarged icon thumbnails from 36x36px to 56x56px in bordered, rounded cards with hover effects.
- **Source badges**: Now displayed as colored labels with a green tinted background instead of plain text.
- **Endpoints section**: Redesigned with a proper card layout, labeled rows, and styled copy buttons with "Copied!" feedback animation.
- **Error messages**: Now shown in a red-tinted container with border instead of plain red text.
- **Loading state**: Added a spinning animation indicator while fetching icons.
- **Footer**: Centered with a subtle top border separator.
- **Responsive**: Improved mobile layout with stacked search input/button and adjusted grid for smaller screens.

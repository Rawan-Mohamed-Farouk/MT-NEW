# Utility Functions

## 📁 Files

### `accessibility.js`
Accessibility helper functions:
- `announceToScreenReader()` - Announce messages
- `trapFocus()` - Focus trap for modals
- `prefersReducedMotion()` - Check motion preference
- `smoothScrollTo()` - Smooth scroll with motion support
- `getAccessibleLabel()` - Generate accessible labels
- `formatErrorMessage()` - Format error messages

## 🔧 Usage

```javascript
import { announceToScreenReader, trapFocus } from '../utils/accessibility';

// Announce to screen readers
announceToScreenReader('Page loaded');

// Trap focus in modal
const cleanup = trapFocus(modalElement);
// Later: cleanup();
```

## ♿ Accessibility Features

- Screen reader announcements
- Focus management
- Motion preferences
- Accessible labels
- Error formatting


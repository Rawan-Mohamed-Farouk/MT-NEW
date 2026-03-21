# React Context

## 📁 Files

### `AuthContext.jsx`
Authentication context provider:
- User state management
- Login/logout functions
- Admin check function
- Persistent authentication
- LocalStorage integration

## 🔧 Usage

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAdmin } = useAuth();
  
  // Use user data
  // Call login/logout
  // Check admin status
}
```

## 📊 State

- `user` - Current user object
- `loading` - Loading state
- `login()` - Login function
- `logout()` - Logout function
- `isAdmin()` - Admin check function

## 🔄 Flow

1. User logs in
2. Token stored in localStorage
3. User data stored in context
4. Available to all components
5. Persists across page reloads


# TEDUCA - Guía de QA y Testing

## Verificación Pre-Despliegue

### Build Verification
```bash
pnpm build
# Expected: ✓ Compiled successfully
# Build time: ~10s
# Static pages: 11 pages generated
```

### Lint Verification
```bash
pnpm lint
# Expected: No errors or warnings
```

### Type Check
```bash
pnpm tsc --noEmit
# Expected: No type errors
```

---

## Testing Manual - Flujos Críticos

### 1. Autenticación

#### Register Flow
- [ ] Go to http://localhost:3000/register
- [ ] Fill form with valid email + password
- [ ] Click "Sign Up"
- [ ] Verify redirects to /dashboard
- [ ] Verify session stored in cookies

#### Login Flow
- [ ] Go to http://localhost:3000/login
- [ ] Enter registered email
- [ ] Enter correct password
- [ ] Click "Sign In"
- [ ] Verify redirects to /dashboard
- [ ] Verify session is valid

#### Logout Flow
- [ ] From /settings page
- [ ] Click "Sign Out" button
- [ ] Verify redirects to /
- [ ] Try accessing /dashboard → should redirect to /login
- [ ] Session cleared from cookies

#### Route Protection
- [ ] Logout
- [ ] Try accessing http://localhost:3000/dashboard directly
- [ ] Verify redirects to /login
- [ ] Try accessing http://localhost:3000/courses
- [ ] Verify redirects to /login

### 2. Dark/Light Mode

- [ ] Click theme toggle in navbar
- [ ] Verify background colors change
- [ ] Check text contrast in both modes
- [ ] Verify design tokens applied correctly
- [ ] Refresh page → theme persists (next-themes)

### 3. Dashboard Switching

#### Student Dashboard (default)
- [ ] Register as student
- [ ] Navigate to /dashboard
- [ ] Verify StudentDashboard renders
- [ ] Check stats cards display
- [ ] Click "Buscar cursos" → goes to /courses

#### Teacher Dashboard
- [ ] Modify code: change USER_ROLE to 'teacher'
- [ ] Navigate to /dashboard
- [ ] Verify TeacherDashboard renders
- [ ] Check teacher-specific stats
- [ ] Verify "Crear curso" button visible

### 4. Courses

#### Browse Courses
- [ ] Go to /courses
- [ ] Verify empty state (no courses yet)
- [ ] Verify search bar functional
- [ ] Verify filter button exists

#### Create Course (Teachers)
- [ ] Change USER_ROLE to 'teacher'
- [ ] Go to /courses/create
- [ ] Fill form:
  - [ ] Title: "React Fundamentals"
  - [ ] Description: "Learn React basics"
  - [ ] Category: "Programming"
  - [ ] Level: "Beginner"
- [ ] Click "Crear curso"
- [ ] Verify form submission
- [ ] (Redirects to detail page once API integrated)

#### Course Detail
- [ ] Go to /courses/[id] directly
- [ ] Verify course info loads
- [ ] Verify tabs (Overview, Lessons, Assignments)
- [ ] Verify sidebar with stats
- [ ] Check buttons (Inscribirse/Editar based on role)

### 5. Assignments

#### View Assignments
- [ ] Go to /assignments
- [ ] Verify empty state (no assignments yet)
- [ ] Test filter buttons:
  - [ ] Click "Todas"
  - [ ] Click "Pendientes"
  - [ ] Click "Enviadas"
  - [ ] Click "Calificadas"
- [ ] Verify UI updates on filter click

#### Submit Assignment
- [ ] From assignments list, click action button
- [ ] Verify SubmitAssignmentForm renders
- [ ] Test file upload:
  - [ ] Click file input
  - [ ] Select a file
  - [ ] Verify filename shows
- [ ] Test text content:
  - [ ] Write text in textarea
  - [ ] Verify text input works
- [ ] Click "Enviar tarea"
- [ ] Verify submission feedback (success/error message)

### 6. Profile & Settings

#### View Profile
- [ ] Go to /profile
- [ ] Verify user info displays
- [ ] Verify role badge shows
- [ ] Check all info fields populated

#### Edit Profile
- [ ] Click "Editar perfil" button
- [ ] (Verify button navigates or opens modal when implemented)

#### Settings
- [ ] Go to /settings
- [ ] Verify all sections display:
  - [ ] Notifications
  - [ ] Privacy & Security
  - [ ] Appearance
  - [ ] Danger Zone
- [ ] Click theme toggle → verify it works
- [ ] Click "Cerrar sesión" → verify logout flow
- [ ] (Verify other settings buttons when implemented)

---

## Responsive Design Testing

### Mobile (375px)
- [ ] All pages render without horizontal scroll
- [ ] Text is readable
- [ ] Buttons are touch-friendly (44px+ height)
- [ ] Navigation collapses properly
- [ ] Forms stack vertically

### Tablet (768px)
- [ ] Grid layouts adapt to 2 columns where needed
- [ ] Sidebar visible or collapsible
- [ ] Cards display properly

### Desktop (1216px+)
- [ ] All components render as designed
- [ ] Grid layouts use 3+ columns
- [ ] Sidebar always visible
- [ ] No unnecessary whitespace

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter activates buttons
- [ ] Escape closes modals/dialogs
- [ ] Focus visible on all elements

### Color Contrast
- [ ] Use browser DevTools to check contrast
- [ ] WCAG AA standard (4.5:1 for text)
- [ ] Works in both light and dark mode

### Screen Reader
- [ ] Test with browser screen reader
- [ ] All images have alt text
- [ ] Form labels associated with inputs
- [ ] Semantic HTML used

---

## Performance Testing

### Lighthouse
```bash
# Run Lighthouse audit
# Expected scores:
# - Performance: >85
# - Accessibility: >95
# - Best Practices: >90
# - SEO: >90
```

### Core Web Vitals
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1

### Bundle Size
```bash
pnpm build
# Expected: < 200KB (gzipped)
```

---

## API Integration Testing

### Setup Mock Endpoints
```javascript
// In development, mock API responses
const mockCourses = [
  {
    id: '1',
    title: 'React Basics',
    description: 'Learn React',
    level: 'beginner',
    category: 'programming',
    instructor: 'John Doe',
    students: 150,
    rating: 4.8
  }
]
```

### Test Data Flow
- [ ] Fetch courses → courses list populates
- [ ] Create course → new course appears
- [ ] Submit assignment → feedback shows
- [ ] Login → session persists

---

## Error Handling Testing

### Network Errors
- [ ] Disable internet
- [ ] Try to perform action
- [ ] Verify error message displays
- [ ] Verify retry mechanism works
- [ ] Re-enable internet
- [ ] Verify action completes

### Validation Errors
- [ ] Submit empty form
- [ ] Verify validation errors show
- [ ] Fix errors
- [ ] Verify submit button enables

### 404 Errors
- [ ] Go to /invalid-route
- [ ] Verify 404 error page (or redirect)

---

## Browser Compatibility

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome (Android)

---

## Security Testing

### CSRF Protection
- [ ] Verify forms include anti-CSRF tokens
- [ ] Verify request headers correct

### XSS Prevention
- [ ] Try injecting script in forms
- [ ] Verify input sanitized
- [ ] No JavaScript executed

### Password Security
- [ ] Password field masked (•••••)
- [ ] Verify min length enforced
- [ ] Verify password rules enforced

### Session Security
- [ ] Session cookie HttpOnly
- [ ] Session cookie Secure (HTTPS only)
- [ ] Session timeout implemented
- [ ] Logout clears session

---

## Deployment Testing

### Pre-Deployment
```bash
# Final build verification
pnpm build
# Expected: ✓ Compiled successfully

# Type checking
pnpm tsc --noEmit
# Expected: No errors

# Linting
pnpm lint
# Expected: No errors
```

### Post-Deployment (Vercel)
- [ ] Site loads at production URL
- [ ] All routes accessible
- [ ] API endpoints working
- [ ] Database connected
- [ ] Environment variables set
- [ ] SSL certificate valid
- [ ] Redirects work (e.g., / → home)

### Monitoring
- [ ] Vercel Analytics dashboard
- [ ] Check Core Web Vitals
- [ ] Monitor error rates
- [ ] Check uptime

---

## Regression Testing Checklist

After each deployment:
- [ ] Auth still works (login/register/logout)
- [ ] Dashboard loads
- [ ] Courses list works
- [ ] Create course form submits
- [ ] Assignments display
- [ ] Profile loads
- [ ] Settings page works
- [ ] Theme toggle works
- [ ] Responsive design maintained
- [ ] No console errors

---

## Test Scenarios (Advanced)

### Concurrent Users
- [ ] Open app in 2 browser windows
- [ ] Log in as different users
- [ ] Verify data isolation (no cross-contamination)

### Long Sessions
- [ ] Stay logged in for 1 hour
- [ ] Verify session doesn't expire unexpectedly
- [ ] Perform actions → still work

### High Load (Load Testing)
```bash
# Use k6, Apache JMeter, or Loadtest
# Simulate 1000+ concurrent users
# Verify:
# - Response times < 200ms
# - Error rate < 0.1%
# - Graceful degradation
```

---

## Bug Report Template

If issues found:

```markdown
## Bug Title
[Brief description]

## Steps to Reproduce
1. Go to [URL]
2. Click [button]
3. Fill [form]
4. Observe [issue]

## Expected Result
[What should happen]

## Actual Result
[What actually happened]

## Environment
- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- Version: [version number]
- Device: [Desktop/Mobile]

## Screenshot/Video
[Attach image or video if possible]

## Severity
[ ] Critical (app broken)
[ ] High (major feature broken)
[ ] Medium (feature partially broken)
[ ] Low (cosmetic issue)
```

---

## Sign-Off Checklist

- [ ] All pages load without errors
- [ ] Auth flows work (3+ test users)
- [ ] Dashboard renders correctly
- [ ] Forms submit successfully
- [ ] Dark mode functional
- [ ] Mobile responsive (tested on 3+ devices)
- [ ] Lighthouse scores acceptable
- [ ] No console errors/warnings
- [ ] Links work (internal + external)
- [ ] Performance acceptable
- [ ] Accessibility meets standards
- [ ] Security checks passed
- [ ] All TODOs reviewed

---

**QA Sign-Off**: _________________  Date: _____________

**Approved for Production**: [ ] YES [ ] NO

**Notes**: _________________________________________________________________

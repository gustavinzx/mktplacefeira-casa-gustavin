const fs = require('fs');
const path = require('path');

function processFile(filePath, replacements) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');

  // Add import if not present
  if (replacements.needsImport && !content.includes('useCurrentUser')) {
    // Find last import
    const importRegex = /import .* from .*;?\n/g;
    let match;
    let lastIndex = 0;
    while ((match = importRegex.exec(content)) !== null) {
      lastIndex = match.index + match[0].length;
    }
    content = content.slice(0, lastIndex) + "import { useCurrentUser } from '@/hooks/useCurrentUser';\n" + content.slice(lastIndex);
  }

  // Execute manual replacements passed as array
  if (replacements.rules) {
    for (const rule of replacements.rules) {
      if (typeof rule.search === 'string') {
        content = content.split(rule.search).join(rule.replace);
      } else {
        content = content.replace(rule.search, rule.replace);
      }
    }
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Updated', filePath);
}

// 1. Header.tsx
processFile('src/components/Header.tsx', {
  needsImport: true,
  rules: [
    { search: /const \[isLogged, setIsLogged\] = useState\(false\);\n  const \[userRole, setUserRole\] = useState<string \| null>\(null\);\n  const \[userName, setUserName\] = useState<string \| null>\(null\);/, replace: '' },
    { search: /const \[userId, setUserId\] = useState<string \| null>\(null\);/, replace: '' },
    { search: /const { notifications/, replace: "const { role: userRole, name: userName, id: userId, user } = useCurrentUser();\n  const isLogged = !!user;\n  const { notifications" },
    { search: /const role = localStorage.getItem\('user_role'\);\n    const name = localStorage.getItem\('user_name'\);\n    const uid = localStorage.getItem\('user_id'\);\n\n    if \(role\) \{\n      setIsLogged\(true\);\n      setUserRole\(role\);\n      setUserName\(name\);\n      setUserId\(uid\);\n    \}/g, replace: '' }
  ]
});

// 2. PortalSidebar.tsx
processFile('src/components/PortalSidebar.tsx', {
  needsImport: true,
  rules: [
    { search: /const \[userName, setUserName\] = useState<string \| null>\(null\);/, replace: '' },
    { search: /useEffect\(\(\) => {\n    const name = localStorage.getItem\('user_name'\);\n    if \(name\) setUserName\(name\);\n  }, \[\]\);/g, replace: '' },
    { search: /const pathname = usePathname\(\);/g, replace: "const pathname = usePathname();\n  const { name: userName } = useCurrentUser();" }
  ]
});

// 3. PortalTopbar.tsx
processFile('src/components/PortalTopbar.tsx', {
  needsImport: true,
  rules: [
    { search: /const \[userName, setUserName\] = useState<string \| null>\(null\);/, replace: '' },
    { search: /const \[userRole, setUserRole\] = useState<string \| null>\(null\);/, replace: '' },
    { search: /const \[userId, setUserId\] = useState<string \| null>\(null\);/, replace: '' },
    { search: /const router = useRouter\(\);/g, replace: "const router = useRouter();\n  const { name: userName, role: userRole, id: userId } = useCurrentUser();" },
    { search: /useEffect\(\(\) => {\n    setUserName\(localStorage.getItem\('user_name'\)\);\n    setUserRole\(localStorage.getItem\('user_role'\)\);\n    setUserId\(localStorage.getItem\('user_id'\)\);\n  }, \[\]\);/g, replace: '' }
  ]
});

// 4. PortalAuthGate.tsx
processFile('src/components/PortalAuthGate.tsx', {
  needsImport: true,
  rules: [
    { search: /const \[authorized, setAuthorized\] = useState\(false\);/, replace: '' },
    { search: /const router = useRouter\(\);/g, replace: "const router = useRouter();\n  const { role, loading } = useCurrentUser();" },
    { search: /useEffect\(\(\) => \{\n    const role = localStorage.getItem\('user_role'\);\n    if \(!role \|\| !allowedRoles.includes\(role\)\) \{\n      router.replace\('\/login'\);\n    \} else \{\n      setAuthorized\(true\);\n    \}\n  \}, \[allowedRoles, router\]\);/g, replace: "useEffect(() => {\n    if (!loading && (!role || !allowedRoles.includes(role))) {\n      router.replace('/login');\n    }\n  }, [role, loading, allowedRoles, router]);" },
    { search: /if \(!authorized\) return null;/g, replace: "if (loading || (!role || !allowedRoles.includes(role))) return null;" }
  ]
});

// 5. src/app/portal/page.tsx
processFile('src/app/portal/page.tsx', {
  needsImport: true,
  rules: [
    { search: /const \[userRole, setUserRole\] = useState<string \| null>\(null\);\n  const \[userName, setUserName\] = useState<string \| null>\(null\);/, replace: '' },
    { search: /const router = useRouter\(\);/g, replace: "const router = useRouter();\n  const { role: userRole, name: userName, loading } = useCurrentUser();" },
    { search: /useEffect\(\(\) => \{\n    const role = localStorage.getItem\('user_role'\);\n    const name = localStorage.getItem\('user_name'\);\n    if \(role\) \{\n      setUserRole\(role\);\n      setUserName\(name\);\n    \} else \{\n      router.push\('\/login'\);\n    \}\n  \}, \[router\]\);/g, replace: "useEffect(() => {\n    if (!loading && !userRole) {\n      router.push('/login');\n    }\n  }, [userRole, loading, router]);" },
    { search: /if \(!userRole\) return null;/g, replace: "if (loading || !userRole) return null;" }
  ]
});

// 6. src/app/portal/chef/page.tsx
processFile('src/app/portal/chef/page.tsx', {
  needsImport: true,
  rules: [
    { search: /const \[userName, setUserName\] = useState<string \| null>\(null\);/, replace: '' },
    { search: /export default function ChefPortalDashboard\(\) \{/g, replace: "export default function ChefPortalDashboard() {\n  const { name: userName } = useCurrentUser();" },
    { search: /useEffect\(\(\) => \{\n    setUserName\(localStorage.getItem\('user_name'\)\);\n  \}, \[\]\);/g, replace: "" }
  ]
});

// 7. src/app/portal/usuario/page.tsx
processFile('src/app/portal/usuario/page.tsx', {
  needsImport: true,
  rules: [
    { search: /const \[userName, setUserName\] = useState<string \| null>\(null\);/, replace: '' },
    { search: /const \[userId, setUserId\] = useState<string \| null>\(null\);/, replace: '' },
    { search: /export default function UserPortalDashboard\(\) \{/g, replace: "export default function UserPortalDashboard() {\n  const { name: userName, id: userId } = useCurrentUser();" },
    { search: /useEffect\(\(\) => \{\n    setUserName\(localStorage.getItem\('user_name'\)\);\n    setUserId\(localStorage.getItem\('user_id'\)\);\n  \}, \[\]\);/g, replace: "" }
  ]
});

// 8. src/app/portal/usuario/pedidos/page.tsx
processFile('src/app/portal/usuario/pedidos/page.tsx', {
  needsImport: true,
  rules: [
    { search: /export default function UserOrdersPage\(\) \{/g, replace: "export default function UserOrdersPage() {\n  const { id: currentUserId } = useCurrentUser();" },
    { search: /const uid = localStorage.getItem\('user_id'\) \|\| '123';/g, replace: "const uid = currentUserId;" }
  ]
});

// 9. src/app/portal/usuario/perfil/page.tsx
processFile('src/app/portal/usuario/perfil/page.tsx', {
  needsImport: true,
  rules: [
    { search: /export default function UserProfilePage\(\) \{/g, replace: "export default function UserProfilePage() {\n  const { id: currentUserId } = useCurrentUser();" },
    { search: /const uid = localStorage.getItem\('user_id'\) \|\| '123';/g, replace: "const uid = currentUserId;" }
  ]
});

// 10. src/app/portal/usuario/favoritos/page.tsx
processFile('src/app/portal/usuario/favoritos/page.tsx', {
  needsImport: true,
  rules: [
    { search: /export default function UserFavoritesPage\(\) \{/g, replace: "export default function UserFavoritesPage() {\n  const { id: currentUserId } = useCurrentUser();" },
    { search: /const uid = localStorage.getItem\('user_id'\) \|\| '123';/g, replace: "const uid = currentUserId;" }
  ]
});

// 11. src/app/checkout/confirmation/page.tsx
processFile('src/app/checkout/confirmation/page.tsx', {
  needsImport: true,
  rules: [
    { search: /const \[userName, setUserName\] = useState<string \| null>\(null\);/, replace: '' },
    { search: /export default function CheckoutConfirmationPage\(\) \{/g, replace: "export default function CheckoutConfirmationPage() {\n  const { name: userName } = useCurrentUser();" },
    { search: /useEffect\(\(\) => \{\n    const name = localStorage.getItem\('user_name'\);\n    if \(name\) setUserName\(name\);\n  \}, \[\]\);/g, replace: "" }
  ]
});

// 12. src/app/feirantes/page.tsx
processFile('src/app/feirantes/page.tsx', {
  needsImport: true,
  rules: [
    { search: /const \[userRole, setUserRole\] = useState<string \| null>\(null\);/, replace: '' },
    { search: /export default function FeirantesLandingPage\(\) \{/g, replace: "export default function FeirantesLandingPage() {\n  const { role: userRole } = useCurrentUser();" },
    { search: /useEffect\(\(\) => \{\n    setUserRole\(localStorage.getItem\('user_role'\)\);\n  \}, \[\]\);/g, replace: "" }
  ]
});

// 13. src/app/feiras/page.tsx
processFile('src/app/feiras/page.tsx', {
  needsImport: true,
  rules: [
    { search: /const \[userRole, setUserRole\] = useState<string \| null>\(null\);/, replace: '' },
    { search: /export default function FeirasPage\(\) \{/g, replace: "export default function FeirasPage() {\n  const { role: userRole } = useCurrentUser();" },
    { search: /useEffect\(\(\) => \{\n    setUserRole\(localStorage.getItem\('user_role'\)\);\n  \}, \[\]\);/g, replace: "" }
  ]
});

// 14. src/app/b2b/page.tsx
processFile('src/app/b2b/page.tsx', {
  needsImport: true,
  rules: [
    { search: /const \[userRole, setUserRole\] = useState<string \| null>\(null\);/, replace: '' },
    { search: /export default function B2BLandingPage\(\) \{/g, replace: "export default function B2BLandingPage() {\n  const { role: userRole } = useCurrentUser();" },
    { search: /useEffect\(\(\) => \{\n    setUserRole\(localStorage.getItem\('user_role'\)\);\n  \}, \[\]\);/g, replace: "" }
  ]
});

// 15. src/lib/profile.ts
processFile('src/lib/profile.ts', {
  needsImport: false,
  rules: [
    { search: /localStorage.setItem\('access_token', accessToken\);/g, replace: "// APENAS cache de UI — auth real é pelo cookie Supabase" }
  ]
});

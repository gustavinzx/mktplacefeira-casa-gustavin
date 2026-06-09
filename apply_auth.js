const fs = require('fs');
const path = require('path');

const adminRoutes = [
  'src/app/api/admin/crm/disparos/route.ts',
  'src/app/api/admin/crm/leads/route.ts',
  'src/app/api/admin/cadastros/route.ts',
  'src/app/api/admin/metrics/route.ts',
  'src/app/api/admin/audit-logs/route.ts',
  'src/app/api/admin/frete/route.ts',
  'src/app/api/admin/logs/route.ts',
  'src/app/api/admin/fornecedores/route.ts',
  'src/app/api/admin/ml/anomalias/route.ts',
  'src/app/api/admin/ml/insights/route.ts',
  'src/app/api/admin/roles/route.ts',
  'src/app/api/admin/contador/route.ts',
  'src/app/api/admin/b2b/route.ts',
  'src/app/api/admin/franqueados/route.ts',
  'src/app/api/admin/campaigns/route.ts',
  'src/app/api/admin/financeiro/route.ts',
  'src/app/api/admin/nfe/route.ts',
  'src/app/api/admin/overview/route.ts',
  'src/app/api/admin/planos/route.ts',
  'src/app/api/admin-profile/route.ts',
  'src/app/api/users/route.ts',
  'src/app/api/site-settings/route.ts',
];

const authRoutes = [
  'src/app/api/orders/route.ts',
  'src/app/api/orders/[id]/route.ts',
  'src/app/api/orders/[id]/status/route.ts',
  'src/app/api/recipes/route.ts',
  'src/app/api/recipes/[id]/route.ts',
  'src/app/api/recipes/ai-rewrite/route.ts',
  'src/app/api/services/route.ts',
  'src/app/api/account/orders/route.ts',
  'src/app/api/account/summary/route.ts',
  'src/app/api/account/wallet/route.ts',
  'src/app/api/account/addresses/route.ts',
  'src/app/api/account/addresses/[id]/route.ts',
  'src/app/api/stripe/checkout/route.ts',
  'src/app/api/payments/coupon/route.ts',
];

const adminAuthCheck = `  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);

  const admin = createSupabaseAdmin();
  const { data: profile } = await admin
    .from('mktplace_feira_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return err('Sem permissão', 403);`;

const userAuthCheck = `  const user = await getAuthUser(request);
  if (!user) return err('Não autorizado', 401);`;

const imports = `import { createSupabaseAdmin, getAuthUser, ok, err } from '@/lib/supabase-server';\n`;

function processFile(filePath, checkCode) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log('Skipping missing file:', filePath);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Skip if already has getAuthUser
  if (content.includes('getAuthUser(request)')) {
    console.log('Already protected:', filePath);
    return;
  }

  // Ensure imports exist
  if (!content.includes('getAuthUser')) {
    if (content.includes('@/lib/supabase-server')) {
      content = content.replace(/import \{.*\} from '@\/lib\/supabase-server';/g, (match) => {
        const hasCreateAdmin = match.includes('createSupabaseAdmin');
        const hasAuthUser = match.includes('getAuthUser');
        const hasOk = match.includes('ok');
        const hasErr = match.includes('err');
        let newMatch = match;
        if (!hasCreateAdmin) newMatch = newMatch.replace('{', '{ createSupabaseAdmin,');
        if (!hasAuthUser) newMatch = newMatch.replace('{', '{ getAuthUser,');
        if (!hasOk) newMatch = newMatch.replace('{', '{ ok,');
        if (!hasErr) newMatch = newMatch.replace('{', '{ err,');
        return newMatch;
      });
    } else {
      content = imports + content;
    }
  }

  // Inject check in export async function GET, POST, PUT, DELETE, PATCH
  const regex = /export async function (GET|POST|PUT|DELETE|PATCH)\(request: Request\) \{/g;
  content = content.replace(regex, (match) => {
    return `${match}\n${checkCode}\n`;
  });
  
  // also handle "export async function GET(request: NextRequest) {" or similar
  const regex2 = /export async function (GET|POST|PUT|DELETE|PATCH)\(request: NextRequest.*\) \{/g;
  content = content.replace(regex2, (match) => {
    return `${match}\n${checkCode}\n`;
  });

  // also handle without type
  const regex3 = /export async function (GET|POST|PUT|DELETE|PATCH)\(req: Request\) \{/g;
  content = content.replace(regex3, (match) => {
    // replace 'request' with 'req' in checkCode
    const newCheck = checkCode.replace(/getAuthUser\(request\)/g, 'getAuthUser(req)');
    return `${match}\n${newCheck}\n`;
  });

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Protected:', filePath);
}

adminRoutes.forEach(route => processFile(route, adminAuthCheck));
authRoutes.forEach(route => processFile(route, userAuthCheck));

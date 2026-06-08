const fs = require('fs');
const file = 'c:/Users/gsds0/Desktop/mktplacefeira.casa/src/app/login/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `        } catch (err) {
          console.error("Erro processando OAuth login:", err);
    setForgotLoading(true);`;

const replacementStr = `        } catch (err) {
          console.error("Erro processando OAuth login:", err);
          setError("Ocorreu um erro ao finalizar o login.");
          if (active) setCheckingSession(false);
        }
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [router, searchParams]);

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    if (oauthLoading) return;
    setOauthLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: \`\${window.location.origin}/auth/callback\`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      console.error(\`Erro no login com \${provider}:\`, err);
      setError(\`O login com \${provider === 'google' ? 'Google' : 'Apple'} não está configurado no banco de dados ainda.\`);
      setOauthLoading(null);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotLoading || !forgotEmail.trim()) return;
    setForgotLoading(true);`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content, 'utf8');
  console.log("Fixed page.tsx successfully!");
} else {
  console.log("target string not found.");
}

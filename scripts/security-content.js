// Shared scanner. Diagnostics identify the kind and file, never the secret value.
export function sensitiveContentKinds(source){
  const found=new Set();
  for(const [kind,pattern] of [
    ['Supabase secret',/sb_secret_[A-Za-z0-9_-]{8,}/],
    ['Brevo API/SMTP',/(?:xkeysib|xsmtpsib)-[A-Za-z0-9_-]{12,}/],
    ['GitHub token',/(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})/],
    ['private key',/-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/],
  ])if(pattern.test(source))found.add(kind);
  for(const token of source.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)||[]){
    try{const claims=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString('utf8'));
      if(claims.role!=='anon')found.add('JWT privileged/session');
    }catch{found.add('JWT malformed');}
  }
  return [...found];
}
export function assertNoSensitiveContent(source,name){
  const kinds=sensitiveContentKinds(source);
  if(kinds.length)throw Error('Conteúdo privado em '+name+': '+kinds.join(', '));
}

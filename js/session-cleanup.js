// Migração única dos dados deste jogo, solicitada antes do primeiro teste público.
// Não altera dados de outros sites nem limpa sessões criadas após esta migração.
const marker='codequizz:primeiro-teste:2026-10-07';
export function prepareFirstTest(storage,projectUrl) {
  try {
    if(storage.getItem(marker)==='ok') return;
    const ref=new URL(projectUrl).hostname.split('.')[0];
    storage.removeItem('codequizz:save:v1');
    storage.removeItem(`sb-${ref}-auth-token`);
    storage.removeItem(`sb-${ref}-auth-token-code-verifier`);
    storage.setItem(marker,'ok');
  } catch { /* Navegadores sem armazenamento continuam usando o tratamento do SDK. */ }
}

export const publicFiles = [
  'index.html','.nojekyll','LICENSE',
  'css/style.css','css/game.css','css/campaign.css','css/battle.css','css/viewport.css','css/worlds.css','css/auth.css',
  'assets/fonts/LilitaOne-Regular.ttf','assets/fonts/OFL-LilitaOne.txt','assets/icons/favicon.svg','assets/AUTORIA.md',
  'data/config.json','data/mundos.json','data/fases.json','data/objetivos.json',
  'config/supabase.json','js/app.js'
];
export function contentSecurityPolicy(projectUrl) {
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(projectUrl)) {
    throw new Error('URL do Supabase inválida.');
  }

  return `default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' ${projectUrl}; media-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'`;
}

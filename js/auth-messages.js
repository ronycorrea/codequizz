export function authErrorMessage(error) {
  const messages={
    invalid_credentials:'E-mail ou senha incorretos.',
    email_not_confirmed:'Confirme seu e-mail antes de entrar. Você pode solicitar uma nova confirmação.',
    user_already_exists:'Já existe uma conta com este e-mail. Entre na conta ou recupere sua senha.',
    email_exists:'Já existe uma conta com este e-mail. Entre na conta ou recupere sua senha.',
    over_email_send_rate_limit:'O limite de envio de e-mails foi atingido. Aguarde antes de solicitar novamente.',
    over_request_rate_limit:'Muitas solicitações. Aguarde um pouco antes de tentar novamente.',
    email_address_not_authorized:'O serviço de e-mail do jogo ainda não permite enviar para este endereço. O responsável pelo jogo precisa configurar o envio de e-mails.',
    signup_disabled:'O cadastro está temporariamente indisponível.',
    weak_password:'Escolha uma senha mais forte.',
    otp_expired:'O link expirou. Solicite um novo e-mail.'
  };
  if(messages[error?.code])return messages[error.code];
  if(/user already registered|email already (?:registered|exists)/i.test(error?.message||''))return messages.user_already_exists;
  if(/email address not authorized/i.test(error?.message||''))return messages.email_address_not_authorized;
  if(/error sending (confirmation|recovery) email/i.test(error?.message||''))return 'Não foi possível enviar o e-mail. O responsável pelo jogo precisa conferir o serviço de envio.';
  return error?.message||'Não foi possível concluir. Tente novamente.';
}

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {authErrorMessage} from '../js/auth-messages.js';
test('mensagens Auth distinguem envio não autorizado, limite e falha de entrega',()=>{
  assert.match(authErrorMessage({code:'email_address_not_authorized'}),/configurar o envio/);
  assert.match(authErrorMessage({message:'Email address not authorized'}),/configurar o envio/);
  assert.match(authErrorMessage({code:'over_email_send_rate_limit'}),/limite de envio/);
  assert.match(authErrorMessage({message:'Error sending confirmation email'}),/conferir o serviço de envio/);
  assert.match(authErrorMessage({message:'Error sending recovery email'}),/conferir o serviço de envio/);
  assert.equal(authErrorMessage({message:'Falha conhecida'}),'Falha conhecida');
});
test('mensagens de cadastro repetido exibem aviso explícito e orientam login ou recuperação',()=>{
  for(const error of [{code:'user_already_exists'},{code:'email_exists'},{message:'User already registered'},{message:'Email already registered'},{message:'Email already exists'}]){
    assert.equal(authErrorMessage(error),'Já existe uma conta com este e-mail. Entre na conta ou recupere sua senha.');
  }
});

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

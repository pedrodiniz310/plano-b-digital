import type { GlyphKey } from '../theme/icons';

export interface EmergencyScenario {
  id: string;
  title: string;
  glyph: GlyphKey;
}

/**
 * Os 9 cenários do Modo Emergência (`EMS` no protótipo). Só `celular` tem
 * plano dedicado em `EMERGENCY_PLANS` — os outros 8 caem no plano `generico`
 * (ver `planFor()` em lib/emergency.ts).
 */
export const EMERGENCY_SCENARIOS: EmergencyScenario[] = [
  { id: 'celular', title: 'Roubaram ou perdi meu celular', glyph: 'phone' },
  { id: 'zap', title: 'Invadiram meu WhatsApp', glyph: 'chat' },
  { id: 'email', title: 'Invadiram meu e-mail', glyph: 'mail' },
  { id: 'pix', title: 'Fiz um pagamento suspeito', glyph: 'card' },
  { id: 'conta', title: 'Perdi acesso a uma conta', glyph: 'key' },
  { id: 'social', title: 'Roubaram minha rede social', glyph: 'globe' },
  { id: 'familiar', title: 'Estão se passando por um familiar', glyph: 'users' },
  { id: 'docs', title: 'Meus documentos foram expostos', glyph: 'doc' },
  { id: 'outro', title: 'Outro problema', glyph: 'alert' },
];

export interface EmergencyAction {
  id: string;
  title: string;
  /** Texto explicativo de como executar a ação. */
  how: string;
}

export interface EmergencyPlan {
  now: EmergencyAction[];
  next: EmergencyAction[];
  later: EmergencyAction[];
}

export type EmergencyPlanId = 'celular' | 'generico';

/** Planos de ação (`EMPLAN` no protótipo) — `celular` (13 ações) e `generico` (8 ações). */
export const EMERGENCY_PLANS: Record<EmergencyPlanId, EmergencyPlan> = {
  celular: {
    now: [
      { id: 'c1', title: 'Tentar localizar o aparelho', how: 'Use o serviço de localização do sistema em outro aparelho ou computador. Se não localizar em poucos minutos, siga em frente.' },
      { id: 'c2', title: 'Bloquear o dispositivo remotamente', how: 'Marque o aparelho como perdido e exiba uma mensagem na tela. Evite apagar tudo antes de tentar localizar.' },
      { id: 'c3', title: 'Bloquear o chip com a operadora', how: 'Ligue para a operadora e peça o bloqueio da linha. Isso interrompe o recebimento de códigos por SMS.' },
      { id: 'c4', title: 'Proteger o e-mail principal', how: 'Troque a senha, encerre as sessões abertas e confirme se o e-mail de recuperação continua sendo o seu.' },
      { id: 'c5', title: 'Contatar as instituições financeiras', how: 'Avise bancos e carteiras pelos canais oficiais que você registrou. Peça o bloqueio preventivo de transações.' },
    ],
    next: [
      { id: 'c6', title: 'Encerrar sessões nas demais contas', how: 'Redes sociais, mensageiros e serviços de nuvem: encerre tudo que estiver conectado ao aparelho.' },
      { id: 'c7', title: 'Trocar as senhas prioritárias', how: 'Comece pelas contas que usam o e-mail principal como recuperação.' },
      { id: 'c8', title: 'Avisar contatos próximos', how: 'Explique que podem receber mensagens em seu nome pedindo dinheiro.' },
      { id: 'c9', title: 'Preservar evidências', how: 'Guarde prints, horários e protocolos de atendimento. Eles sustentam contestações.' },
    ],
    later: [
      { id: 'c10', title: 'Registrar boletim de ocorrência', how: 'Informe o IMEI registrado no seu cofre. O registro é exigido por bancos e seguradoras.' },
      { id: 'c11', title: 'Restaurar as contas', how: 'Refaça o acesso com calma, revisando permissões e aplicativos conectados.' },
      { id: 'c12', title: 'Revisar configurações do novo aparelho', how: 'Bloqueio de tela, backup automático e dois fatores antes de reinstalar tudo.' },
      { id: 'c13', title: 'Atualizar seu Plano B', how: 'Ajuste IMEI, operadora e contatos com as informações do novo aparelho.' },
    ],
  },
  generico: {
    now: [
      { id: 'g1', title: 'Interromper o acesso do invasor', how: 'Troque a senha da conta afetada e encerre todas as sessões conectadas.' },
      { id: 'g2', title: 'Proteger o e-mail principal', how: 'É a chave de recuperação das demais contas. Reforce a senha e ative dois fatores.' },
      { id: 'g3', title: 'Avisar quem pode ser afetado', how: 'Contatos próximos e instituições financeiras devem saber que existe um golpe em andamento.' },
    ],
    next: [
      { id: 'g4', title: 'Revisar permissões e dispositivos', how: 'Remova aplicativos conectados e aparelhos que você não reconhece.' },
      { id: 'g5', title: 'Registrar o ocorrido nas plataformas', how: 'Use os canais oficiais de denúncia e guarde os protocolos.' },
      { id: 'g6', title: 'Preservar evidências', how: 'Prints, datas e números de protocolo sustentam qualquer contestação.' },
    ],
    later: [
      { id: 'g7', title: 'Recuperar e revisar a conta', how: 'Confira dados cadastrais, e-mails de recuperação e regras de encaminhamento.' },
      { id: 'g8', title: 'Atualizar seu Plano B', how: 'Registre o que faltou e transforme em tarefa para não repetir.' },
    ],
  },
};

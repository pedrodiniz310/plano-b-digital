import type { GlyphKey } from '../theme/icons';

export type PlanCategoryId =
  | 'aparelho'
  | 'email'
  | 'contas'
  | 'fin'
  | 'contatos'
  | 'docs'
  | 'backup';

export type Priority = 'Crítica' | 'Alta' | 'Média';

export interface PlanCategory {
  id: PlanCategoryId;
  name: string;
  glyph: GlyphKey;
  priority: Priority;
  /**
   * Rótulo estático de "atualizado há X" do protótipo (dado de demonstração,
   * não calculado). Em produção isso deveria vir de `TaskState.completedAt`
   * mais recente da categoria — não portar como está, é placeholder visual.
   */
  demoUpdatedLabel: string;
}

/** As 7 categorias do plano (`PC` no protótipo). */
export const PLAN_CATEGORIES: PlanCategory[] = [
  { id: 'aparelho', name: 'Meu aparelho', glyph: 'phone', priority: 'Alta', demoUpdatedLabel: 'há 2 dias' },
  { id: 'email', name: 'Meu e-mail', glyph: 'mail', priority: 'Crítica', demoUpdatedLabel: 'há 6 dias' },
  { id: 'contas', name: 'Minhas contas', glyph: 'key', priority: 'Alta', demoUpdatedLabel: 'há 6 dias' },
  { id: 'fin', name: 'Proteção financeira', glyph: 'bank', priority: 'Alta', demoUpdatedLabel: 'há 11 dias' },
  { id: 'contatos', name: 'Contatos de confiança', glyph: 'users', priority: 'Média', demoUpdatedLabel: 'nunca' },
  { id: 'docs', name: 'Documentos importantes', glyph: 'doc', priority: 'Média', demoUpdatedLabel: 'há 20 dias' },
  { id: 'backup', name: 'Recuperação e backup', glyph: 'cloud', priority: 'Média', demoUpdatedLabel: 'há 20 dias' },
];

export interface Task {
  id: string;
  planCategoryId: PlanCategoryId;
  title: string;
  minutes: number;
  why: string;
  risk: string;
  /** Sempre 3 passos, nesta ordem. */
  steps: [string, string, string];
}

/** As 15 tarefas do plano (`T` no protótipo), nesta ordem exata. */
export const TASKS: Task[] = [
  {
    id: 't1', planCategoryId: 'aparelho', title: 'Registrar marca e modelo do aparelho', minutes: 2,
    why: 'O modelo exato agiliza o bloqueio junto à operadora e o registro do boletim de ocorrência.',
    risk: 'Perder horas procurando a informação durante o roubo.',
    steps: ['Abra as configurações do aparelho e toque em Sobre o telefone.', 'Anote marca, modelo e ano de compra.', 'Guarde no Cofre de Preparação, em Aparelho.'],
  },
  {
    id: 't2', planCategoryId: 'aparelho', title: 'Guardar o número IMEI', minutes: 3,
    why: 'O IMEI identifica o aparelho e permite bloqueá-lo em todas as operadoras.',
    risk: 'Não conseguir inutilizar o aparelho para o ladrão.',
    steps: ['Disque *#06# no teclado do telefone.', 'Fotografe ou anote o código de 15 dígitos.', 'Guarde uma cópia fora do celular.'],
  },
  {
    id: 't3', planCategoryId: 'aparelho', title: 'Registrar a operadora e o canal de bloqueio', minutes: 2,
    why: 'Bloquear o chip evita que recebam seus códigos por SMS.',
    risk: 'O golpista recebe seus SMS de verificação.',
    steps: ['Anote o nome da operadora e o telefone de atendimento.', 'Verifique se existe bloqueio pelo aplicativo.', 'Salve o passo a passo no cofre.'],
  },
  {
    id: 't4', planCategoryId: 'email', title: 'Confirmar o e-mail de recuperação', minutes: 3,
    why: 'É por ele que você recupera o acesso quando perde a senha principal.',
    risk: 'Ficar sem nenhuma via de retorno à conta principal.',
    steps: ['Acesse as configurações de segurança do seu e-mail.', 'Confirme se o endereço secundário ainda é seu e está ativo.', 'Atualize se estiver desatualizado.'],
  },
  {
    id: 't5', planCategoryId: 'email', title: 'Ativar autenticação em dois fatores', minutes: 5,
    why: 'Impede o acesso mesmo que a senha vaze.',
    risk: 'Invasão silenciosa da conta que recupera todas as outras.',
    steps: ['Abra segurança da conta e escolha verificação em duas etapas.', 'Prefira um aplicativo autenticador ao SMS.', 'Guarde os códigos de backup gerados.'],
  },
  {
    id: 't6', planCategoryId: 'email', title: 'Revisar sessões conectadas', minutes: 3,
    why: 'Sessões antigas em aparelhos perdidos continuam ativas por muito tempo.',
    risk: 'Acesso contínuo de um aparelho que não é mais seu.',
    steps: ['Procure por dispositivos conectados nas configurações.', 'Encerre o que não reconhecer.', 'Repita a revisão a cada três meses.'],
  },
  {
    id: 't7', planCategoryId: 'contas', title: 'Guardar códigos de recuperação', minutes: 4,
    why: 'São a única porta de entrada quando você perde o autenticador.',
    risk: 'Perder o acesso definitivo às contas com dois fatores.',
    steps: ['Gere os códigos nas contas críticas.', 'Imprima ou anote em papel guardado em local seguro.', 'Registre no cofre apenas onde eles estão.'],
  },
  {
    id: 't8', planCategoryId: 'contas', title: 'Listar contas prioritárias', minutes: 4,
    why: 'Na emergência não dá tempo de lembrar de tudo. A ordem já pronta economiza minutos.',
    risk: 'Proteger o que é secundário e esquecer o essencial.',
    steps: ['Liste e-mail, banco, redes e mensageiros.', 'Ordene por impacto se forem invadidos.', 'Salve a lista no cofre.'],
  },
  {
    id: 't9', planCategoryId: 'fin', title: 'Listar bancos e carteiras utilizados', minutes: 3,
    why: 'Saber onde está seu dinheiro define a ordem das ligações.',
    risk: 'Demorar a comunicar a instituição certa.',
    steps: ['Liste bancos, carteiras digitais e corretoras.', 'Marque quais têm aplicativo no celular.', 'Guarde a lista no cofre.'],
  },
  {
    id: 't10', planCategoryId: 'fin', title: 'Salvar canais oficiais de atendimento', minutes: 3,
    why: 'Golpistas se passam por centrais de atendimento em momentos de pânico.',
    risk: 'Ligar para um número falso e entregar seus dados.',
    steps: ['Copie os telefones do verso do cartão e do site oficial.', 'Anote o canal de contestação de transações.', 'Guarde no cofre, em Financeiro.'],
  },
  {
    id: 't11', planCategoryId: 'contatos', title: 'Cadastrar um contato de confiança', minutes: 3,
    why: 'Alguém precisa poder confirmar sua identidade e agir com você.',
    risk: 'Enfrentar a emergência sozinho, sem validação externa.',
    steps: ['Escolha alguém que atenda o telefone rapidamente.', 'Combine previamente o que essa pessoa deve fazer.', 'Cadastre o contato no aplicativo.'],
  },
  {
    id: 't12', planCategoryId: 'contatos', title: 'Definir a palavra de segurança da família', minutes: 4,
    why: 'Pedidos urgentes de dinheiro por mensagem são o golpe mais comum.',
    risk: 'Um familiar transferir dinheiro para um golpista.',
    steps: ['Escolha uma palavra que não esteja em redes sociais.', 'Combine que todo pedido urgente será confirmado por ligação.', 'Renove a palavra a cada seis meses.'],
  },
  {
    id: 't13', planCategoryId: 'docs', title: 'Registrar onde estão os documentos', minutes: 3,
    why: 'Boletim de ocorrência e contestações exigem documentos em mãos.',
    risk: 'Atrasar registros formais por não achar os documentos.',
    steps: ['Anote o local físico de RG, CPF e certidões.', 'Verifique se há cópias digitais protegidas.', 'Registre apenas a localização, nunca as imagens.'],
  },
  {
    id: 't14', planCategoryId: 'backup', title: 'Configurar backup automático', minutes: 5,
    why: 'Fotos e conversas perdidas raramente voltam.',
    risk: 'Perder anos de registros junto com o aparelho.',
    steps: ['Ative o backup automático de fotos e mensagens.', 'Confirme a frequência e o espaço disponível.', 'Anote onde o backup está guardado.'],
  },
  {
    id: 't15', planCategoryId: 'backup', title: 'Testar uma restauração', minutes: 6,
    why: 'Backup que nunca foi testado costuma falhar justamente na hora.',
    risk: 'Descobrir que o backup não funciona quando ele é a única opção.',
    steps: ['Restaure um arquivo antigo em outro aparelho ou computador.', 'Confirme que o conteúdo abre corretamente.', 'Repita o teste a cada seis meses.'],
  },
];

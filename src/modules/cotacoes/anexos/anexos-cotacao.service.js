import cotacoesRepository from '../cotacoes/cotacoes.repository.js';
import {
  createValidationError,
  required,
  validateCotacaoAbertaParaAlteracao,
  validateCotacaoExiste
} from '../cotacoes/cotacoes.service.js';
import { validateFornecedorDaCotacao } from '../fornecedores/fornecedores-cotacao.service.js';

const extensoesImagem = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function getExtensao(nomeArquivo) {
  const match = String(nomeArquivo ?? '').toLowerCase().match(/\.[^.]+$/);
  return match?.[0] || '';
}

function validateImagem({ nome_arquivo, tipo_arquivo }) {
  if (String(tipo_arquivo ?? '').toLowerCase().startsWith('image/')) {
    return;
  }

  if (extensoesImagem.has(getExtensao(nome_arquivo))) {
    return;
  }

  throw createValidationError('Anexo do orçamento deve ser uma imagem.');
}

async function listar(cotacaoId, cotacaoFornecedorId) {
  await validateCotacaoExiste(cotacaoId);
  await validateFornecedorDaCotacao(cotacaoId, cotacaoFornecedorId);

  return cotacoesRepository.findAnexosByCotacaoFornecedorId(cotacaoFornecedorId);
}

async function adicionar(cotacaoId, cotacaoFornecedorId, data = {}) {
  const cotacao = await validateCotacaoExiste(cotacaoId);
  validateCotacaoAbertaParaAlteracao(cotacao);
  await validateFornecedorDaCotacao(cotacaoId, cotacaoFornecedorId);

  if (!required(data?.nome_arquivo)) {
    throw createValidationError('Nome do arquivo da foto e obrigatorio.');
  }

  if (!required(data?.caminho_arquivo)) {
    throw createValidationError('Caminho do arquivo da foto e obrigatorio.');
  }

  validateImagem({
    nome_arquivo: data.nome_arquivo,
    tipo_arquivo: data?.tipo_arquivo ?? null
  });

  return cotacoesRepository.addFornecedorAnexo({
    cotacao_fornecedor_id: cotacaoFornecedorId,
    nome_arquivo: data.nome_arquivo,
    caminho_arquivo: data.caminho_arquivo,
    tipo_arquivo: data?.tipo_arquivo ?? null
  });
}

export default {
  adicionar,
  listar
};

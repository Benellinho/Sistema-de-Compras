import solicitacoesRepository from './solicitacoes.repository.js';

// Services concentram regras de negócio e mantêm controllers desacoplados do banco.
async function list() {
  return solicitacoesRepository.findAll();
}

async function create(data) {
  return solicitacoesRepository.create(data);
}

export default {
  list,
  create
};

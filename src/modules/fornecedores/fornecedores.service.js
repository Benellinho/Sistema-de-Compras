import fornecedoresRepository from './fornecedores.repository.js';

// Services concentram regras de negócio e mantêm controllers desacoplados do banco.
async function list() {
  return fornecedoresRepository.findAll();
}

async function create(data) {
  return fornecedoresRepository.create(data);
}

export default {
  list,
  create
};

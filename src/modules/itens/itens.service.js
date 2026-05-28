import itensRepository from './itens.repository.js';

// Services concentram regras de negócio e mantêm controllers desacoplados do banco.
async function list() {
  return itensRepository.findAll();
}

async function create(data) {
  return itensRepository.create(data);
}

export default {
  list,
  create
};

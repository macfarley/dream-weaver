import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/sleepdata`;

const getAll = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

const get = async (id) => {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
};

const create = async (payload) => {
  const res = await axios.post(BASE_URL, payload);
  return res.data;
};

const update = async (id, payload) => {
  const res = await axios.put(`${BASE_URL}/${id}`, payload);
  return res.data;
};

// Delete requires sending password in body to confirm identity
const remove = async (id, password) => {
  const res = await axios.delete(`${BASE_URL}/${id}`, { data: { password } });
  return res.data;
};

export default {
  getAll,
  get,
  create,
  update,
  delete: remove,
};

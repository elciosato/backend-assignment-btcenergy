import axios from "axios";

const blockchainApi = axios.create({
  baseURL: "https://blockchain.info",
});

export { blockchainApi };

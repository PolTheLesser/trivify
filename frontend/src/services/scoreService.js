import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export async function fetchTopScores() {
    const response = await axios.get(`${API_URL}/quiz-results/scores/top`);
    return response.data;
}

export async function fetchUserScore(userId) {
    const response = await axios.get(`${API_URL}/quiz-results/scores/user/${userId}`);
    return response.data;
}

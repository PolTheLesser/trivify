import axios from 'axios';

export async function fetchTopScores() {
    const response = await axios.get(`/quiz-results/scores/top`);
    return response.data;
}

export async function fetchUserScore(userId) {
    const response = await axios.get(`/quiz-results/scores/user/${userId}`);
    return response.data;
}

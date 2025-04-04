const ENV = import.meta.env.VITE_REACT_APP_ENV || "localhost";

const API_BASE_URLS = {
    localhost: "http://localhost:3000",
    staging: "https://staging.api.learning.edubot.it.com",
    production: "https://api.learning.edubot.it.com",
};

export const API_BASE_URL = API_BASE_URLS[ENV];

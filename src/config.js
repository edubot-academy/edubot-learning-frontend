

const ENV = import.meta.env.VITE_REACT_APP_ENV || "staging";

const API_BASE_URLS = {
    staging: "https://api.staging.learning.edubot.it.com/",
    production: "https://api.learning.edubot.it.com/",
};

export const API_BASE_URL = API_BASE_URLS[ENV];

// Authentication service to handle Keycloak OAuth2 login
const AUTH_CONFIG = {
    // Use API Gateway to proxy Keycloak requests to avoid CORS issues
    keycloakUrl: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:9092',
    realm: 'ehub-realm',
    clientId: 'web-client',
    gatewayUrl: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:9092'
};

class AuthService {
    constructor() {
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    async login(username, password) {
        const tokenUrl = `${AUTH_CONFIG.keycloakUrl}/realms/${AUTH_CONFIG.realm}/protocol/openid-connect/token`;

        const params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('client_id', AUTH_CONFIG.clientId);
        params.append('username', username);
        params.append('password', password);

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error_description || 'Login failed');
        }

        const data = await response.json();
        this.setTokens(data.access_token, data.refresh_token);

        // Decode user info from JWT token (avoids CORS issues with userinfo endpoint)
        this.decodeUserFromToken();

        return data;
    }

    decodeUserFromToken() {
        if (!this.accessToken) return null;

        try {
            // Decode JWT payload (base64)
            const payload = this.accessToken.split('.')[1];
            const decoded = JSON.parse(atob(payload));

            this.user = {
                username: decoded.preferred_username,
                email: decoded.email,
                sub: decoded.sub
            };
            localStorage.setItem('user', JSON.stringify(this.user));
        } catch (error) {
            console.error('Error decoding token:', error);
        }

        return this.user;
    }

    async fetchUserFromBackend() {
        // Get user details from the user-service (syncs if missing)
        try {
            const response = await fetch(`${AUTH_CONFIG.gatewayUrl}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (response.ok) {
                const backendUser = await response.json();
                this.user = { ...this.user, ...backendUser };
                localStorage.setItem('user', JSON.stringify(this.user));
            }
        } catch (error) {
            console.error('Error fetching user from backend:', error);
        }

        return this.user;
    }

    setTokens(accessToken, refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    isAuthenticated() {
        return !!this.accessToken;
    }

    getAccessToken() {
        return this.accessToken;
    }

    getUser() {
        return this.user;
    }
}

export default new AuthService();

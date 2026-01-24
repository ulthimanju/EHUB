import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.callbacks = new Map();
    }

    connect(onConnected, onError) {
        // Connect to the API Gateway's /ws endpoint which routes to user-service
        const gatewayUrl = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:9092';
        // Use factory function for SockJS to allow auto-reconnect
        this.stompClient = Stomp.over(() => new SockJS(`${gatewayUrl}/ws`));

        this.stompClient.connect({}, (frame) => {
            console.log('Connected: ' + frame);
            if (onConnected) onConnected();

            // Subscribe to global notifications
            this.subscribe('/topic/notifications', (message) => {
                console.log('Received notification:', message);
                this.notifyCallbacks('/topic/notifications', JSON.parse(message.body));
            });

        }, (error) => {
            console.error('WebSocket connection error:', error);
            if (onError) onError(error);
        });
    }

    subscribe(topic, callback) {
        if (!this.stompClient || !this.stompClient.connected) return;

        this.stompClient.subscribe(topic, (message) => {
            callback(message);
        });
    }

    registerCallback(topic, callback) {
        if (!this.callbacks.has(topic)) {
            this.callbacks.set(topic, []);
        }
        this.callbacks.get(topic).push(callback);
    }

    notifyCallbacks(topic, data) {
        if (this.callbacks.has(topic)) {
            this.callbacks.get(topic).forEach(cb => cb(data));
        }
    }

    sendMessage(destination, body) {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.send(destination, {}, JSON.stringify(body));
        }
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.disconnect();
        }
    }
}

export default new WebSocketService();

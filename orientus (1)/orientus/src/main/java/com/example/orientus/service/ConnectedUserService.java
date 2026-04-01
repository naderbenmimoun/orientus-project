package com.example.orientus.service;

import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ConnectedUserService {

    // Set des user IDs actuellement connectés via WebSocket
    private final Set<Long> connectedUsers = ConcurrentHashMap.newKeySet();

    public void userConnected(Long userId) {
        connectedUsers.add(userId);
    }

    public void userDisconnected(Long userId) {
        connectedUsers.remove(userId);
    }

    public boolean isUserOnline(Long userId) {
        return connectedUsers.contains(userId);
    }
}


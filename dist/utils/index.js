"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LONG_AUTHOR_FIELDS = exports.LIKE_FIELDS = exports.AUTHOR_FIELDS = void 0;
exports.AUTHOR_FIELDS = {
    id: true,
    email: true,
    avatar: true,
    firstName: true,
    lastName: true,
    isAdmin: true,
};
exports.LIKE_FIELDS = {
    id: true,
    avatar: true,
    email: true,
    firstName: true,
    lastName: true,
    bio: true,
    joinedAt: true,
    news: true,
    // isAdmin: true,
};
exports.LONG_AUTHOR_FIELDS = {
    id: true,
    avatar: true,
    email: true,
    firstName: true,
    lastName: true,
    bio: true,
    joinedAt: true,
    news: true,
    isAdmin: true,
    isDeactivated: true,
};

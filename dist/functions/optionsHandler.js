"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const db_1 = require("../utils/db");
const handler = async (event) => {
    const headers = (0, db_1.getHeaders)();
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            message: "CORS preflight request successful",
        }),
    };
};
exports.handler = handler;

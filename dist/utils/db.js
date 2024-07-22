"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeaders = void 0;
// export const getHeaders = () => ({
//   "Content-Type": "application/json",
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers":
//     "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent",
//   "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
//   "Access-Control-Allow-Credentials": true,
// });
const getHeaders = () => ({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
});
exports.getHeaders = getHeaders;

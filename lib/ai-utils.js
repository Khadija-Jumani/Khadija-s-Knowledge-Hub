"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromUrl = extractTextFromUrl;
if (typeof global !== 'undefined' && !global.DOMMatrix) {
    global.DOMMatrix = /** @class */ (function () {
        function DOMMatrix() {
        }
        return DOMMatrix;
    }());
}
var pdfParse = require('pdf-parse');
var jszip_1 = require("jszip");
/**
 * Fetches a file from a URL and extracts its text.
 * Currently supports PDF and raw text/markdown files.
 */
function extractTextFromUrl(url_1) {
    return __awaiter(this, arguments, void 0, function (url, title) {
        var absoluteUrl, baseUrl, response, arrayBuffer, buffer, contentType, pdfData, pdfError_1, rawString, filteredText, zip, loadedZip, documentXml, xmlStr, rawText, error_1;
        if (title === void 0) { title = "Document"; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 12, , 13]);
                    absoluteUrl = url;
                    if (url.startsWith("/")) {
                        baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                        absoluteUrl = "".concat(baseUrl).concat(url);
                    }
                    // absoluteUrl = encodeURI(absoluteUrl); // Removed: breaks already-encoded uploadthing URLs
                    console.log("Fetching PDF from URL:", absoluteUrl);
                    return [4 /*yield*/, fetch(absoluteUrl, { cache: "no-store" })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        console.warn("Failed to fetch file from ".concat(absoluteUrl, ": ").concat(response.statusText));
                        return [2 /*return*/, ""];
                    }
                    return [4 /*yield*/, response.arrayBuffer()];
                case 2:
                    arrayBuffer = _a.sent();
                    buffer = Buffer.from(arrayBuffer);
                    contentType = response.headers.get("Content-Type") || "";
                    if (!(contentType.includes("application/pdf") || url.toLowerCase().endsWith(".pdf"))) return [3 /*break*/, 7];
                    console.log("Extracting text from PDF using pdf-parse...");
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, pdfParse(buffer)];
                case 4:
                    pdfData = _a.sent();
                    if (pdfData && pdfData.text && pdfData.text.trim().length > 50) {
                        return [2 /*return*/, pdfData.text];
                    }
                    return [3 /*break*/, 6];
                case 5:
                    pdfError_1 = _a.sent();
                    console.error("pdf-parse failed:", pdfError_1);
                    return [3 /*break*/, 6];
                case 6:
                    console.log("Using raw regex PDF fallback extraction...");
                    rawString = buffer.toString('utf8');
                    filteredText = rawString.replace(/[\x00-\x1F\x7F-\xFF]/g, ' ')
                        .replace(/[\\/\(\)\[\]<>{}=+-]/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                    return [2 /*return*/, filteredText.length > 50 ? filteredText : ""];
                case 7:
                    if (!(contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml") ||
                        url.toLowerCase().endsWith(".docx"))) return [3 /*break*/, 10];
                    console.log("Extracting text from DOCX file...");
                    zip = new jszip_1.default();
                    return [4 /*yield*/, zip.loadAsync(buffer)];
                case 8:
                    loadedZip = _a.sent();
                    documentXml = loadedZip.file("word/document.xml");
                    if (!documentXml) {
                        throw new Error("Invalid DOCX format: missing word/document.xml");
                    }
                    return [4 /*yield*/, documentXml.async("string")];
                case 9:
                    xmlStr = _a.sent();
                    rawText = xmlStr.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
                    if (rawText.length > 50) {
                        return [2 /*return*/, rawText];
                    }
                    return [2 /*return*/, ""];
                case 10:
                    if (contentType.includes("text/plain") ||
                        contentType.includes("text/markdown") ||
                        url.toLowerCase().endsWith(".txt") ||
                        url.toLowerCase().endsWith(".md")) {
                        return [2 /*return*/, buffer.toString("utf-8")];
                    }
                    else {
                        console.warn("Unsupported content type ".concat(contentType, " for file ").concat(url, ". Cannot extract text."));
                        return [2 /*return*/, ""]; // Gracefully skip unsupported files like ZIP archives
                    }
                    _a.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_1 = _a.sent();
                    console.error("Error extracting text:", error_1);
                    return [2 /*return*/, ""]; // Bubble up empty string instead of crashing the whole quiz generator
                case 13: return [2 /*return*/];
            }
        });
    });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_1 = require("../controllers/attendance.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post('/sessions/start', (0, auth_middleware_1.authorize)('faculty'), attendance_controller_1.startSession);
router.get('/sessions', (0, auth_middleware_1.authorize)('faculty'), attendance_controller_1.getFacultySessions);
router.get('/sessions/:sessionId', auth_middleware_1.authenticate, attendance_controller_1.getSession);
router.post('/sessions/:sessionId/mark', (0, auth_middleware_1.authorize)('faculty'), attendance_controller_1.markAttendance);
router.put('/sessions/:sessionId/close', (0, auth_middleware_1.authorize)('faculty'), attendance_controller_1.closeSession);
router.get('/class/:classId/report', (0, auth_middleware_1.authorize)('faculty'), attendance_controller_1.getClassAttendanceReport);
router.put('/:id/manual-correct', (0, auth_middleware_1.authorize)('faculty'), attendance_controller_1.manualCorrect);
exports.default = router;
//# sourceMappingURL=attendance.routes.js.map
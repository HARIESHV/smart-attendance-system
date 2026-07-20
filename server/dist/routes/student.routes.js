"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("../controllers/student.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/profile', (0, auth_middleware_1.authorize)('student'), student_controller_1.getStudentProfile);
router.post('/face-descriptors', (0, auth_middleware_1.authorize)('student'), student_controller_1.saveFaceDescriptors);
router.get('/my-attendance', (0, auth_middleware_1.authorize)('student'), student_controller_1.getMyAttendance);
// Faculty can access these
router.get('/all', (0, auth_middleware_1.authorize)('faculty'), student_controller_1.getAllStudents);
router.get('/all-descriptors', (0, auth_middleware_1.authorize)('faculty'), student_controller_1.getAllDescriptors);
exports.default = router;
//# sourceMappingURL=student.routes.js.map